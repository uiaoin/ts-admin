import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, MaxLength } from 'class-validator';

export class CreateDictDataDto {
  @ApiProperty({ description: '字典类型' })
  @IsString()
  @IsNotEmpty({ message: '字典类型不能为空' })
  @MaxLength(100, { message: '字典类型最多100个字符' })
  dictType: string;

  @ApiProperty({ description: '字典标签' })
  @IsString()
  @IsNotEmpty({ message: '字典标签不能为空' })
  @MaxLength(100, { message: '字典标签最多100个字符' })
  label: string;

  @ApiProperty({ description: '字典值' })
  @IsString()
  @IsNotEmpty({ message: '字典值不能为空' })
  @MaxLength(100, { message: '字典值最多100个字符' })
  value: string;

  @ApiPropertyOptional({ description: '排序', default: 0 })
  @IsInt()
  @IsOptional()
  sort?: number;

  @ApiPropertyOptional({ description: '状态: 0禁用 1正常', default: 1 })
  @IsInt()
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '是否默认: 0否 1是', default: 0 })
  @IsInt()
  @IsOptional()
  isDefault?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}
