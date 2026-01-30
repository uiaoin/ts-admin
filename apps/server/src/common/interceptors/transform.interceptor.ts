import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResult } from '@ts-admin/types';

/**
 * 统一响应格式拦截器
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResult<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResult<T>> {
    return next.handle().pipe(
      map((data) => ({
        code: 200,
        message: 'success',
        data,
      })),
    );
  }
}
