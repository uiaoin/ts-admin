import { http } from '@/utils/request';
import type { PaginationResult } from '@uiaoin/ts-admin-types';

export interface UserQueryParams {
  page?: number;
  pageSize?: number;
  username?: string;
  nickname?: string;
  phone?: string;
  status?: number;
  deptId?: number;
}

export interface UserForm {
  username: string;
  password?: string;
  nickname?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  gender?: number;
  status?: number;
  deptId?: number;
  remark?: string;
  roleIds?: number[];
}

/**
 * 获取用户列表
 */
export function getUserList(params: UserQueryParams): Promise<PaginationResult<any>> {
  return http.get('/system/user', { params });
}

/**
 * 获取用户详情
 */
export function getUserDetail(id: number): Promise<any> {
  return http.get(`/system/user/${id}`);
}

/**
 * 创建用户
 */
export function createUser(data: UserForm): Promise<any> {
  return http.post('/system/user', data);
}

/**
 * 更新用户
 */
export function updateUser(id: number, data: Partial<UserForm>): Promise<any> {
  return http.put(`/system/user/${id}`, data);
}

/**
 * 删除用户
 */
export function deleteUser(id: number): Promise<boolean> {
  return http.delete(`/system/user/${id}`);
}

/**
 * 批量删除用户
 */
export function batchDeleteUser(ids: number[]): Promise<boolean> {
  return http.delete('/system/user', { data: ids });
}

/**
 * 重置密码
 */
export function resetPassword(id: number, password: string): Promise<boolean> {
  return http.put(`/system/user/${id}/reset-password`, { password });
}

/**
 * 更新用户状态
 */
export function updateUserStatus(id: number, status: number): Promise<boolean> {
  return http.put(`/system/user/${id}/status`, { status });
}
