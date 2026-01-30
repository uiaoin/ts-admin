// ==========================================
// 通用类型
// ==========================================

/** 分页请求参数 */
export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}

/** 分页响应 */
export interface PaginationResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** API统一响应格式 */
export interface ApiResult<T = any> {
  code: number;
  message: string;
  data: T;
}

/** 树形结构节点 */
export interface TreeNode {
  id: number;
  parentId: number;
  children?: TreeNode[];
}

// ==========================================
// 用户相关
// ==========================================

/** 用户状态 */
export enum UserStatus {
  DISABLED = 0,
  ENABLED = 1,
}

/** 用户性别 */
export enum Gender {
  UNKNOWN = 0,
  MALE = 1,
  FEMALE = 2,
}

/** 用户信息 */
export interface UserInfo {
  id: number;
  username: string;
  nickname: string | null;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  gender: Gender;
  status: UserStatus;
  deptId: number | null;
  roles: RoleInfo[];
  permissions: string[];
  createdAt: string;
}

/** 登录请求 */
export interface LoginRequest {
  username: string;
  password: string;
}

/** 登录响应 */
export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ==========================================
// 角色相关
// ==========================================

/** 数据权限范围 */
export enum DataScope {
  ALL = 1, // 全部数据
  DEPT_AND_CHILDREN = 2, // 本部门及以下
  DEPT = 3, // 本部门
  SELF = 4, // 仅本人
  CUSTOM = 5, // 自定义
}

/** 角色信息 */
export interface RoleInfo {
  id: number;
  name: string;
  code: string;
  sort: number;
  status: number;
  dataScope: DataScope;
  remark: string | null;
}

// ==========================================
// 菜单相关
// ==========================================

/** 菜单类型 */
export enum MenuType {
  DIRECTORY = 0, // 目录
  MENU = 1, // 菜单
  BUTTON = 2, // 按钮
}

/** 菜单信息 */
export interface MenuInfo {
  id: number;
  parentId: number;
  name: string;
  path: string | null;
  component: string | null;
  permission: string | null;
  type: MenuType;
  icon: string | null;
  sort: number;
  visible: number;
  status: number;
  isExternal: number;
  isCache: number;
  children?: MenuInfo[];
}

/** 路由元信息 */
export interface RouteMeta {
  title: string;
  icon?: string;
  hidden?: boolean;
  keepAlive?: boolean;
  permission?: string;
}

/** 前端路由 */
export interface RouteItem {
  path: string;
  name: string;
  component: string;
  redirect?: string;
  meta: RouteMeta;
  children?: RouteItem[];
}

// ==========================================
// 部门相关
// ==========================================

/** 部门信息 */
export interface DeptInfo {
  id: number;
  parentId: number;
  ancestors: string | null;
  name: string;
  sort: number;
  leader: string | null;
  phone: string | null;
  email: string | null;
  status: number;
  children?: DeptInfo[];
}

// ==========================================
// 字典相关
// ==========================================

/** 字典类型 */
export interface DictTypeInfo {
  id: number;
  name: string;
  type: string;
  status: number;
  remark: string | null;
}

/** 字典数据 */
export interface DictDataInfo {
  id: number;
  dictType: string;
  label: string;
  value: string;
  sort: number;
  status: number;
  isDefault: number;
  remark: string | null;
}
