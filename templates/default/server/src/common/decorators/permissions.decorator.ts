import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * 权限装饰器 - 接口权限控制
 * @param permissions 权限标识数组
 * @example
 * @Permissions('system:user:add', 'system:user:edit')
 * @Post()
 * async create() {}
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
