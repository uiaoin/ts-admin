import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtPayload } from '../types';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 检查是否是公开接口
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // 获取接口要求的权限
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 如果没有设置权限要求，直接通过
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // 获取当前用户
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload & { roles: string[]; permissions: string[] };

    if (!user) {
      return false;
    }

    // 超级管理员拥有所有权限
    if (user.roles?.includes('admin')) {
      return true;
    }

    // 检查用户是否拥有所需权限（任一即可）
    return requiredPermissions.some((permission) => user.permissions?.includes(permission));
  }
}
