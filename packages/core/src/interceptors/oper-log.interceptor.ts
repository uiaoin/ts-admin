import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  Optional,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request } from 'express';
import { OperLogData } from '../types';

// 操作类型映射
const METHOD_TYPE_MAP: Record<string, string> = {
  POST: 'CREATE',
  PUT: 'UPDATE',
  PATCH: 'UPDATE',
  DELETE: 'DELETE',
  GET: 'QUERY',
};

// 默认模块名称映射
const DEFAULT_MODULE_MAP: Record<string, string> = {
  '/api/system/user': '用户管理',
  '/api/system/role': '角色管理',
  '/api/system/menu': '菜单管理',
  '/api/system/dept': '部门管理',
  '/api/system/dict': '字典管理',
  '/api/file': '文件管理',
  '/api/monitor': '系统监控',
  '/api/auth': '认证管理',
};

export const OPER_LOG_SERVICE = 'OPER_LOG_SERVICE';

export interface IOperLogService {
  createOperLog(data: OperLogData): Promise<any>;
}

@Injectable()
export class OperLogInterceptor implements NestInterceptor {
  private moduleMap: Record<string, string>;

  constructor(
    @Optional() @Inject(OPER_LOG_SERVICE) private readonly logService: IOperLogService | null,
    private readonly reflector: Reflector,
  ) {
    this.moduleMap = DEFAULT_MODULE_MAP;
  }

  /**
   * 设置模块名称映射
   */
  setModuleMap(map: Record<string, string>) {
    this.moduleMap = { ...DEFAULT_MODULE_MAP, ...map };
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 如果没有注入日志服务，直接返回
    if (!this.logService) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body } = request;

    // 只记录增删改操作，跳过GET请求
    if (method === 'GET') {
      return next.handle();
    }

    // 跳过登录接口（登录日志单独记录）
    if (url.includes('/auth/login') || url.includes('/auth/refresh')) {
      return next.handle();
    }

    const startTime = Date.now();
    const user = (request as any).user;

    // 获取模块名称
    const module = this.getModule(url);
    const operType = METHOD_TYPE_MAP[method] || 'OTHER';

    return next.handle().pipe(
      tap((data) => {
        // 成功时记录日志
        const duration = Date.now() - startTime;
        this.logService!.createOperLog({
          module,
          type: operType,
          method: `${context.getClass().name}.${context.getHandler().name}`,
          requestMethod: method,
          url: url.split('?')[0],
          ip: this.getClientIp(request),
          param: this.safeStringify(body),
          result: this.safeStringify(data, 500),
          status: 1,
          duration,
          userId: user?.sub,
          username: user?.username,
        }).catch(() => {});
      }),
      catchError((error) => {
        // 失败时也记录日志
        const duration = Date.now() - startTime;
        this.logService!.createOperLog({
          module,
          type: operType,
          method: `${context.getClass().name}.${context.getHandler().name}`,
          requestMethod: method,
          url: url.split('?')[0],
          ip: this.getClientIp(request),
          param: this.safeStringify(body),
          status: 0,
          errorMsg: error.message || String(error),
          duration,
          userId: user?.sub,
          username: user?.username,
        }).catch(() => {});
        throw error;
      }),
    );
  }

  private getModule(url: string): string {
    for (const [path, name] of Object.entries(this.moduleMap)) {
      if (url.startsWith(path)) {
        return name;
      }
    }
    return '其他';
  }

  private getClientIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded) {
      return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    }
    return request.ip || request.socket.remoteAddress || '';
  }

  private safeStringify(obj: any, maxLength = 2000): string {
    if (!obj) return '';
    try {
      // 过滤敏感字段
      const filtered = this.filterSensitive(obj);
      const str = JSON.stringify(filtered);
      return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
    } catch {
      return '';
    }
  }

  private filterSensitive(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    
    const sensitiveKeys = ['password', 'token', 'secret', 'accessToken', 'refreshToken'];
    const result = Array.isArray(obj) ? [...obj] : { ...obj };
    
    for (const key of Object.keys(result)) {
      if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
        result[key] = '******';
      } else if (typeof result[key] === 'object') {
        result[key] = this.filterSensitive(result[key]);
      }
    }
    
    return result;
  }
}
