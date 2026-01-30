import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { login as loginApi, logout as logoutApi, getUserInfo, getUserMenus, refreshToken } from '@/api/auth';
import type { LoginRequest, UserInfo, MenuInfo } from '@uiaoin/ts-admin-types';

export const useUserStore = defineStore(
  'user',
  () => {
    // 状态
    const accessToken = ref<string>('');
    const refreshTokenValue = ref<string>('');
    const userInfo = ref<UserInfo | null>(null);
    const menus = ref<MenuInfo[]>([]);

    // 计算属性
    const isLoggedIn = computed(() => !!accessToken.value);
    const permissions = computed(() => userInfo.value?.permissions || []);
    const roles = computed(() => userInfo.value?.roles?.map((r) => r.code) || []);

    // 登录
    async function login(loginData: LoginRequest) {
      const result = await loginApi(loginData);
      accessToken.value = result.accessToken;
      refreshTokenValue.value = result.refreshToken;

      // 获取用户信息和菜单
      await fetchUserInfo();
      await fetchMenus();

      return result;
    }

    // 设置Token（微信登录等第三方登录使用）
    async function setTokens(access: string, refresh: string) {
      accessToken.value = access;
      refreshTokenValue.value = refresh;

      // 获取用户信息和菜单
      await fetchUserInfo();
      await fetchMenus();
    }

    // 刷新Token
    async function refreshAccessToken() {
      if (!refreshTokenValue.value) {
        throw new Error('No refresh token');
      }

      const result = await refreshToken(refreshTokenValue.value);
      accessToken.value = result.accessToken;
      return result;
    }

    // 退出登录
    async function logout() {
      try {
        if (accessToken.value) {
          await logoutApi();
        }
      } catch {
        // 忽略登出错误
      } finally {
        // 清除本地状态
        accessToken.value = '';
        refreshTokenValue.value = '';
        userInfo.value = null;
        menus.value = [];
      }
    }

    // 获取用户信息
    async function fetchUserInfo() {
      const info = await getUserInfo();
      userInfo.value = info;
      return info;
    }

    // 获取菜单
    async function fetchMenus() {
      const menuList = await getUserMenus();
      menus.value = menuList;
      return menuList;
    }

    // 检查权限
    function hasPermission(permission: string | string[]): boolean {
      // 超级管理员拥有所有权限
      if (roles.value.includes('admin')) {
        return true;
      }

      if (Array.isArray(permission)) {
        return permission.some((p) => permissions.value.includes(p));
      }
      return permissions.value.includes(permission);
    }

    // 检查角色
    function hasRole(role: string | string[]): boolean {
      if (Array.isArray(role)) {
        return role.some((r) => roles.value.includes(r));
      }
      return roles.value.includes(role);
    }

    return {
      // 状态
      accessToken,
      refreshToken: refreshTokenValue,
      userInfo,
      menus,

      // 计算属性
      isLoggedIn,
      permissions,
      roles,

      // 方法
      login,
      logout,
      setTokens,
      refreshAccessToken,
      fetchUserInfo,
      fetchMenus,
      hasPermission,
      hasRole,
    };
  },
  {
    persist: {
      key: 'user-store',
      paths: ['accessToken', 'refreshToken'],
    },
  },
);
