import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, MaxLength } from 'class-validator';

export class UpdateDictTypeDto {
  @ApiPropertyOptional({ description: '字典名称' })
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: '字典名称最多100个字符' })
  name?: string;

  @ApiPropertyOptional({ description: '字典类型' })
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: '字典类型最多100个字符' })
  type?: string;

  @ApiPropertyOptional({ description: '状态: 0禁用 1正常' })
  @IsInt()
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}
