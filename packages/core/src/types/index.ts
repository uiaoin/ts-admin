export interface JwtPayload {
  sub: number;
  username: string;
  roleIds: number[];
  roles?: string[];
  permissions?: string[];
  deptId?: number | null;
  dataScope?: number;
}

export interface OperLogData {
  module: string;
  type: string;
  method: string;
  requestMethod: string;
  url: string;
  ip?: string;
  param?: string;
  result?: string;
  status: number;
  errorMsg?: string;
  duration: number;
  userId?: number;
  username?: string;
}

export interface LoginLogData {
  username: string;
  ip?: string;
  browser?: string;
  os?: string;
  status: number;
  msg?: string;
}
