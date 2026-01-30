import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';
import { Permissions } from '../../common/decorators';

@ApiTags('角色管理')
@ApiBearerAuth('access-token')
@Controller('system/role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({ summary: '创建角色' })
  @Permissions('system:role:add')
  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @ApiOperation({ summary: '角色列表（分页）' })
  @Permissions('system:role:list')
  @Get()
  findAll(@Query() query: QueryRoleDto) {
    return this.roleService.findAll(query);
  }

  @ApiOperation({ summary: '角色列表（全部）' })
  @Get('list')
  findAllList() {
    return this.roleService.findAllList();
  }

  @ApiOperation({ summary: '角色详情' })
  @Permissions('system:role:list')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.findOne(id);
  }

  @ApiOperation({ summary: '更新角色' })
  @Permissions('system:role:edit')
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }

  @ApiOperation({ summary: '删除角色' })
  @Permissions('system:role:delete')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.remove(id);
  }

  @ApiOperation({ summary: '批量删除角色' })
  @Permissions('system:role:delete')
  @Delete()
  batchRemove(@Body() ids: number[]) {
    return this.roleService.batchRemove(ids);
  }

  @ApiOperation({ summary: '更新角色状态' })
  @Permissions('system:role:edit')
  @Put(':id/status')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body('status') status: number) {
    return this.roleService.updateStatus(id, status);
  }
}
