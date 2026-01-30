import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DictService } from './dict.service';
import { CreateDictTypeDto } from './dto/create-dict-type.dto';
import { UpdateDictTypeDto } from './dto/update-dict-type.dto';
import { QueryDictTypeDto } from './dto/query-dict-type.dto';
import { CreateDictDataDto } from './dto/create-dict-data.dto';
import { UpdateDictDataDto } from './dto/update-dict-data.dto';
import { QueryDictDataDto } from './dto/query-dict-data.dto';
import { Permissions } from '../../common/decorators';

@ApiTags('字典管理')
@ApiBearerAuth('access-token')
@Controller('system/dict')
export class DictController {
  constructor(private readonly dictService: DictService) {}

  // ==================== 字典类型 ====================

  @ApiOperation({ summary: '创建字典类型' })
  @Permissions('system:dict:add')
  @Post('type')
  createType(@Body() dto: CreateDictTypeDto) {
    return this.dictService.createType(dto);
  }

  @ApiOperation({ summary: '字典类型列表' })
  @Permissions('system:dict:list')
  @Get('type')
  findAllTypes(@Query() query: QueryDictTypeDto) {
    return this.dictService.findAllTypes(query);
  }

  @ApiOperation({ summary: '字典类型详情' })
  @Permissions('system:dict:list')
  @Get('type/:id')
  findOneType(@Param('id', ParseIntPipe) id: number) {
    return this.dictService.findOneType(id);
  }

  @ApiOperation({ summary: '更新字典类型' })
  @Permissions('system:dict:edit')
  @Put('type/:id')
  updateType(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDictTypeDto) {
    return this.dictService.updateType(id, dto);
  }

  @ApiOperation({ summary: '删除字典类型' })
  @Permissions('system:dict:delete')
  @Delete('type/:id')
  removeType(@Param('id', ParseIntPipe) id: number) {
    return this.dictService.removeType(id);
  }

  // ==================== 字典数据 ====================

  @ApiOperation({ summary: '创建字典数据' })
  @Permissions('system:dict:add')
  @Post('data')
  createData(@Body() dto: CreateDictDataDto) {
    return this.dictService.createData(dto);
  }

  @ApiOperation({ summary: '字典数据列表（分页）' })
  @Permissions('system:dict:list')
  @Get('data')
  findAllData(@Query() query: QueryDictDataDto) {
    return this.dictService.findAllData(query);
  }

  @ApiOperation({ summary: '根据字典类型获取数据' })
  @Get('data/type/:type')
  findDataByType(@Param('type') type: string) {
    return this.dictService.findDataByType(type);
  }

  @ApiOperation({ summary: '字典数据详情' })
  @Permissions('system:dict:list')
  @Get('data/:id')
  findOneData(@Param('id', ParseIntPipe) id: number) {
    return this.dictService.findOneData(id);
  }

  @ApiOperation({ summary: '更新字典数据' })
  @Permissions('system:dict:edit')
  @Put('data/:id')
  updateData(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDictDataDto) {
    return this.dictService.updateData(id, dto);
  }

  @ApiOperation({ summary: '删除字典数据' })
  @Permissions('system:dict:delete')
  @Delete('data/:id')
  removeData(@Param('id', ParseIntPipe) id: number) {
    return this.dictService.removeData(id);
  }

  @ApiOperation({ summary: '刷新字典缓存' })
  @Permissions('system:dict:edit')
  @Delete('refresh-cache')
  refreshCache() {
    return this.dictService.refreshCache();
  }
}
