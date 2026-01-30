import { Controller, Get, Post, Query, Res, Req, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { WechatService } from './wechat.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('微信授权')
@Controller('wechat')
export class WechatController {
  constructor(private readonly wechatService: WechatService) {}

  @Public()
  @Get('auth-url')
  @ApiOperation({ summary: '获取微信授权URL' })
  @ApiQuery({ name: 'redirectUri', description: '授权成功后的跳转地址', required: true })
  @ApiQuery({ name: 'state', description: '自定义state参数', required: false })
  getAuthUrl(
    @Query('redirectUri') redirectUri: string,
    @Query('state') state?: string,
  ) {
    const authUrl = this.wechatService.getAuthUrl(redirectUri, state);
    return { authUrl };
  }

  @Public()
  @Get('callback')
  @ApiOperation({ summary: '微信授权回调' })
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const ip = req.ip || req.headers['x-forwarded-for'] as string;
      const userAgent = req.headers['user-agent'];

      const result = await this.wechatService.handleCallback(code, state, { ip, userAgent });
      
      // 拼接跳转URL，带上token参数
      const separator = result.redirectUri.includes('?') ? '&' : '?';
      const redirectUrl = `${result.redirectUri}${separator}accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;
      
      res.redirect(redirectUrl);
    } catch (error) {
      // 授权失败，跳转到错误页面
      res.redirect(`/login?error=${encodeURIComponent(error.message)}`);
    }
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: '微信授权登录（前端传code）' })
  async login(
    @Body('code') code: string,
    @Body('state') state: string,
    @Req() req: Request,
  ) {
    const ip = req.ip || req.headers['x-forwarded-for'] as string;
    const userAgent = req.headers['user-agent'];

    // 对于前端直接传code的方式，state可以是固定值或前端生成
    const result = await this.wechatService.handleCallback(code, state || 'direct', { ip, userAgent });
    
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
      user: result.user,
    };
  }

  @Post('bind')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '绑定微信账号' })
  async bind(
    @CurrentUser('sub') userId: number,
    @Body('code') code: string,
  ) {
    return this.wechatService.bindWechat(userId, code);
  }

  @Post('unbind')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '解绑微信账号' })
  async unbind(@CurrentUser('sub') userId: number) {
    return this.wechatService.unbindWechat(userId);
  }
}
