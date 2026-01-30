import { Controller, Get, Delete, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LogService } from './log.service';
import { QueryOperLogDto } from './dto/query-oper-log.dto';
import { QueryLoginLogDto } from './dto/query-login-log.dto';
import { Permissions } from '../../common/decorators';

@ApiTags('日志管理')
@ApiBearerAuth('access-token')
@Controller('monitor')
export class LogController {
  constructor(private readonly logService: LogService) {}

  // ==================== 操作日志 ====================

  @ApiOperation({ summary: '操作日志列表' })
  @Permissions('monitor:operlog:list')
  @Get('operlog')
  findAllOperLogs(@Query() query: QueryOperLogDto) {
    return this.logService.findAllOperLogs(query);
  }

  @ApiOperation({ summary: '删除操作日志' })
  @Permissions('monitor:operlog:delete')
  @Delete('operlog/:id')
  removeOperLog(@Param('id', ParseIntPipe) id: number) {
    return this.logService.removeOperLog(id);
  }

  @ApiOperation({ summary: '清空操作日志' })
  @Permissions('monitor:operlog:delete')
  @Delete('operlog/clear')
  clearOperLogs() {
    return this.logService.clearOperLogs();
  }

  // ==================== 登录日志 ====================

  @ApiOperation({ summary: '登录日志列表' })
  @Permissions('monitor:loginlog:list')
  @Get('loginlog')
  findAllLoginLogs(@Query() query: QueryLoginLogDto) {
    return this.logService.findAllLoginLogs(query);
  }

  @ApiOperation({ summary: '删除登录日志' })
  @Permissions('monitor:loginlog:delete')
  @Delete('loginlog/:id')
  removeLoginLog(@Param('id', ParseIntPipe) id: number) {
    return this.logService.removeLoginLog(id);
  }

  @ApiOperation({ summary: '清空登录日志' })
  @Permissions('monitor:loginlog:delete')
  @Delete('loginlog/clear')
  clearLoginLogs() {
    return this.logService.clearLoginLogs();
  }
}
