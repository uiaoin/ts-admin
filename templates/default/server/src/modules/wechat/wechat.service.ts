import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { LogService } from '../log/log.service';

interface WechatAccessToken {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  openid: string;
  scope: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

interface WechatUserInfo {
  openid: string;
  nickname: string;
  sex: number;
  province: string;
  city: string;
  country: string;
  headimgurl: string;
  privilege: string[];
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

@Injectable()
export class WechatService {
  private readonly WECHAT_STATE_PREFIX = 'wechat_state:';
  private readonly REFRESH_TOKEN_PREFIX = 'refresh_token:';
  private readonly USER_PERMISSIONS_PREFIX = 'user_permissions:';

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
    private readonly logService: LogService,
  ) {}

  /**
   * 获取微信授权URL
   */
  getAuthUrl(redirectUri: string, state?: string): string {
    const appId = this.configService.get('WECHAT_APP_ID');
    if (!appId) {
      throw new BadRequestException('微信AppID未配置');
    }

    // 生成随机state防止CSRF
    const stateCode = state || this.generateState();
    
    // 存储state到Redis，5分钟有效
    this.redisService.set(`${this.WECHAT_STATE_PREFIX}${stateCode}`, redirectUri, 300);

    const encodedRedirectUri = encodeURIComponent(
      `${this.configService.get('APP_URL', 'http://localhost:3000')}/api/wechat/callback`
    );

    // 网页授权URL
    return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${encodedRedirectUri}&response_type=code&scope=snsapi_userinfo&state=${stateCode}#wechat_redirect`;
  }

  /**
   * 处理微信回调
   */
  async handleCallback(code: string, state: string, clientInfo?: { ip?: string; userAgent?: string }) {
    // 验证state
    const redirectUri = await this.redisService.get(`${this.WECHAT_STATE_PREFIX}${state}`);
    if (!redirectUri) {
      throw new BadRequestException('授权已过期，请重新授权');
    }
    await this.redisService.del(`${this.WECHAT_STATE_PREFIX}${state}`);

    // 用code换取access_token
    const tokenInfo = await this.getAccessToken(code);
    if (tokenInfo.errcode) {
      throw new BadRequestException(`微信授权失败: ${tokenInfo.errmsg}`);
    }

    // 获取用户信息
    const userInfo = await this.getUserInfo(tokenInfo.access_token, tokenInfo.openid);
    if (userInfo.errcode) {
      throw new BadRequestException(`获取用户信息失败: ${userInfo.errmsg}`);
    }

    // 查找或创建用户
    const user = await this.findOrCreateUser(userInfo);

    // 生成JWT Token
    const tokens = await this.generateTokens(user);

    // 记录登录日志
    await this.logService.createLoginLog({
      username: user.username,
      ip: clientInfo?.ip,
      browser: this.parseBrowser(clientInfo?.userAgent),
      os: this.parseOS(clientInfo?.userAgent),
      status: 1,
      msg: '微信授权登录成功',
    });

    return {
      ...tokens,
      redirectUri,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
      },
    };
  }

  /**
   * 绑定微信账号到现有用户
   */
  async bindWechat(userId: number, code: string) {
    // 用code换取access_token
    const tokenInfo = await this.getAccessToken(code);
    if (tokenInfo.errcode) {
      throw new BadRequestException(`微信授权失败: ${tokenInfo.errmsg}`);
    }

    // 检查该微信是否已被绑定
    const existingUser = await this.prisma.user.findFirst({
      where: { wechatOpenId: tokenInfo.openid },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new BadRequestException('该微信号已绑定其他账号');
    }

    // 获取用户信息
    const userInfo = await this.getUserInfo(tokenInfo.access_token, tokenInfo.openid);

    // 更新用户微信信息
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        wechatOpenId: tokenInfo.openid,
        wechatUnionId: tokenInfo.unionid || userInfo.unionid,
        avatar: userInfo.headimgurl || undefined,
      },
    });

    return {
      id: updatedUser.id,
      wechatOpenId: updatedUser.wechatOpenId,
    };
  }

  /**
   * 解绑微信账号
   */
  async unbindWechat(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    // 检查用户是否有密码（微信注册的用户可能没有密码）
    if (!user.password) {
      throw new BadRequestException('请先设置登录密码后再解绑微信');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        wechatOpenId: null,
        wechatUnionId: null,
      },
    });

    return true;
  }

  // ==================== 私有方法 ====================

  /**
   * 获取Access Token
   */
  private async getAccessToken(code: string): Promise<WechatAccessToken> {
    const appId = this.configService.get('WECHAT_APP_ID');
    const appSecret = this.configService.get('WECHAT_APP_SECRET');

    const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${appSecret}&code=${code}&grant_type=authorization_code`;

    const response = await fetch(url);
    return response.json();
  }

  /**
   * 获取用户信息
   */
  private async getUserInfo(accessToken: string, openid: string): Promise<WechatUserInfo> {
    const url = `https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openid}&lang=zh_CN`;

    const response = await fetch(url);
    return response.json();
  }

  /**
   * 查找或创建用户
   */
  private async findOrCreateUser(wechatUser: WechatUserInfo) {
    // 先通过openid查找
    let user = await this.prisma.user.findFirst({
      where: { wechatOpenId: wechatUser.openid },
      include: {
        roles: {
          include: {
            role: {
              include: {
                menus: {
                  include: { menu: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      // 自动创建新用户
      const username = `wx_${wechatUser.openid.substring(0, 12)}`;
      
      // 获取默认角色（普通用户）
      const defaultRole = await this.prisma.role.findFirst({
        where: { code: 'normal' },
      });

      user = await this.prisma.user.create({
        data: {
          username,
          nickname: wechatUser.nickname || '微信用户',
          avatar: wechatUser.headimgurl,
          wechatOpenId: wechatUser.openid,
          wechatUnionId: wechatUser.unionid,
          status: 1,
          deptId: 1, // 默认部门
          roles: defaultRole ? {
            create: { roleId: defaultRole.id },
          } : undefined,
        },
        include: {
          roles: {
            include: {
              role: {
                include: {
                  menus: {
                    include: { menu: true },
                  },
                },
              },
            },
          },
        },
      });
    } else {
      // 更新用户信息
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          nickname: wechatUser.nickname || user.nickname,
          avatar: wechatUser.headimgurl || user.avatar,
          wechatUnionId: wechatUser.unionid || user.wechatUnionId,
        },
        include: {
          roles: {
            include: {
              role: {
                include: {
                  menus: {
                    include: { menu: true },
                  },
                },
              },
            },
          },
        },
      });
    }

    return user;
  }

  /**
   * 生成JWT Tokens
   */
  private async generateTokens(user: any) {
    const roles = user.roles?.map((ur: any) => ur.role.code) || [];
    const permissions = this.extractPermissions(user.roles || []);
    const dataScope = this.getMaxDataScope(user.roles || []);

    const payload = {
      sub: user.id,
      username: user.username,
      roles,
      permissions,
      deptId: user.deptId,
      dataScope,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET') + '_refresh',
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES', '7d'),
    });

    // 存储refresh token
    const refreshExpires = this.parseExpiresTime(
      this.configService.get('JWT_REFRESH_EXPIRES', '7d')
    );
    await this.redisService.set(
      `${this.REFRESH_TOKEN_PREFIX}${user.id}`,
      refreshToken,
      refreshExpires
    );

    // 缓存权限
    await this.redisService.setJson(
      `${this.USER_PERMISSIONS_PREFIX}${user.id}`,
      permissions,
      refreshExpires
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiresTime(this.configService.get('JWT_ACCESS_EXPIRES', '15m')),
    };
  }

  private extractPermissions(userRoles: any[]): string[] {
    const permissions = new Set<string>();
    userRoles.forEach((ur) => {
      ur.role?.menus?.forEach((rm: any) => {
        if (rm.menu?.permission) {
          permissions.add(rm.menu.permission);
        }
      });
    });
    return Array.from(permissions);
  }

  private getMaxDataScope(userRoles: any[]): number {
    if (!userRoles.length) return 4;
    return Math.min(...userRoles.map((ur) => ur.role?.dataScope || 4));
  }

  private parseExpiresTime(expires: string): number {
    const match = expires.match(/^(\d+)([smhd])$/);
    if (!match) return 900;
    const value = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 900;
    }
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  }

  private parseBrowser(userAgent?: string): string {
    if (!userAgent) return 'WeChat';
    if (userAgent.includes('MicroMessenger')) return 'WeChat';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Safari')) return 'Safari';
    return 'Unknown';
  }

  private parseOS(userAgent?: string): string {
    if (!userAgent) return 'Unknown';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    return 'Unknown';
  }
}
