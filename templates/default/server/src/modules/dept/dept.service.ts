import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { listToTree } from '@uiaoin/ts-admin-utils';
import { CreateDeptDto } from './dto/create-dept.dto';
import { UpdateDeptDto } from './dto/update-dept.dto';
import { QueryDeptDto } from './dto/query-dept.dto';

@Injectable()
export class DeptService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建部门
   */
  async create(createDeptDto: CreateDeptDto) {
    const { parentId = 0, ...rest } = createDeptDto;

    // 获取祖级列表
    let ancestors = '0';
    if (parentId !== 0) {
      const parent = await this.prisma.dept.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        throw new BadRequestException('父部门不存在');
      }
      ancestors = parent.ancestors ? `${parent.ancestors},${parentId}` : `${parentId}`;
    }

    const dept = await this.prisma.dept.create({
      data: {
        parentId,
        ancestors,
        ...rest,
      },
    });

    return dept;
  }

  /**
   * 查询部门列表（树形）
   */
  async findAll(query: QueryDeptDto) {
    const { name, status } = query;

    const where: any = {};

    if (name) {
      where.name = { contains: name };
    }
    if (status !== undefined) {
      where.status = status;
    }

    const list = await this.prisma.dept.findMany({
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
   * 查询部门下拉树
   */
  async findTreeSelect() {
    const list = await this.prisma.dept.findMany({
      where: { status: 1 },
      orderBy: [{ sort: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        parentId: true,
        name: true,
      },
    });

    return listToTree(list);
  }

  /**
   * 查询单个部门
   */
  async findOne(id: number) {
    const dept = await this.prisma.dept.findUnique({
      where: { id },
    });

    if (!dept) {
      throw new NotFoundException('部门不存在');
    }

    return dept;
  }

  /**
   * 更新部门
   */
  async update(id: number, updateDeptDto: UpdateDeptDto) {
    const { parentId, ...rest } = updateDeptDto;

    // 检查部门是否存在
    const existDept = await this.prisma.dept.findUnique({
      where: { id },
    });

    if (!existDept) {
      throw new NotFoundException('部门不存在');
    }

    // 不允许将父级设置为自己或自己的子级
    if (parentId !== undefined) {
      if (parentId === id) {
        throw new BadRequestException('不能将自己设置为父级');
      }

      // 检查是否设置为自己的子级
      const children = await this.getChildrenIds(id);
      if (children.includes(parentId)) {
        throw new BadRequestException('不能将子级设置为父级');
      }
    }

    // 获取新的祖级列表
    let ancestors = '0';
    const newParentId = parentId ?? existDept.parentId;
    if (newParentId !== 0) {
      const parent = await this.prisma.dept.findUnique({
        where: { id: newParentId },
      });
      if (parent) {
        ancestors = parent.ancestors ? `${parent.ancestors},${newParentId}` : `${newParentId}`;
      }
    }

    const dept = await this.prisma.dept.update({
      where: { id },
      data: {
        parentId: newParentId,
        ancestors,
        ...rest,
      },
    });

    // 更新所有子部门的祖级列表
    if (parentId !== undefined && parentId !== existDept.parentId) {
      await this.updateChildrenAncestors(id, ancestors);
    }

    return dept;
  }

  /**
   * 删除部门
   */
  async remove(id: number) {
    const dept = await this.prisma.dept.findUnique({
      where: { id },
    });

    if (!dept) {
      throw new NotFoundException('部门不存在');
    }

    // 检查是否有子部门
    const children = await this.prisma.dept.count({
      where: { parentId: id },
    });

    if (children > 0) {
      throw new BadRequestException('存在子部门，不允许删除');
    }

    // 检查是否有用户
    const users = await this.prisma.user.count({
      where: { deptId: id },
    });

    if (users > 0) {
      throw new BadRequestException('部门下存在用户，不允许删除');
    }

    await this.prisma.dept.delete({
      where: { id },
    });

    return true;
  }

  /**
   * 获取所有子部门ID
   */
  private async getChildrenIds(parentId: number): Promise<number[]> {
    const children = await this.prisma.dept.findMany({
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

  /**
   * 更新子部门的祖级列表
   */
  private async updateChildrenAncestors(parentId: number, parentAncestors: string) {
    const children = await this.prisma.dept.findMany({
      where: { parentId },
    });

    for (const child of children) {
      const ancestors = `${parentAncestors},${parentId}`;
      await this.prisma.dept.update({
        where: { id: child.id },
        data: { ancestors },
      });
      await this.updateChildrenAncestors(child.id, ancestors);
    }
  }

  /**
   * 获取部门及其所有子部门ID
   */
  async getDeptAndChildrenIds(deptId: number): Promise<number[]> {
    const ids = [deptId];
    const childrenIds = await this.getChildrenIds(deptId);
    return [...ids, ...childrenIds];
  }
}
