import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { QueryOperLogDto } from './dto/query-oper-log.dto';
import { QueryLoginLogDto } from './dto/query-login-log.dto';

@Injectable()
export class LogService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== 操作日志 ====================

  /**
   * 记录操作日志
   */
  async createOperLog(data: {
    module: string;
    type: string;
    method: string;
    requestMethod: string;
    url: string;
    ip?: string;
    location?: string;
    param?: string;
    result?: string;
    status: number;
    errorMsg?: string;
    duration?: number;
    userId?: number;
    username?: string;
  }) {
    return this.prisma.operLog.create({ data });
  }

  /**
   * 查询操作日志
   */
  async findAllOperLogs(query: QueryOperLogDto) {
    const { page = 1, pageSize = 10, module, type, username, status, startTime, endTime } = query;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (module) where.module = { contains: module };
    if (type) where.type = type;
    if (username) where.username = { contains: username };
    if (status !== undefined) where.status = status;
    if (startTime || endTime) {
      where.createdAt = {};
      if (startTime) where.createdAt.gte = new Date(startTime);
      if (endTime) where.createdAt.lte = new Date(endTime);
    }

    const [list, total] = await Promise.all([
      this.prisma.operLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.operLog.count({ where }),
    ]);

    return { list, total, page, pageSize };
  }

  /**
   * 删除操作日志
   */
  async removeOperLog(id: number) {
    await this.prisma.operLog.delete({ where: { id } });
    return true;
  }

  /**
   * 清空操作日志
   */
  async clearOperLogs() {
    await this.prisma.operLog.deleteMany();
    return true;
  }

  // ==================== 登录日志 ====================

  /**
   * 记录登录日志
   */
  async createLoginLog(data: {
    username: string;
    ip?: string;
    location?: string;
    browser?: string;
    os?: string;
    status: number;
    msg?: string;
  }) {
    return this.prisma.loginLog.create({ data });
  }

  /**
   * 查询登录日志
   */
  async findAllLoginLogs(query: QueryLoginLogDto) {
    const { page = 1, pageSize = 10, username, ip, status, startTime, endTime } = query;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (username) where.username = { contains: username };
    if (ip) where.ip = { contains: ip };
    if (status !== undefined) where.status = status;
    if (startTime || endTime) {
      where.createdAt = {};
      if (startTime) where.createdAt.gte = new Date(startTime);
      if (endTime) where.createdAt.lte = new Date(endTime);
    }

    const [list, total] = await Promise.all([
      this.prisma.loginLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.loginLog.count({ where }),
    ]);

    return { list, total, page, pageSize };
  }

  /**
   * 删除登录日志
   */
  async removeLoginLog(id: number) {
    await this.prisma.loginLog.delete({ where: { id } });
    return true;
  }

  /**
   * 清空登录日志
   */
  async clearLoginLogs() {
    await this.prisma.loginLog.deleteMany();
    return true;
  }
}
