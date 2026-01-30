import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { FileController } from './file.controller';
import { FileService } from './file.service';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uploadPath = configService.get('FILE_LOCAL_PATH', './uploads');
        const absolutePath = join(process.cwd(), uploadPath);

        // 确保上传目录存在
        if (!existsSync(absolutePath)) {
          mkdirSync(absolutePath, { recursive: true });
        }

        return {
          storage: diskStorage({
            destination: (req, file, cb) => {
              // 按日期分目录
              const date = new Date();
              const datePath = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
              const fullPath = join(absolutePath, datePath);

              if (!existsSync(fullPath)) {
                mkdirSync(fullPath, { recursive: true });
              }

              cb(null, fullPath);
            },
            filename: (req, file, cb) => {
              // 生成唯一文件名
              const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
              const ext = extname(file.originalname);
              cb(null, `${uniqueSuffix}${ext}`);
            },
          }),
          limits: {
            fileSize: configService.get('FILE_MAX_SIZE', 10485760), // 默认10MB
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}
