import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryDeptDto {
  @ApiPropertyOptional({ description: '部门名称' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '状态: 0禁用 1正常' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  status?: number;
}
