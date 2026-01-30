import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryOperLogDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: '每页数量', default: 10 })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  pageSize?: number;

  @ApiPropertyOptional({ description: '模块' })
  @IsString()
  @IsOptional()
  module?: string;

  @ApiPropertyOptional({ description: '操作类型' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ description: '操作人' })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({ description: '状态: 0失败 1成功' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '开始时间' })
  @IsString()
  @IsOptional()
  startTime?: string;

  @ApiPropertyOptional({ description: '结束时间' })
  @IsString()
  @IsOptional()
  endTime?: string;
}
