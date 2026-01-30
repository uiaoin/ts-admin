import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { join, relative, extname } from 'path';
import { unlinkSync, existsSync, readFileSync } from 'fs';
import * as qiniu from 'qiniu';

type StorageType = 'local' | 'qiniu' | 'oss' | 'cos';

@Injectable()
export class FileService {
  private readonly uploadPath: string;
  private readonly storage: StorageType;
  private qiniuMac: qiniu.auth.digest.Mac | null = null;
  private qiniuConfig: qiniu.conf.Config | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.uploadPath = this.configService.get('FILE_LOCAL_PATH', './uploads');
    this.storage = this.configService.get('FILE_STORAGE', 'local') as StorageType;

    // 初始化七牛云配置
    if (this.storage === 'qiniu') {
      this.initQiniu();
    }
  }

  /**
   * 初始化七牛云
   */
  private initQiniu() {
    const accessKey = this.configService.get('QINIU_ACCESS_KEY');
    const secretKey = this.configService.get('QINIU_SECRET_KEY');

    if (!accessKey || !secretKey) {
      console.warn('七牛云配置不完整，将使用本地存储');
      return;
    }

    this.qiniuMac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    this.qiniuConfig = new qiniu.conf.Config();
    
    // 根据区域配置
    const zone = this.configService.get('QINIU_ZONE', 'z0');
    const zoneMap: Record<string, qiniu.conf.Zone> = {
      z0: qiniu.zone.Zone_z0, // 华东
      z1: qiniu.zone.Zone_z1, // 华北
      z2: qiniu.zone.Zone_z2, // 华南
      na0: qiniu.zone.Zone_na0, // 北美
      as0: qiniu.zone.Zone_as0, // 东南亚
    };
    this.qiniuConfig.zone = zoneMap[zone] || qiniu.zone.Zone_z0;
  }

  /**
   * 保存文件记录
   */
  async saveFile(file: Express.Multer.File, userId?: number) {
    let url: string;
    let path: string;
    let storage: string = this.storage;

    if (this.storage === 'qiniu' && this.qiniuMac) {
      // 上传到七牛云
      const result = await this.uploadToQiniu(file);
      url = result.url;
      path = result.key;
      storage = 'qiniu';
    } else {
      // 本地存储
      const relativePath = relative(join(process.cwd(), this.uploadPath), file.path);
      url = `/uploads/${relativePath.replace(/\\/g, '/')}`;
      path = relativePath;
      storage = 'local';
    }

    const fileRecord = await this.prisma.file.create({
      data: {
        name: file.originalname,
        path,
        url,
        size: file.size,
        mimeType: file.mimetype,
        storage,
        userId,
      },
    });

    return fileRecord;
  }

  /**
   * 上传到七牛云
   */
  private async uploadToQiniu(file: Express.Multer.File): Promise<{ url: string; key: string }> {
    const bucket = this.configService.get('QINIU_BUCKET');
    const domain = this.configService.get('QINIU_DOMAIN');

    if (!bucket || !domain) {
      throw new BadRequestException('七牛云配置不完整');
    }

    // 生成文件名
    const date = new Date();
    const dir = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    const ext = extname(file.originalname);
    const key = `${dir}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;

    // 生成上传凭证
    const putPolicy = new qiniu.rs.PutPolicy({
      scope: `${bucket}:${key}`,
    });
    const uploadToken = putPolicy.uploadToken(this.qiniuMac!);

    // 上传文件
    const formUploader = new qiniu.form_up.FormUploader(this.qiniuConfig!);
    const putExtra = new qiniu.form_up.PutExtra();

    return new Promise((resolve, reject) => {
      // 如果是通过multer已经保存到本地的文件
      if (file.path) {
        formUploader.putFile(uploadToken, key, file.path, putExtra, (err, body, info) => {
          // 上传完成后删除本地临时文件
          if (existsSync(file.path)) {
            unlinkSync(file.path);
          }

          if (err) {
            reject(new BadRequestException(`七牛云上传失败: ${err.message}`));
            return;
          }

          if (info.statusCode === 200) {
            const url = `${domain.replace(/\/$/, '')}/${key}`;
            resolve({ url, key });
          } else {
            reject(new BadRequestException(`七牛云上传失败: ${body?.error || '未知错误'}`));
          }
        });
      } else if (file.buffer) {
        // 如果是内存中的buffer
        formUploader.put(uploadToken, key, file.buffer, putExtra, (err, body, info) => {
          if (err) {
            reject(new BadRequestException(`七牛云上传失败: ${err.message}`));
            return;
          }

          if (info.statusCode === 200) {
            const url = `${domain.replace(/\/$/, '')}/${key}`;
            resolve({ url, key });
          } else {
            reject(new BadRequestException(`七牛云上传失败: ${body?.error || '未知错误'}`));
          }
        });
      }
    });
  }

  /**
   * 批量保存文件记录
   */
  async saveFiles(files: Express.Multer.File[], userId?: number) {
    const results = await Promise.all(files.map((file) => this.saveFile(file, userId)));
    return results;
  }

  /**
   * 查询文件列表
   */
  async findAll(query: { page?: number; pageSize?: number; name?: string; storage?: string }) {
    const { page = 1, pageSize = 10, name, storage } = query;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (name) {
      where.name = { contains: name };
    }
    if (storage) {
      where.storage = storage;
    }

    const [list, total] = await Promise.all([
      this.prisma.file.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.file.count({ where }),
    ]);

    return { list, total, page, pageSize };
  }

  /**
   * 查询单个文件
   */
  async findOne(id: number) {
    const file = await this.prisma.file.findUnique({ where: { id } });
    if (!file) {
      throw new NotFoundException('文件不存在');
    }
    return file;
  }

  /**
   * 删除文件
   */
  async remove(id: number) {
    const file = await this.prisma.file.findUnique({ where: { id } });
    if (!file) {
      throw new NotFoundException('文件不存在');
    }

    // 根据存储类型删除文件
    await this.deleteFileFromStorage(file);

    // 删除数据库记录
    await this.prisma.file.delete({ where: { id } });

    return true;
  }

  /**
   * 从存储中删除文件
   */
  private async deleteFileFromStorage(file: { storage: string; path: string }) {
    if (file.storage === 'local') {
      // 删除本地文件
      const fullPath = join(process.cwd(), this.uploadPath, file.path);
      if (existsSync(fullPath)) {
        unlinkSync(fullPath);
      }
    } else if (file.storage === 'qiniu' && this.qiniuMac) {
      // 删除七牛云文件
      await this.deleteFromQiniu(file.path);
    }
    // 其他存储类型可以在这里扩展
  }

  /**
   * 从七牛云删除文件
   */
  private async deleteFromQiniu(key: string): Promise<void> {
    const bucket = this.configService.get('QINIU_BUCKET');
    if (!bucket) return;

    const bucketManager = new qiniu.rs.BucketManager(this.qiniuMac!, this.qiniuConfig!);

    return new Promise((resolve, reject) => {
      bucketManager.delete(bucket, key, (err, respBody, respInfo) => {
        if (err) {
          console.error('七牛云删除失败:', err);
          // 删除失败不阻塞流程
        }
        resolve();
      });
    });
  }

  /**
   * 批量删除文件
   */
  async batchRemove(ids: number[]) {
    const files = await this.prisma.file.findMany({
      where: { id: { in: ids } },
    });

    // 删除存储中的文件
    for (const file of files) {
      await this.deleteFileFromStorage(file);
    }

    // 删除数据库记录
    await this.prisma.file.deleteMany({
      where: { id: { in: ids } },
    });

    return true;
  }

  /**
   * 获取上传凭证（前端直传用）
   */
  getUploadToken(key?: string): { token: string; key: string; domain: string } | null {
    if (this.storage !== 'qiniu' || !this.qiniuMac) {
      return null;
    }

    const bucket = this.configService.get('QINIU_BUCKET');
    const domain = this.configService.get('QINIU_DOMAIN');

    if (!bucket || !domain) {
      return null;
    }

    // 生成文件名
    const date = new Date();
    const dir = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    const fileKey = key || `${dir}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const putPolicy = new qiniu.rs.PutPolicy({
      scope: `${bucket}:${fileKey}`,
      expires: 3600, // 1小时有效期
    });

    return {
      token: putPolicy.uploadToken(this.qiniuMac),
      key: fileKey,
      domain,
    };
  }
}
