import { http } from '@/utils/request';
import type { PaginationResult } from '@ts-admin/types';

// ==================== 操作日志 ====================

export interface OperLogQueryParams {
  page?: number;
  pageSize?: number;
  module?: string;
  type?: string;
  username?: string;
  status?: number;
  startTime?: string;
  endTime?: string;
}

export interface OperLogInfo {
  id: number;
  module: string;
  type: string;
  method: string;
  requestMethod: string;
  url: string;
  ip: string | null;
  location: string | null;
  param: string | null;
  result: string | null;
  status: number;
  errorMsg: string | null;
  duration: number | null;
  userId: number | null;
  username: string | null;
  createdAt: string;
}

export function getOperLogList(params: OperLogQueryParams): Promise<PaginationResult<OperLogInfo>> {
  return http.get('/monitor/operlog', { params });
}

export function deleteOperLog(id: number): Promise<boolean> {
  return http.delete(`/monitor/operlog/${id}`);
}

export function clearOperLogs(): Promise<boolean> {
  return http.delete('/monitor/operlog/clear');
}

// ==================== 登录日志 ====================

export interface LoginLogQueryParams {
  page?: number;
  pageSize?: number;
  username?: string;
  ip?: string;
  status?: number;
  startTime?: string;
  endTime?: string;
}

export interface LoginLogInfo {
  id: number;
  username: string;
  ip: string | null;
  location: string | null;
  browser: string | null;
  os: string | null;
  status: number;
  msg: string | null;
  createdAt: string;
}

export function getLoginLogList(params: LoginLogQueryParams): Promise<PaginationResult<LoginLogInfo>> {
  return http.get('/monitor/loginlog', { params });
}

export function deleteLoginLog(id: number): Promise<boolean> {
  return http.delete(`/monitor/loginlog/${id}`);
}

export function clearLoginLogs(): Promise<boolean> {
  return http.delete('/monitor/loginlog/clear');
}
