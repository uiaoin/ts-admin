import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建用户
   */
  async create(createUserDto: CreateUserDto) {
    const { username, password, roleIds, ...rest } = createUserDto;

    // 检查用户名是否已存在
    const existUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existUser) {
      throw new BadRequestException('用户名已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        ...rest,
        roles: roleIds
          ? {
              create: roleIds.map((roleId) => ({
                role: { connect: { id: roleId } },
              })),
            }
          : undefined,
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        dept: true,
      },
    });

    const { password: _, ...result } = user;
    return result;
  }

  /**
   * 分页查询用户
   */
  async findAll(query: QueryUserDto) {
    const { page = 1, pageSize = 10, username, nickname, phone, status, deptId } = query;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (username) {
      where.username = { contains: username };
    }
    if (nickname) {
      where.nickname = { contains: nickname };
    }
    if (phone) {
      where.phone = { contains: phone };
    }
    if (status !== undefined) {
      where.status = status;
    }
    if (deptId) {
      where.deptId = deptId;
    }

    const [list, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          roles: {
            include: {
              role: true,
            },
          },
          dept: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    // 移除密码字段
    const safeList = list.map((user) => {
      const { password, ...rest } = user;
      return {
        ...rest,
        roles: user.roles.map((ur) => ur.role),
      };
    });

    return {
      list: safeList,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 查询单个用户
   */
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
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
      throw new NotFoundException('用户不存在');
    }

    const { password, ...result } = user;
    return {
      ...result,
      roleIds: user.roles.map((ur) => ur.roleId),
      roles: user.roles.map((ur) => ur.role),
    };
  }

  /**
   * 更新用户
   */
  async update(id: number, updateUserDto: UpdateUserDto) {
    const { roleIds, ...rest } = updateUserDto;

    // 检查用户是否存在
    const existUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existUser) {
      throw new NotFoundException('用户不存在');
    }

    // 如果更新了用户名，检查是否重复
    if (rest.username && rest.username !== existUser.username) {
      const duplicateUser = await this.prisma.user.findUnique({
        where: { username: rest.username },
      });
      if (duplicateUser) {
        throw new BadRequestException('用户名已存在');
      }
    }

    // 更新用户
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...rest,
        roles: roleIds
          ? {
              deleteMany: {},
              create: roleIds.map((roleId) => ({
                role: { connect: { id: roleId } },
              })),
            }
          : undefined,
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        dept: true,
      },
    });

    const { password, ...result } = user;
    return result;
  }

  /**
   * 删除用户
   */
  async remove(id: number) {
    // 不允许删除admin用户
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (user.username === 'admin') {
      throw new BadRequestException('不允许删除超级管理员');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return true;
  }

  /**
   * 批量删除用户
   */
  async batchRemove(ids: number[]) {
    // 过滤掉admin用户
    const users = await this.prisma.user.findMany({
      where: { id: { in: ids } },
    });

    const adminUser = users.find((u) => u.username === 'admin');
    if (adminUser) {
      throw new BadRequestException('不允许删除超级管理员');
    }

    await this.prisma.user.deleteMany({
      where: { id: { in: ids } },
    });

    return true;
  }

  /**
   * 重置密码
   */
  async resetPassword(id: number, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return true;
  }

  /**
   * 更新用户状态
   */
  async updateStatus(id: number, status: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (user.username === 'admin') {
      throw new BadRequestException('不允许禁用超级管理员');
    }

    await this.prisma.user.update({
      where: { id },
      data: { status },
    });

    return true;
  }
}
