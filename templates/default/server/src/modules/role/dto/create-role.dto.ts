import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, IsArray, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ description: '角色名称' })
  @IsString()
  @IsNotEmpty({ message: '角色名称不能为空' })
  @MaxLength(50, { message: '角色名称最多50个字符' })
  name: string;

  @ApiProperty({ description: '角色编码' })
  @IsString()
  @IsNotEmpty({ message: '角色编码不能为空' })
  @MaxLength(50, { message: '角色编码最多50个字符' })
  code: string;

  @ApiPropertyOptional({ description: '排序', default: 0 })
  @IsInt()
  @IsOptional()
  sort?: number;

  @ApiPropertyOptional({ description: '状态: 0禁用 1正常', default: 1 })
  @IsInt()
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '数据权限: 1全部 2本部门及以下 3本部门 4仅本人 5自定义', default: 1 })
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
