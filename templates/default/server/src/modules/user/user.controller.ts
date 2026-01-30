import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Permissions } from '../../common/decorators';

@ApiTags('用户管理')
@ApiBearerAuth('access-token')
@Controller('system/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '创建用户' })
  @Permissions('system:user:add')
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @ApiOperation({ summary: '用户列表' })
  @Permissions('system:user:list')
  @Get()
  findAll(@Query() query: QueryUserDto) {
    return this.userService.findAll(query);
  }

  @ApiOperation({ summary: '用户详情' })
  @Permissions('system:user:list')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @ApiOperation({ summary: '更新用户' })
  @Permissions('system:user:edit')
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @ApiOperation({ summary: '删除用户' })
  @Permissions('system:user:delete')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }

  @ApiOperation({ summary: '批量删除用户' })
  @Permissions('system:user:delete')
  @Delete()
  batchRemove(@Body() ids: number[]) {
    return this.userService.batchRemove(ids);
  }

  @ApiOperation({ summary: '重置密码' })
  @Permissions('system:user:resetPwd')
  @Put(':id/reset-password')
  resetPassword(@Param('id', ParseIntPipe) id: number, @Body() dto: ResetPasswordDto) {
    return this.userService.resetPassword(id, dto.password);
  }

  @ApiOperation({ summary: '更新用户状态' })
  @Permissions('system:user:edit')
  @Put(':id/status')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body('status') status: number) {
    return this.userService.updateStatus(id, status);
  }
}
