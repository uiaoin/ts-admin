import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../types';

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
