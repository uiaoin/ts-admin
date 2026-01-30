import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, IsEmail, MaxLength } from 'class-validator';

export class CreateDeptDto {
  @ApiPropertyOptional({ description: '父部门ID', default: 0 })
  @IsInt()
  @IsOptional()
  parentId?: number;

  @ApiProperty({ description: '部门名称' })
  @IsString()
  @IsNotEmpty({ message: '部门名称不能为空' })
  @MaxLength(50, { message: '部门名称最多50个字符' })
  name: string;

  @ApiPropertyOptional({ description: '排序', default: 0 })
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

  @ApiPropertyOptional({ description: '状态: 0禁用 1正常', default: 1 })
  @IsInt()
  @IsOptional()
  status?: number;
}
