import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Body,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileService } from './file.service';
import { CurrentUser } from '../../common/decorators';

@ApiTags('文件管理')
@ApiBearerAuth('access-token')
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @ApiOperation({ summary: '上传单个文件' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('sub') userId: number,
  ) {
    return this.fileService.saveFile(file, userId);
  }

  @ApiOperation({ summary: '上传多个文件' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @Post('uploads')
  @UseInterceptors(FilesInterceptor('files', 10))
  uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser('sub') userId: number,
  ) {
    return this.fileService.saveFiles(files, userId);
  }

  @ApiOperation({ summary: '获取上传凭证（七牛云直传）' })
  @Get('upload-token')
  getUploadToken(@Query('key') key?: string) {
    const result = this.fileService.getUploadToken(key);
    if (!result) {
      return { message: '当前未启用七牛云存储' };
    }
    return result;
  }

  @ApiOperation({ summary: '文件列表' })
  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('name') name?: string,
    @Query('storage') storage?: string,
  ) {
    return this.fileService.findAll({ page, pageSize, name, storage });
  }

  @ApiOperation({ summary: '文件详情' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fileService.findOne(id);
  }

  @ApiOperation({ summary: '删除文件' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.fileService.remove(id);
  }

  @ApiOperation({ summary: '批量删除文件' })
  @Delete()
  batchRemove(@Body() ids: number[]) {
    return this.fileService.batchRemove(ids);
  }
}
