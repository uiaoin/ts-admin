import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsArray, MaxLength } from 'class-validator';

export class UpdateRoleDto {
  @ApiPropertyOptional({ description: '角色名称' })
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: '角色名称最多50个字符' })
  name?: string;

  @ApiPropertyOptional({ description: '角色编码' })
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: '角色编码最多50个字符' })
  code?: string;

  @ApiPropertyOptional({ description: '排序' })
  @IsInt()
  @IsOptional()
  sort?: number;

  @ApiPropertyOptional({ description: '状态: 0禁用 1正常' })
  @IsInt()
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '数据权限: 1全部 2本部门及以下 3本部门 4仅本人 5自定义' })
  @IsInt()
  @IsOptional()
  dataScope?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;

  @ApiPropertyOptional({ description: '菜单ID列表', type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  menuIds?: number[];

  @ApiPropertyOptional({ description: '部门ID列表（自定义数据权限）', type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  deptIds?: number[];
}
