import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, MaxLength } from 'class-validator';

export class UpdateMenuDto {
  @ApiPropertyOptional({ description: '父菜单ID' })
  @IsInt()
  @IsOptional()
  parentId?: number;

  @ApiPropertyOptional({ description: '菜单名称' })
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: '菜单名称最多50个字符' })
  name?: string;

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

  @ApiPropertyOptional({ description: '菜单类型: 0目录 1菜单 2按钮' })
  @IsInt()
  @IsOptional()
  type?: number;

  @ApiPropertyOptional({ description: '图标' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ description: '排序' })
  @IsInt()
  @IsOptional()
  sort?: number;

  @ApiPropertyOptional({ description: '是否显示: 0隐藏 1显示' })
  @IsInt()
  @IsOptional()
  visible?: number;

  @ApiPropertyOptional({ description: '状态: 0禁用 1正常' })
  @IsInt()
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '是否外链: 0否 1是' })
  @IsInt()
  @IsOptional()
  isExternal?: number;

  @ApiPropertyOptional({ description: '是否缓存: 0否 1是' })
  @IsInt()
  @IsOptional()
  isCache?: number;
}
