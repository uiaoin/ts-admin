import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { LogService } from '../log/log.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from '../../common/decorators/current-user.decorator';

@Injectable()
export class AuthService {
  // Redis key 前缀
  private readonly REFRESH_TOKEN_PREFIX = 'refresh_token:';
  private readonly USER_PERMISSIONS_PREFIX = 'user_permissions:';

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly logService: LogService,
  ) {}

  /**
   * 用户登录
   */
  async login(loginDto: LoginDto, clientInfo?: { ip?: string; userAgent?: string }) {
    const { username, password } = loginDto;
    const { ip, userAgent } = clientInfo || {};

    // 解析 User-Agent
    const browser = this.parseBrowser(userAgent);
    const os = this.parseOS(userAgent);

    // 查询用户
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        roles: {
          include: {
            role: {
              include: {
                menus: {
                  include: {
                    menu: true,
                  },
                },
              },
            },
          },
        },
        dept: true,
      },
    });

    if (!user) {
      // 记录登录失败日志
      await this.logService.createLoginLog({
        username,
        ip,
        browser,
        os,
        status: 0,
        msg: '用户不存在',
      });
      throw new UnauthorizedException('用户名或密码错误');
    }

    if (user.status !== 1) {
      // 记录登录失败日志
      await this.logService.createLoginLog({
        username,
        ip,
        browser,
        os,
        status: 0,
        msg: '用户已被禁用',
      });
      throw new UnauthorizedException('用户已被禁用');
    }

    // 验证密码（微信登录用户可能没有密码）
    if (!user.password) {
      await this.logService.createLoginLog({
        username,
        ip,
        browser,
        os,
        status: 0,
        msg: '该账号未设置密码，请使用微信登录',
      });
      throw new UnauthorizedException('该账号未设置密码，请使用微信登录');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // 记录登录失败日志
      await this.logService.createLoginLog({
        username,
        ip,
        browser,
        os,
        status: 0,
        msg: '密码错误',
      });
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 获取角色和权限
    const roles = user.roles.map((ur) => ur.role.code);
    const permissions = this.extractPermissions(user.roles);
    const dataScope = this.getMaxDataScope(user.roles);

    // 生成Token
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      roles,
      permissions,
      deptId: user.deptId,
      dataScope,
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    // 存储refreshToken到Redis
    const refreshExpires = this.parseExpiresTime(
      this.configService.get('JWT_REFRESH_EXPIRES', '7d'),
    );
    await this.redisService.set(
      `${this.REFRESH_TOKEN_PREFIX}${user.id}`,
      refreshToken,
      refreshExpires,
    );

    // 缓存用户权限
    await this.redisService.setJson(
      `${this.USER_PERMISSIONS_PREFIX}${user.id}`,
      permissions,
      refreshExpires,
    );

    // 记录登录成功日志
    await this.logService.createLoginLog({
      username,
      ip,
      browser,
      os,
      status: 1,
      msg: '登录成功',
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiresTime(this.configService.get('JWT_ACCESS_EXPIRES', '15m')),
    };
  }

  /**
   * 刷新Token
   */
  async refreshToken(refreshToken: string) {
    try {
      // 验证refreshToken
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_SECRET') + '_refresh',
      });

      // 检查Redis中是否存在
      const storedToken = await this.redisService.get(
        `${this.REFRESH_TOKEN_PREFIX}${payload.sub}`,
      );

      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('RefreshToken已失效');
      }

      // 查询用户最新信息
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          roles: {
            include: {
              role: {
                include: {
                  menus: {
                    include: {
                      menu: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user || user.status !== 1) {
        throw new UnauthorizedException('用户不存在或已被禁用');
      }

      // 重新生成Token
      const roles = user.roles.map((ur) => ur.role.code);
      const permissions = this.extractPermissions(user.roles);
      const dataScope = this.getMaxDataScope(user.roles);

      const newPayload: JwtPayload = {
        sub: user.id,
        username: user.username,
        roles,
        permissions,
        deptId: user.deptId,
        dataScope,
      };

      const newAccessToken = this.generateAccessToken(newPayload);

      return {
        accessToken: newAccessToken,
        expiresIn: this.parseExpiresTime(this.configService.get('JWT_ACCESS_EXPIRES', '15m')),
      };
    } catch (error) {
      throw new UnauthorizedException('RefreshToken无效或已过期');
    }
  }

  /**
   * 退出登录
   */
  async logout(userId: number) {
    // 删除Redis中的refreshToken和权限缓存
    await this.redisService.del([
      `${this.REFRESH_TOKEN_PREFIX}${userId}`,
      `${this.USER_PERMISSIONS_PREFIX}${userId}`,
    ]);
    return true;
  }

  /**
   * 强制下线用户
   */
  async kickOut(userId: number) {
    await this.logout(userId);
  }

  /**
   * 获取当前用户信息
   */
  async getUserInfo(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        dept: true,
      },
    });

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    // 获取权限列表（从缓存或重新查询）
    let permissions = await this.redisService.getJson<string[]>(
      `${this.USER_PERMISSIONS_PREFIX}${userId}`,
    );

    if (!permissions) {
      const userWithMenus = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          roles: {
            include: {
              role: {
                include: {
                  menus: {
                    include: {
                      menu: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      permissions = this.extractPermissions(userWithMenus?.roles || []);
    }

    const { password, ...userInfo } = user;

    return {
      ...userInfo,
      roles: user.roles.map((ur) => ur.role),
      permissions,
    };
  }

  /**
   * 获取用户菜单（路由）
   */
  async getUserMenus(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                menus: {
                  include: {
                    menu: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    // 超级管理员返回所有菜单
    const isAdmin = user.roles.some((ur) => ur.role.code === 'admin');

    let menus;
    if (isAdmin) {
      menus = await this.prisma.menu.findMany({
        where: {
          status: 1,
          type: { in: [0, 1] }, // 只返回目录和菜单，不返回按钮
        },
        orderBy: [{ sort: 'asc' }, { id: 'asc' }],
      });
    } else {
      // 合并所有角色的菜单
      const menuSet = new Set<number>();
      user.roles.forEach((ur) => {
        ur.role.menus.forEach((rm) => {
          if (rm.menu.status === 1 && rm.menu.type !== 2) {
            menuSet.add(rm.menu.id);
          }
        });
      });

      menus = await this.prisma.menu.findMany({
        where: {
          id: { in: Array.from(menuSet) },
        },
        orderBy: [{ sort: 'asc' }, { id: 'asc' }],
      });
    }

    return menus;
  }

  /**
   * 修改密码
   */
  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    // 微信登录用户首次设置密码
    if (!user.password) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
      return true;
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('原密码错误');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // 强制下线，需要重新登录
    await this.logout(userId);

    return true;
  }

  // ==================== 私有方法 ====================

  /**
   * 生成AccessToken
   */
  private generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }

  /**
   * 生成RefreshToken
   */
  private generateRefreshToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET') + '_refresh',
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES', '7d'),
    });
  }

  /**
   * 提取用户权限
   */
  private extractPermissions(
    userRoles: Array<{
      role: {
        menus: Array<{
          menu: {
            permission: string | null;
          };
        }>;
      };
    }>,
  ): string[] {
    const permissions = new Set<string>();

    userRoles.forEach((ur) => {
      ur.role.menus.forEach((rm) => {
        if (rm.menu.permission) {
          permissions.add(rm.menu.permission);
        }
      });
    });

    return Array.from(permissions);
  }

  /**
   * 获取最大数据权限范围
   */
  private getMaxDataScope(
    userRoles: Array<{
      role: {
        dataScope: number;
      };
    }>,
  ): number {
    // dataScope越小权限越大，1是全部数据
    return Math.min(...userRoles.map((ur) => ur.role.dataScope));
  }

  /**
   * 解析过期时间字符串为秒数
   */
  private parseExpiresTime(expires: string): number {
    const match = expires.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // 默认15分钟

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 900;
    }
  }

  /**
   * 解析浏览器信息
   */
  private parseBrowser(userAgent?: string): string {
    if (!userAgent) return 'Unknown';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Opera')) return 'Opera';
    if (userAgent.includes('MSIE') || userAgent.includes('Trident')) return 'IE';
    return 'Unknown';
  }

  /**
   * 解析操作系统信息
   */
  private parseOS(userAgent?: string): string {
    if (!userAgent) return 'Unknown';
    if (userAgent.includes('Windows NT 10')) return 'Windows 10';
    if (userAgent.includes('Windows NT 6.3')) return 'Windows 8.1';
    if (userAgent.includes('Windows NT 6.2')) return 'Windows 8';
    if (userAgent.includes('Windows NT 6.1')) return 'Windows 7';
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS X')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
    return 'Unknown';
  }
}
