import type { RouteRecordRaw } from 'vue-router';
import type { MenuInfo } from '@ts-admin/types';
import { listToTree } from '@ts-admin/utils';

// 视图模块
const viewModules = import.meta.glob('../views/**/*.vue');

// 根据组件路径获取组件
function getComponent(component: string) {
  const path = `../views/${component}.vue`;
  if (viewModules[path]) {
    return viewModules[path];
  }
  console.warn(`组件不存在: ${path}`);
  return () => import('@/views/error/404.vue');
}

// 将菜单转换为路由
function menuToRoute(menu: MenuInfo & { children?: MenuInfo[] }): RouteRecordRaw | null {
  // 按钮类型不生成路由
  if (menu.type === 2) {
    return null;
  }

  const route: RouteRecordRaw = {
    path: menu.path || '',
    name: `Menu_${menu.id}`,
    meta: {
      title: menu.name,
      icon: menu.icon || undefined,
      hidden: menu.visible === 0,
      keepAlive: menu.isCache === 1,
      permission: menu.permission || undefined,
    },
    children: [],
  };

  // 目录类型
  if (menu.type === 0) {
    route.component = () => import('@/layouts/RouteView.vue');
    if (menu.redirect) {
      route.redirect = menu.redirect;
    }
  }

  // 菜单类型
  if (menu.type === 1) {
    if (menu.isExternal === 1) {
      // 外链
      route.component = () => import('@/views/iframe/index.vue');
      route.meta!.url = menu.path;
    } else if (menu.component) {
      route.component = getComponent(menu.component);
    }
  }

  // 递归处理子菜单
  if (menu.children && menu.children.length > 0) {
    const childRoutes = menu.children
      .map((child) => menuToRoute(child))
      .filter((r): r is RouteRecordRaw => r !== null);

    if (childRoutes.length > 0) {
      route.children = childRoutes;
    }
  }

  return route;
}

// 生成动态路由
export function generateRoutes(menus: MenuInfo[]): RouteRecordRaw[] {
  // 先转换为树形结构
  const menuTree = listToTree(menus);

  // 转换为路由
  const routes = menuTree
    .map((menu) => menuToRoute(menu as MenuInfo & { children?: MenuInfo[] }))
    .filter((r): r is RouteRecordRaw => r !== null);

  return routes;
}
