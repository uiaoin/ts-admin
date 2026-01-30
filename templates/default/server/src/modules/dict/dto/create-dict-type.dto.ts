import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, MaxLength } from 'class-validator';

export class CreateDictTypeDto {
  @ApiProperty({ description: '字典名称' })
  @IsString()
  @IsNotEmpty({ message: '字典名称不能为空' })
  @MaxLength(100, { message: '字典名称最多100个字符' })
  name: string;

  @ApiProperty({ description: '字典类型' })
  @IsString()
  @IsNotEmpty({ message: '字典类型不能为空' })
  @MaxLength(100, { message: '字典类型最多100个字符' })
  type: string;

  @ApiPropertyOptional({ description: '状态: 0禁用 1正常', default: 1 })
  @IsInt()
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}
