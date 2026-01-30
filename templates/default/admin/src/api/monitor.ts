import { http } from '@/utils/request';

// ==================== 服务器监控 ====================

export interface ServerInfo {
  server: {
    hostname: string;
    platform: string;
    arch: string;
    release: string;
    uptime: string;
  };
  cpu: {
    model: string;
    cores: number;
    usage: number;
  };
  memory: {
    total: string;
    used: string;
    free: string;
    usage: number;
  };
  node: {
    version: string;
    pid: number;
    uptime: string;
    memoryUsage: {
      rss: string;
      heapTotal: string;
      heapUsed: string;
      external: string;
    };
  };
}

export function getServerInfo(): Promise<ServerInfo> {
  return http.get('/monitor/server');
}

// ==================== 缓存监控 ====================

export interface CacheInfo {
  version: string;
  mode: string;
  port: string;
  uptime: string;
  connectedClients: string;
  usedMemory: string;
  usedMemoryPeak: string;
  totalKeys: number;
  hitRate: string;
  commandStats: {
    totalCommands: string;
    instantaneousOps: string;
  };
}

export interface CacheKey {
  key: string;
  type: string;
  ttl: number;
}

export interface CacheValue {
  key: string;
  type: string;
  value: any;
  ttl: number;
}

export function getCacheInfo(): Promise<CacheInfo> {
  return http.get('/monitor/cache');
}

export function getCacheKeys(pattern?: string, limit?: number): Promise<{ total: number; list: CacheKey[] }> {
  return http.get('/monitor/cache/keys', { params: { pattern, limit } });
}

export function getCacheValue(key: string): Promise<CacheValue> {
  return http.get(`/monitor/cache/value/${encodeURIComponent(key)}`);
}

export function deleteCache(key: string): Promise<boolean> {
  return http.delete(`/monitor/cache/${encodeURIComponent(key)}`);
}

export function clearCache(pattern?: string): Promise<boolean> {
  return http.delete('/monitor/cache/clear', { data: { pattern } });
}
