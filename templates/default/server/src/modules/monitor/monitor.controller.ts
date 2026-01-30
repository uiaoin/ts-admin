import { Controller, Get, Delete, Query, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MonitorService } from './monitor.service';
import { Permissions } from '../../common/decorators';

@ApiTags('系统监控')
@ApiBearerAuth('access-token')
@Controller('monitor')
export class MonitorController {
  constructor(private readonly monitorService: MonitorService) {}

  @ApiOperation({ summary: '获取服务器信息' })
  @Permissions('monitor:server:list')
  @Get('server')
  getServerInfo() {
    return this.monitorService.getServerInfo();
  }

  @ApiOperation({ summary: '获取缓存信息' })
  @Permissions('monitor:cache:list')
  @Get('cache')
  getCacheInfo() {
    return this.monitorService.getCacheInfo();
  }

  @ApiOperation({ summary: '获取缓存键列表' })
  @Permissions('monitor:cache:list')
  @Get('cache/keys')
  getCacheKeys(@Query('pattern') pattern?: string, @Query('limit') limit?: number) {
    return this.monitorService.getCacheKeys(pattern || '*', limit || 100);
  }

  @ApiOperation({ summary: '获取缓存值' })
  @Permissions('monitor:cache:list')
  @Get('cache/value/:key')
  getCacheValue(@Param('key') key: string) {
    return this.monitorService.getCacheValue(key);
  }

  @ApiOperation({ summary: '删除缓存' })
  @Permissions('monitor:cache:delete')
  @Delete('cache/:key')
  deleteCache(@Param('key') key: string) {
    return this.monitorService.deleteCache(key);
  }

  @ApiOperation({ summary: '清空缓存' })
  @Permissions('monitor:cache:delete')
  @Delete('cache/clear')
  clearCache(@Body('pattern') pattern?: string) {
    return this.monitorService.clearCache(pattern);
  }
}
