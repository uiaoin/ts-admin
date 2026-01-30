import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { QueryMenuDto } from './dto/query-menu.dto';
import { Permissions } from '../../common/decorators';

@ApiTags('菜单管理')
@ApiBearerAuth('access-token')
@Controller('system/menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @ApiOperation({ summary: '创建菜单' })
  @Permissions('system:menu:add')
  @Post()
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menuService.create(createMenuDto);
  }

  @ApiOperation({ summary: '菜单列表（树形）' })
  @Permissions('system:menu:list')
  @Get()
  findAll(@Query() query: QueryMenuDto) {
    return this.menuService.findAll(query);
  }

  @ApiOperation({ summary: '菜单下拉树' })
  @Get('tree-select')
  findTreeSelect() {
    return this.menuService.findTreeSelect();
  }

  @ApiOperation({ summary: '菜单详情' })
  @Permissions('system:menu:list')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.findOne(id);
  }

  @ApiOperation({ summary: '更新菜单' })
  @Permissions('system:menu:edit')
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateMenuDto: UpdateMenuDto) {
    return this.menuService.update(id, updateMenuDto);
  }

  @ApiOperation({ summary: '删除菜单' })
  @Permissions('system:menu:delete')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.remove(id);
  }
}
