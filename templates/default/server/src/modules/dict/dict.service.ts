import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { CreateDictTypeDto } from './dto/create-dict-type.dto';
import { UpdateDictTypeDto } from './dto/update-dict-type.dto';
import { QueryDictTypeDto } from './dto/query-dict-type.dto';
import { CreateDictDataDto } from './dto/create-dict-data.dto';
import { UpdateDictDataDto } from './dto/update-dict-data.dto';
import { QueryDictDataDto } from './dto/query-dict-data.dto';

@Injectable()
export class DictService {
  private readonly DICT_CACHE_PREFIX = 'dict:';

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  // ==================== 字典类型 ====================

  /**
   * 创建字典类型
   */
  async createType(dto: CreateDictTypeDto) {
    const exist = await this.prisma.dictType.findUnique({
      where: { type: dto.type },
    });

    if (exist) {
      throw new BadRequestException('字典类型已存在');
    }

    return this.prisma.dictType.create({ data: dto });
  }

  /**
   * 分页查询字典类型
   */
  async findAllTypes(query: QueryDictTypeDto) {
    const { page = 1, pageSize = 10, name, type, status } = query;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (name) where.name = { contains: name };
    if (type) where.type = { contains: type };
    if (status !== undefined) where.status = status;

    const [list, total] = await Promise.all([
      this.prisma.dictType.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dictType.count({ where }),
    ]);

    return { list, total, page, pageSize };
  }

  /**
   * 查询单个字典类型
   */
  async findOneType(id: number) {
    const dictType = await this.prisma.dictType.findUnique({
      where: { id },
    });

    if (!dictType) {
      throw new NotFoundException('字典类型不存在');
    }

    return dictType;
  }

  /**
   * 更新字典类型
   */
  async updateType(id: number, dto: UpdateDictTypeDto) {
    const exist = await this.prisma.dictType.findUnique({ where: { id } });
    if (!exist) {
      throw new NotFoundException('字典类型不存在');
    }

    if (dto.type && dto.type !== exist.type) {
      const duplicate = await this.prisma.dictType.findUnique({
        where: { type: dto.type },
      });
      if (duplicate) {
        throw new BadRequestException('字典类型已存在');
      }

      // 同步更新字典数据的dictType
      await this.prisma.dictData.updateMany({
        where: { dictType: exist.type },
        data: { dictType: dto.type },
      });

      // 清除缓存
      await this.redisService.del(`${this.DICT_CACHE_PREFIX}${exist.type}`);
    }

    const result = await this.prisma.dictType.update({
      where: { id },
      data: dto,
    });

    // 清除缓存
    await this.redisService.del(`${this.DICT_CACHE_PREFIX}${result.type}`);

    return result;
  }

  /**
   * 删除字典类型
   */
  async removeType(id: number) {
    const dictType = await this.prisma.dictType.findUnique({ where: { id } });
    if (!dictType) {
      throw new NotFoundException('字典类型不存在');
    }

    // 删除关联的字典数据
    await this.prisma.dictData.deleteMany({
      where: { dictType: dictType.type },
    });

    await this.prisma.dictType.delete({ where: { id } });

    // 清除缓存
    await this.redisService.del(`${this.DICT_CACHE_PREFIX}${dictType.type}`);

    return true;
  }

  // ==================== 字典数据 ====================

  /**
   * 创建字典数据
   */
  async createData(dto: CreateDictDataDto) {
    const result = await this.prisma.dictData.create({ data: dto });

    // 清除缓存
    await this.redisService.del(`${this.DICT_CACHE_PREFIX}${dto.dictType}`);

    return result;
  }

  /**
   * 查询字典数据（分页）
   */
  async findAllData(query: QueryDictDataDto) {
    const { page = 1, pageSize = 10, dictType, label, status } = query;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (dictType) where.dictType = dictType;
    if (label) where.label = { contains: label };
    if (status !== undefined) where.status = status;

    const [list, total] = await Promise.all([
      this.prisma.dictData.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ sort: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.dictData.count({ where }),
    ]);

    return { list, total, page, pageSize };
  }

  /**
   * 根据字典类型获取字典数据（带缓存）
   */
  async findDataByType(type: string) {
    // 先从缓存获取
    const cached = await this.redisService.getJson<any[]>(`${this.DICT_CACHE_PREFIX}${type}`);
    if (cached) {
      return cached;
    }

    // 从数据库获取
    const list = await this.prisma.dictData.findMany({
      where: { dictType: type, status: 1 },
      orderBy: [{ sort: 'asc' }],
      select: {
        label: true,
        value: true,
        isDefault: true,
      },
    });

    // 缓存1小时
    await this.redisService.setJson(`${this.DICT_CACHE_PREFIX}${type}`, list, 3600);

    return list;
  }

  /**
   * 查询单个字典数据
   */
  async findOneData(id: number) {
    const dictData = await this.prisma.dictData.findUnique({ where: { id } });
    if (!dictData) {
      throw new NotFoundException('字典数据不存在');
    }
    return dictData;
  }

  /**
   * 更新字典数据
   */
  async updateData(id: number, dto: UpdateDictDataDto) {
    const exist = await this.prisma.dictData.findUnique({ where: { id } });
    if (!exist) {
      throw new NotFoundException('字典数据不存在');
    }

    const result = await this.prisma.dictData.update({
      where: { id },
      data: dto,
    });

    // 清除缓存
    await this.redisService.del(`${this.DICT_CACHE_PREFIX}${result.dictType}`);

    return result;
  }

  /**
   * 删除字典数据
   */
  async removeData(id: number) {
    const dictData = await this.prisma.dictData.findUnique({ where: { id } });
    if (!dictData) {
      throw new NotFoundException('字典数据不存在');
    }

    await this.prisma.dictData.delete({ where: { id } });

    // 清除缓存
    await this.redisService.del(`${this.DICT_CACHE_PREFIX}${dictData.dictType}`);

    return true;
  }

  /**
   * 刷新字典缓存
   */
  async refreshCache() {
    await this.redisService.delByPattern(`${this.DICT_CACHE_PREFIX}*`);
    return true;
  }
}
