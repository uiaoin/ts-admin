import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建角色
   */
  async create(createRoleDto: CreateRoleDto) {
    const { code, menuIds, deptIds, ...rest } = createRoleDto;

    // 检查角色编码是否已存在
    const existRole = await this.prisma.role.findUnique({
      where: { code },
    });

    if (existRole) {
      throw new BadRequestException('角色编码已存在');
    }

    // 创建角色
    const role = await this.prisma.role.create({
      data: {
        code,
        ...rest,
        menus: menuIds
          ? {
              create: menuIds.map((menuId) => ({
                menu: { connect: { id: menuId } },
              })),
            }
          : undefined,
        depts: deptIds
          ? {
              create: deptIds.map((deptId) => ({
                dept: { connect: { id: deptId } },
              })),
            }
          : undefined,
      },
      include: {
        menus: { include: { menu: true } },
        depts: { include: { dept: true } },
      },
    });

    return role;
  }

  /**
   * 分页查询角色
   */
  async findAll(query: QueryRoleDto) {
    const { page = 1, pageSize = 10, name, code, status } = query;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (name) {
      where.name = { contains: name };
    }
    if (code) {
      where.code = { contains: code };
    }
    if (status !== undefined) {
      where.status = status;
    }

    const [list, total] = await Promise.all([
      this.prisma.role.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ sort: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.role.count({ where }),
    ]);

    return {
      list,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 查询所有角色（下拉选择用）
   */
  async findAllList() {
    return this.prisma.role.findMany({
      where: { status: 1 },
      orderBy: [{ sort: 'asc' }],
      select: {
        id: true,
        name: true,
        code: true,
      },
    });
  }

  /**
   * 查询单个角色
   */
  async findOne(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        menus: { select: { menuId: true } },
        depts: { select: { deptId: true } },
      },
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    return {
      ...role,
      menuIds: role.menus.map((m) => m.menuId),
      deptIds: role.depts.map((d) => d.deptId),
    };
  }

  /**
   * 更新角色
   */
  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const { menuIds, deptIds, ...rest } = updateRoleDto;

    // 检查角色是否存在
    const existRole = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!existRole) {
      throw new NotFoundException('角色不存在');
    }

    // 如果更新了角色编码，检查是否重复
    if (rest.code && rest.code !== existRole.code) {
      const duplicateRole = await this.prisma.role.findUnique({
        where: { code: rest.code },
      });
      if (duplicateRole) {
        throw new BadRequestException('角色编码已存在');
      }
    }

    // 不允许修改admin角色的编码
    if (existRole.code === 'admin' && rest.code && rest.code !== 'admin') {
      throw new BadRequestException('不允许修改超级管理员角色编码');
    }

    // 更新角色
    const role = await this.prisma.role.update({
      where: { id },
      data: {
        ...rest,
        menus: menuIds
          ? {
              deleteMany: {},
              create: menuIds.map((menuId) => ({
                menu: { connect: { id: menuId } },
              })),
            }
          : undefined,
        depts: deptIds
          ? {
              deleteMany: {},
              create: deptIds.map((deptId) => ({
                dept: { connect: { id: deptId } },
              })),
            }
          : undefined,
      },
      include: {
        menus: { include: { menu: true } },
        depts: { include: { dept: true } },
      },
    });

    return role;
  }

  /**
   * 删除角色
   */
  async remove(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { users: true },
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    if (role.code === 'admin') {
      throw new BadRequestException('不允许删除超级管理员角色');
    }

    if (role.users.length > 0) {
      throw new BadRequestException('该角色已分配用户，不允许删除');
    }

    await this.prisma.role.delete({
      where: { id },
    });

    return true;
  }

  /**
   * 批量删除角色
   */
  async batchRemove(ids: number[]) {
    // 检查是否包含admin角色
    const roles = await this.prisma.role.findMany({
      where: { id: { in: ids } },
      include: { users: true },
    });

    const adminRole = roles.find((r) => r.code === 'admin');
    if (adminRole) {
      throw new BadRequestException('不允许删除超级管理员角色');
    }

    const assignedRole = roles.find((r) => r.users.length > 0);
    if (assignedRole) {
      throw new BadRequestException(`角色"${assignedRole.name}"已分配用户，不允许删除`);
    }

    await this.prisma.role.deleteMany({
      where: { id: { in: ids } },
    });

    return true;
  }

  /**
   * 更新角色状态
   */
  async updateStatus(id: number, status: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    if (role.code === 'admin') {
      throw new BadRequestException('不允许禁用超级管理员角色');
    }

    await this.prisma.role.update({
      where: { id },
      data: { status },
    });

    return true;
  }
}
