import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { message } from 'ant-design-vue';
import { useUserStore } from '@/stores/user';
import router from '@/router';
import type { ApiResult } from '@ts-admin/types';

// 创建axios实例
const request = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    if (userStore.accessToken) {
      config.headers.Authorization = `Bearer ${userStore.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResult>) => {
    const { code, message: msg, data } = response.data;

    if (code === 200) {
      return data;
    }

    // 业务错误
    message.error(msg || '请求失败');
    return Promise.reject(new Error(msg || '请求失败'));
  },
  async (error) => {
    const { response } = error;
    const userStore = useUserStore();

    if (response) {
      const { status, data } = response;

      switch (status) {
        case 401:
          // Token过期，尝试刷新
          if (userStore.refreshToken && !error.config._retry) {
            error.config._retry = true;
            try {
              await userStore.refreshAccessToken();
              // 重试原请求
              error.config.headers.Authorization = `Bearer ${userStore.accessToken}`;
              return request(error.config);
            } catch {
              // 刷新失败，跳转登录
              userStore.logout();
              router.push('/login');
            }
          } else {
            userStore.logout();
            router.push('/login');
          }
          break;
        case 403:
          message.error('没有权限访问');
          break;
        case 404:
          message.error('请求的资源不存在');
          break;
        case 500:
          message.error(data?.message || '服务器内部错误');
          break;
        default:
          message.error(data?.message || `请求失败: ${status}`);
      }
    } else {
      message.error('网络错误，请检查网络连接');
    }

    return Promise.reject(error);
  },
);

// 封装请求方法
export const http = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return request.get(url, config);
  },

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return request.post(url, data, config);
  },

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return request.put(url, data, config);
  },

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return request.delete(url, config);
  },

  upload<T = any>(url: string, file: File, fieldName = 'file'): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);
    return request.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default request;
