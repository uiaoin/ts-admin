import { http } from '@/utils/request';

export interface MenuQueryParams {
  name?: string;
  status?: number;
}

export interface MenuForm {
  parentId?: number;
  name: string;
  path?: string;
  component?: string;
  redirect?: string;
  permission?: string;
  type: number;
  icon?: string;
  sort?: number;
  visible?: number;
  status?: number;
  isExternal?: number;
  isCache?: number;
}

/**
 * 获取菜单列表（树形）
 */
export function getMenuList(params?: MenuQueryParams): Promise<any[]> {
  return http.get('/system/menu', { params });
}

/**
 * 获取菜单下拉树
 */
export function getMenuTreeSelect(): Promise<any[]> {
  return http.get('/system/menu/tree-select');
}

/**
 * 获取菜单详情
 */
export function getMenuDetail(id: number): Promise<any> {
  return http.get(`/system/menu/${id}`);
}

/**
 * 创建菜单
 */
export function createMenu(data: MenuForm): Promise<any> {
  return http.post('/system/menu', data);
}

/**
 * 更新菜单
 */
export function updateMenu(id: number, data: Partial<MenuForm>): Promise<any> {
  return http.put(`/system/menu/${id}`, data);
}

/**
 * 删除菜单
 */
export function deleteMenu(id: number): Promise<boolean> {
  return http.delete(`/system/menu/${id}`);
}
