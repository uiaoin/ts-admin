import { http } from '@/utils/request';
import type { LoginRequest, LoginResult, UserInfo, MenuInfo } from '@ts-admin/types';

/**
 * 登录
 */
export function login(data: LoginRequest): Promise<LoginResult> {
  return http.post('/auth/login', data);
}

/**
 * 刷新Token
 */
export function refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
  return http.post('/auth/refresh', { refreshToken });
}

/**
 * 退出登录
 */
export function logout(): Promise<boolean> {
  return http.post('/auth/logout');
}

/**
 * 获取当前用户信息
 */
export function getUserInfo(): Promise<UserInfo> {
  return http.get('/auth/info');
}

/**
 * 获取用户菜单
 */
export function getUserMenus(): Promise<MenuInfo[]> {
  return http.get('/auth/menus');
}

/**
 * 修改密码
 */
export function changePassword(data: { oldPassword: string; newPassword: string }): Promise<boolean> {
  return http.post('/auth/change-password', data);
}
