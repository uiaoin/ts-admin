import { http } from '@/utils/request';
import type { PaginationResult } from '@uiaoin/ts-admin-types';

export interface RoleQueryParams {
  page?: number;
  pageSize?: number;
  name?: string;
  code?: string;
  status?: number;
}

export interface RoleForm {
  name: string;
  code: string;
  sort?: number;
  status?: number;
  dataScope?: number;
  remark?: string;
  menuIds?: number[];
  deptIds?: number[];
}

/**
 * 获取角色列表（分页）
 */
export function getRoleList(params: RoleQueryParams): Promise<PaginationResult<any>> {
  return http.get('/system/role', { params });
}

/**
 * 获取角色列表（全部）
 */
export function getAllRoles(): Promise<any[]> {
  return http.get('/system/role/list');
}

/**
 * 获取角色详情
 */
export function getRoleDetail(id: number): Promise<any> {
  return http.get(`/system/role/${id}`);
}

/**
 * 创建角色
 */
export function createRole(data: RoleForm): Promise<any> {
  return http.post('/system/role', data);
}

/**
 * 更新角色
 */
export function updateRole(id: number, data: Partial<RoleForm>): Promise<any> {
  return http.put(`/system/role/${id}`, data);
}

/**
 * 删除角色
 */
export function deleteRole(id: number): Promise<boolean> {
  return http.delete(`/system/role/${id}`);
}

/**
 * 更新角色状态
 */
export function updateRoleStatus(id: number, status: number): Promise<boolean> {
  return http.put(`/system/role/${id}/status`, { status });
}
