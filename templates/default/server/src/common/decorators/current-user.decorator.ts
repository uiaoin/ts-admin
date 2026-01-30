import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtPayload {
  sub: number; // 用户ID
  username: string;
  roles: string[]; // 角色code数组
  permissions: string[]; // 权限标识数组
  deptId: number | null;
  dataScope: number;
}

/**
 * 获取当前登录用户装饰器
 * @example
 * @Get('profile')
 * async getProfile(@CurrentUser() user: JwtPayload) {}
 *
 * @Get('id')
 * async getId(@CurrentUser('sub') userId: number) {}
 */
export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    return data ? user?.[data] : user;
  },
);
