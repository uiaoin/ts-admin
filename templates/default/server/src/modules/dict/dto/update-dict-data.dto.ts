import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, MaxLength } from 'class-validator';

export class UpdateDictDataDto {
  @ApiPropertyOptional({ description: '字典标签' })
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: '字典标签最多100个字符' })
  label?: string;

  @ApiPropertyOptional({ description: '字典值' })
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: '字典值最多100个字符' })
  value?: string;

  @ApiPropertyOptional({ description: '排序' })
  @IsInt()
  @IsOptional()
  sort?: number;

  @ApiPropertyOptional({ description: '状态: 0禁用 1正常' })
  @IsInt()
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '是否默认: 0否 1是' })
  @IsInt()
  @IsOptional()
  isDefault?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}
