import { http } from '@/utils/request';
import type { PaginationResult } from '@ts-admin/types';

// ==================== 字典类型 ====================

export interface DictTypeQueryParams {
  page?: number;
  pageSize?: number;
  name?: string;
  type?: string;
  status?: number;
}

export interface DictTypeForm {
  name: string;
  type: string;
  status?: number;
  remark?: string;
}

export function getDictTypeList(params: DictTypeQueryParams): Promise<PaginationResult<any>> {
  return http.get('/system/dict/type', { params });
}

export function getDictTypeDetail(id: number): Promise<any> {
  return http.get(`/system/dict/type/${id}`);
}

export function createDictType(data: DictTypeForm): Promise<any> {
  return http.post('/system/dict/type', data);
}

export function updateDictType(id: number, data: Partial<DictTypeForm>): Promise<any> {
  return http.put(`/system/dict/type/${id}`, data);
}

export function deleteDictType(id: number): Promise<boolean> {
  return http.delete(`/system/dict/type/${id}`);
}

// ==================== 字典数据 ====================

export interface DictDataQueryParams {
  page?: number;
  pageSize?: number;
  dictType?: string;
  label?: string;
  status?: number;
}

export interface DictDataForm {
  dictType: string;
  label: string;
  value: string;
  sort?: number;
  status?: number;
  isDefault?: number;
  remark?: string;
}

export function getDictDataList(params: DictDataQueryParams): Promise<PaginationResult<any>> {
  return http.get('/system/dict/data', { params });
}

export function getDictDataByType(type: string): Promise<any[]> {
  return http.get(`/system/dict/data/type/${type}`);
}

export function getDictDataDetail(id: number): Promise<any> {
  return http.get(`/system/dict/data/${id}`);
}

export function createDictData(data: DictDataForm): Promise<any> {
  return http.post('/system/dict/data', data);
}

export function updateDictData(id: number, data: Partial<DictDataForm>): Promise<any> {
  return http.put(`/system/dict/data/${id}`, data);
}

export function deleteDictData(id: number): Promise<boolean> {
  return http.delete(`/system/dict/data/${id}`);
}

export function refreshDictCache(): Promise<boolean> {
  return http.delete('/system/dict/refresh-cache');
}
