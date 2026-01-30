import { http } from '@/utils/request';

export interface DeptQueryParams {
  name?: string;
  status?: number;
}

export interface DeptForm {
  parentId?: number;
  name: string;
  sort?: number;
  leader?: string;
  phone?: string;
  email?: string;
  status?: number;
}

/**
 * 获取部门列表（树形）
 */
export function getDeptList(params?: DeptQueryParams): Promise<any[]> {
  return http.get('/system/dept', { params });
}

/**
 * 获取部门下拉树
 */
export function getDeptTreeSelect(): Promise<any[]> {
  return http.get('/system/dept/tree-select');
}

/**
 * 获取部门详情
 */
export function getDeptDetail(id: number): Promise<any> {
  return http.get(`/system/dept/${id}`);
}

/**
 * 创建部门
 */
export function createDept(data: DeptForm): Promise<any> {
  return http.post('/system/dept', data);
}

/**
 * 更新部门
 */
export function updateDept(id: number, data: Partial<DeptForm>): Promise<any> {
  return http.put(`/system/dept/${id}`, data);
}

/**
 * 删除部门
 */
export function deleteDept(id: number): Promise<boolean> {
  return http.delete(`/system/dept/${id}`);
}
