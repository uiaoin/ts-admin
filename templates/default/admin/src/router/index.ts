import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { useUserStore } from '@/stores/user';
import { generateRoutes } from './helper';

NProgress.configure({ showSpinner: false });

// 静态路由
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true },
  },
  {
    path: '/403',
    name: '403',
    component: () => import('@/views/error/403.vue'),
    meta: { title: '无权限', hidden: true },
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '页面不存在', hidden: true },
  },
];

// 动态路由入口
export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '首页', icon: 'DashboardOutlined' },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: [...constantRoutes, ...asyncRoutes],
});

// 是否已加载动态路由
let hasLoadedRoutes = false;

// 白名单
const whiteList = ['/login', '/403', '/404'];

router.beforeEach(async (to, _from, next) => {
  NProgress.start();

  const userStore = useUserStore();

  // 白名单直接放行
  if (whiteList.includes(to.path)) {
    next();
    return;
  }

  // 未登录跳转登录页
  if (!userStore.isLoggedIn) {
    next(`/login?redirect=${to.path}`);
    return;
  }

  // 已加载路由直接放行
  if (hasLoadedRoutes) {
    next();
    return;
  }

  try {
    // 获取用户信息和菜单
    if (!userStore.userInfo) {
      await userStore.fetchUserInfo();
    }
    if (userStore.menus.length === 0) {
      await userStore.fetchMenus();
    }

    // 生成动态路由
    const dynamicRoutes = generateRoutes(userStore.menus);
    dynamicRoutes.forEach((route) => {
      router.addRoute('Layout', route);
    });

    // 添加404兜底路由
    router.addRoute({
      path: '/:pathMatch(.*)*',
      redirect: '/404',
    });

    hasLoadedRoutes = true;

    // 重新导航
    next({ ...to, replace: true });
  } catch (error) {
    console.error('路由加载失败:', error);
    userStore.logout();
    next('/login');
  }
});

router.afterEach(() => {
  NProgress.done();
});

// 重置路由状态（登出时调用）
export function resetRouter() {
  hasLoadedRoutes = false;
}

export default router;
