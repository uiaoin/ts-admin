import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsInt, IsArray, MinLength, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: '用户名' })
  @IsString()
  @IsOptional()
  @MinLength(2, { message: '用户名至少2个字符' })
  @MaxLength(50, { message: '用户名最多50个字符' })
  username?: string;

  @ApiPropertyOptional({ description: '昵称' })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiPropertyOptional({ description: '邮箱' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: '手机号' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: '头像' })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({ description: '性别: 0未知 1男 2女' })
  @IsInt()
  @IsOptional()
  gender?: number;

  @ApiPropertyOptional({ description: '状态: 0禁用 1正常' })
  @IsInt()
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '部门ID' })
  @IsInt()
  @IsOptional()
  deptId?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;

  @ApiPropertyOptional({ description: '角色ID列表', type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  roleIds?: number[];
}
