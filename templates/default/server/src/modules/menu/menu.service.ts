import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { listToTree } from '@uiaoin/ts-admin-utils';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { QueryMenuDto } from './dto/query-menu.dto';

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建菜单
   */
  async create(createMenuDto: CreateMenuDto) {
    const menu = await this.prisma.menu.create({
      data: createMenuDto,
    });
    return menu;
  }

  /**
   * 查询菜单列表（树形）
   */
  async findAll(query: QueryMenuDto) {
    const { name, status } = query;

    const where: any = {};

    if (name) {
      where.name = { contains: name };
    }
    if (status !== undefined) {
      where.status = status;
    }

    const list = await this.prisma.menu.findMany({
      where,
      orderBy: [{ sort: 'asc' }, { id: 'asc' }],
    });

    // 如果有搜索条件，返回平铺列表
    if (name || status !== undefined) {
      return list;
    }

    // 否则返回树形结构
    return listToTree(list);
  }

  /**
   * 查询菜单下拉树
   */
  async findTreeSelect() {
    const list = await this.prisma.menu.findMany({
      where: { status: 1 },
      orderBy: [{ sort: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        parentId: true,
        name: true,
        type: true,
      },
    });

    return listToTree(list);
  }

  /**
   * 查询单个菜单
   */
  async findOne(id: number) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
    });

    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }

    return menu;
  }

  /**
   * 更新菜单
   */
  async update(id: number, updateMenuDto: UpdateMenuDto) {
    // 检查菜单是否存在
    const existMenu = await this.prisma.menu.findUnique({
      where: { id },
    });

    if (!existMenu) {
      throw new NotFoundException('菜单不存在');
    }

    // 不允许将父级设置为自己或自己的子级
    if (updateMenuDto.parentId !== undefined) {
      if (updateMenuDto.parentId === id) {
        throw new BadRequestException('不能将自己设置为父级');
      }

      // 检查是否设置为自己的子级
      const children = await this.getChildrenIds(id);
      if (children.includes(updateMenuDto.parentId)) {
        throw new BadRequestException('不能将子级设置为父级');
      }
    }

    const menu = await this.prisma.menu.update({
      where: { id },
      data: updateMenuDto,
    });

    return menu;
  }

  /**
   * 删除菜单
   */
  async remove(id: number) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
    });

    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }

    // 检查是否有子菜单
    const children = await this.prisma.menu.count({
      where: { parentId: id },
    });

    if (children > 0) {
      throw new BadRequestException('存在子菜单，不允许删除');
    }

    // 检查是否已分配给角色
    const roleMenus = await this.prisma.roleMenu.count({
      where: { menuId: id },
    });

    if (roleMenus > 0) {
      throw new BadRequestException('菜单已分配给角色，不允许删除');
    }

    await this.prisma.menu.delete({
      where: { id },
    });

    return true;
  }

  /**
   * 获取所有子菜单ID
   */
  private async getChildrenIds(parentId: number): Promise<number[]> {
    const children = await this.prisma.menu.findMany({
      where: { parentId },
      select: { id: true },
    });

    const ids = children.map((c) => c.id);

    for (const child of children) {
      const subIds = await this.getChildrenIds(child.id);
      ids.push(...subIds);
    }

    return ids;
  }
}
