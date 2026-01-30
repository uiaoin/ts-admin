import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, MaxLength } from 'class-validator';

export class CreateMenuDto {
  @ApiPropertyOptional({ description: '父菜单ID', default: 0 })
  @IsInt()
  @IsOptional()
  parentId?: number;

  @ApiProperty({ description: '菜单名称' })
  @IsString()
  @IsNotEmpty({ message: '菜单名称不能为空' })
  @MaxLength(50, { message: '菜单名称最多50个字符' })
  name: string;

  @ApiPropertyOptional({ description: '路由地址' })
  @IsString()
  @IsOptional()
  path?: string;

  @ApiPropertyOptional({ description: '组件路径' })
  @IsString()
  @IsOptional()
  component?: string;

  @ApiPropertyOptional({ description: '重定向地址' })
  @IsString()
  @IsOptional()
  redirect?: string;

  @ApiPropertyOptional({ description: '权限标识' })
  @IsString()
  @IsOptional()
  permission?: string;

  @ApiProperty({ description: '菜单类型: 0目录 1菜单 2按钮' })
  @IsInt()
  @IsNotEmpty({ message: '菜单类型不能为空' })
  type: number;

  @ApiPropertyOptional({ description: '图标' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ description: '排序', default: 0 })
  @IsInt()
  @IsOptional()
  sort?: number;

  @ApiPropertyOptional({ description: '是否显示: 0隐藏 1显示', default: 1 })
  @IsInt()
  @IsOptional()
  visible?: number;

  @ApiPropertyOptional({ description: '状态: 0禁用 1正常', default: 1 })
  @IsInt()
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '是否外链: 0否 1是', default: 0 })
  @IsInt()
  @IsOptional()
  isExternal?: number;

  @ApiPropertyOptional({ description: '是否缓存: 0否 1是', default: 1 })
  @IsInt()
  @IsOptional()
  isCache?: number;
}
