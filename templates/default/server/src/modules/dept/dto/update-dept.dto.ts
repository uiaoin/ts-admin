import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsEmail, MaxLength } from 'class-validator';

export class UpdateDeptDto {
  @ApiPropertyOptional({ description: '父部门ID' })
  @IsInt()
  @IsOptional()
  parentId?: number;

  @ApiPropertyOptional({ description: '部门名称' })
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: '部门名称最多50个字符' })
  name?: string;

  @ApiPropertyOptional({ description: '排序' })
  @IsInt()
  @IsOptional()
  sort?: number;

  @ApiPropertyOptional({ description: '负责人' })
  @IsString()
  @IsOptional()
  leader?: string;

  @ApiPropertyOptional({ description: '联系电话' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: '邮箱' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: '状态: 0禁用 1正常' })
  @IsInt()
  @IsOptional()
  status?: number;
}
