import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. 创建部门
  const rootDept = await prisma.dept.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      parentId: 0,
      ancestors: '0',
      name: '总公司',
      sort: 0,
      leader: '管理员',
      status: 1,
    },
  });

  const techDept = await prisma.dept.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      parentId: 1,
      ancestors: '0,1',
      name: '技术部',
      sort: 1,
      leader: '技术负责人',
      status: 1,
    },
  });

  console.log('✅ Departments created');

  // 2. 创建菜单
  const menus = [
    // 系统管理
    { id: 1, parentId: 0, name: '系统管理', path: '/system', component: 'Layout', type: 0, icon: 'SettingOutlined', sort: 1 },
    { id: 2, parentId: 1, name: '用户管理', path: '/system/user', component: 'system/user/index', permission: 'system:user:list', type: 1, icon: 'UserOutlined', sort: 1 },
    { id: 3, parentId: 1, name: '角色管理', path: '/system/role', component: 'system/role/index', permission: 'system:role:list', type: 1, icon: 'TeamOutlined', sort: 2 },
    { id: 4, parentId: 1, name: '菜单管理', path: '/system/menu', component: 'system/menu/index', permission: 'system:menu:list', type: 1, icon: 'MenuOutlined', sort: 3 },
    { id: 5, parentId: 1, name: '部门管理', path: '/system/dept', component: 'system/dept/index', permission: 'system:dept:list', type: 1, icon: 'ApartmentOutlined', sort: 4 },
    { id: 6, parentId: 1, name: '字典管理', path: '/system/dict', component: 'system/dict/index', permission: 'system:dict:list', type: 1, icon: 'BookOutlined', sort: 5 },

    // 用户管理按钮权限
    { id: 20, parentId: 2, name: '用户新增', permission: 'system:user:add', type: 2, sort: 1 },
    { id: 21, parentId: 2, name: '用户编辑', permission: 'system:user:edit', type: 2, sort: 2 },
    { id: 22, parentId: 2, name: '用户删除', permission: 'system:user:delete', type: 2, sort: 3 },
    { id: 23, parentId: 2, name: '重置密码', permission: 'system:user:resetPwd', type: 2, sort: 4 },

    // 角色管理按钮权限
    { id: 30, parentId: 3, name: '角色新增', permission: 'system:role:add', type: 2, sort: 1 },
    { id: 31, parentId: 3, name: '角色编辑', permission: 'system:role:edit', type: 2, sort: 2 },
    { id: 32, parentId: 3, name: '角色删除', permission: 'system:role:delete', type: 2, sort: 3 },

    // 菜单管理按钮权限
    { id: 40, parentId: 4, name: '菜单新增', permission: 'system:menu:add', type: 2, sort: 1 },
    { id: 41, parentId: 4, name: '菜单编辑', permission: 'system:menu:edit', type: 2, sort: 2 },
    { id: 42, parentId: 4, name: '菜单删除', permission: 'system:menu:delete', type: 2, sort: 3 },

    // 部门管理按钮权限
    { id: 50, parentId: 5, name: '部门新增', permission: 'system:dept:add', type: 2, sort: 1 },
    { id: 51, parentId: 5, name: '部门编辑', permission: 'system:dept:edit', type: 2, sort: 2 },
    { id: 52, parentId: 5, name: '部门删除', permission: 'system:dept:delete', type: 2, sort: 3 },

    // 字典管理按钮权限
    { id: 60, parentId: 6, name: '字典新增', permission: 'system:dict:add', type: 2, sort: 1 },
    { id: 61, parentId: 6, name: '字典编辑', permission: 'system:dict:edit', type: 2, sort: 2 },
    { id: 62, parentId: 6, name: '字典删除', permission: 'system:dict:delete', type: 2, sort: 3 },

    // 系统监控
    { id: 100, parentId: 0, name: '系统监控', path: '/monitor', component: 'Layout', type: 0, icon: 'MonitorOutlined', sort: 2 },
    { id: 101, parentId: 100, name: '操作日志', path: '/monitor/operlog', component: 'monitor/operlog/index', permission: 'monitor:operlog:list', type: 1, icon: 'FileTextOutlined', sort: 1 },
    { id: 102, parentId: 100, name: '登录日志', path: '/monitor/loginlog', component: 'monitor/loginlog/index', permission: 'monitor:loginlog:list', type: 1, icon: 'LoginOutlined', sort: 2 },
    { id: 103, parentId: 100, name: '服务器监控', path: '/monitor/server', component: 'monitor/server/index', permission: 'monitor:server:list', type: 1, icon: 'DesktopOutlined', sort: 3 },
    { id: 104, parentId: 100, name: '缓存监控', path: '/monitor/cache', component: 'monitor/cache/index', permission: 'monitor:cache:list', type: 1, icon: 'DatabaseOutlined', sort: 4 },

    // 操作日志按钮权限
    { id: 110, parentId: 101, name: '日志删除', permission: 'monitor:operlog:delete', type: 2, sort: 1 },

    // 登录日志按钮权限
    { id: 111, parentId: 102, name: '日志删除', permission: 'monitor:loginlog:delete', type: 2, sort: 1 },

    // 缓存监控按钮权限
    { id: 112, parentId: 104, name: '缓存删除', permission: 'monitor:cache:delete', type: 2, sort: 1 },
  ];

  for (const menu of menus) {
    await prisma.menu.upsert({
      where: { id: menu.id },
      update: {},
      create: {
        id: menu.id,
        parentId: menu.parentId,
        name: menu.name,
        path: menu.path || null,
        component: menu.component || null,
        permission: menu.permission || null,
        type: menu.type,
        icon: menu.icon || null,
        sort: menu.sort,
        visible: 1,
        status: 1,
      },
    });
  }

  console.log('✅ Menus created');

  // 3. 创建角色
  const adminRole = await prisma.role.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: '超级管理员',
      code: 'admin',
      sort: 1,
      status: 1,
      dataScope: 1, // 全部数据
      remark: '超级管理员，拥有所有权限',
    },
  });

  const normalRole = await prisma.role.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: '普通角色',
      code: 'normal',
      sort: 2,
      status: 1,
      dataScope: 4, // 仅本人
      remark: '普通角色',
    },
  });

  console.log('✅ Roles created');

  // 4. 给角色分配菜单权限
  // 超级管理员拥有所有菜单
  for (const menu of menus) {
    await prisma.roleMenu.upsert({
      where: { roleId_menuId: { roleId: 1, menuId: menu.id } },
      update: {},
      create: { roleId: 1, menuId: menu.id },
    });
  }

  // 普通角色只有查看权限
  const normalMenuIds = [1, 2, 3, 4, 5, 6, 100, 101, 102, 103, 104];
  for (const menuId of normalMenuIds) {
    await prisma.roleMenu.upsert({
      where: { roleId_menuId: { roleId: 2, menuId } },
      update: {},
      create: { roleId: 2, menuId },
    });
  }

  console.log('✅ Role-Menu relations created');

  // 5. 创建用户
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      nickname: '超级管理员',
      email: 'admin@example.com',
      phone: '13800138000',
      gender: 1,
      status: 1,
      deptId: 1,
      remark: '系统管理员',
    },
  });

  const testUser = await prisma.user.upsert({
    where: { username: 'test' },
    update: {},
    create: {
      username: 'test',
      password: hashedPassword,
      nickname: '测试用户',
      email: 'test@example.com',
      phone: '13800138001',
      gender: 0,
      status: 1,
      deptId: 2,
      remark: '测试账号',
    },
  });

  console.log('✅ Users created');

  // 6. 给用户分配角色
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole.id },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: testUser.id, roleId: normalRole.id } },
    update: {},
    create: { userId: testUser.id, roleId: normalRole.id },
  });

  console.log('✅ User-Role relations created');

  // 7. 创建字典
  const dictTypes = [
    { name: '用户性别', type: 'sys_user_gender' },
    { name: '系统状态', type: 'sys_status' },
    { name: '菜单类型', type: 'sys_menu_type' },
  ];

  for (const dict of dictTypes) {
    await prisma.dictType.upsert({
      where: { type: dict.type },
      update: {},
      create: { name: dict.name, type: dict.type, status: 1 },
    });
  }

  // 字典数据
  const dictDataList = [
    { dictType: 'sys_user_gender', label: '未知', value: '0', sort: 0 },
    { dictType: 'sys_user_gender', label: '男', value: '1', sort: 1 },
    { dictType: 'sys_user_gender', label: '女', value: '2', sort: 2 },
    { dictType: 'sys_status', label: '禁用', value: '0', sort: 0 },
    { dictType: 'sys_status', label: '正常', value: '1', sort: 1 },
    { dictType: 'sys_menu_type', label: '目录', value: '0', sort: 0 },
    { dictType: 'sys_menu_type', label: '菜单', value: '1', sort: 1 },
    { dictType: 'sys_menu_type', label: '按钮', value: '2', sort: 2 },
  ];

  for (let i = 0; i < dictDataList.length; i++) {
    const data = dictDataList[i];
    await prisma.dictData.upsert({
      where: { id: i + 1 },
      update: {},
      create: {
        id: i + 1,
        dictType: data.dictType,
        label: data.label,
        value: data.value,
        sort: data.sort,
        status: 1,
      },
    });
  }

  console.log('✅ Dictionaries created');

  console.log('🎉 Seeding completed!');
  console.log('');
  console.log('📝 Default accounts:');
  console.log('   Admin: admin / admin123');
  console.log('   Test:  test / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
