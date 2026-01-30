import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DeptService } from './dept.service';
import { CreateDeptDto } from './dto/create-dept.dto';
import { UpdateDeptDto } from './dto/update-dept.dto';
import { QueryDeptDto } from './dto/query-dept.dto';
import { Permissions } from '../../common/decorators';

@ApiTags('部门管理')
@ApiBearerAuth('access-token')
@Controller('system/dept')
export class DeptController {
  constructor(private readonly deptService: DeptService) {}

  @ApiOperation({ summary: '创建部门' })
  @Permissions('system:dept:add')
  @Post()
  create(@Body() createDeptDto: CreateDeptDto) {
    return this.deptService.create(createDeptDto);
  }

  @ApiOperation({ summary: '部门列表（树形）' })
  @Permissions('system:dept:list')
  @Get()
  findAll(@Query() query: QueryDeptDto) {
    return this.deptService.findAll(query);
  }

  @ApiOperation({ summary: '部门下拉树' })
  @Get('tree-select')
  findTreeSelect() {
    return this.deptService.findTreeSelect();
  }

  @ApiOperation({ summary: '部门详情' })
  @Permissions('system:dept:list')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.deptService.findOne(id);
  }

  @ApiOperation({ summary: '更新部门' })
  @Permissions('system:dept:edit')
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDeptDto: UpdateDeptDto) {
    return this.deptService.update(id, updateDeptDto);
  }

  @ApiOperation({ summary: '删除部门' })
  @Permissions('system:dept:delete')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.deptService.remove(id);
  }
}
