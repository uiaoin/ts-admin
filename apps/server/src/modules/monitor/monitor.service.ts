import { Injectable } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';
import * as os from 'os';

@Injectable()
export class MonitorService {
  constructor(private readonly redisService: RedisService) {}

  /**
   * 获取服务器信息
   */
  async getServerInfo() {
    const cpus = os.cpus();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    // CPU使用率计算
    let cpuUsage = 0;
    if (cpus.length > 0) {
      const cpu = cpus[0];
      const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
      const idle = cpu.times.idle;
      cpuUsage = Math.round(((total - idle) / total) * 100);
    }

    // 系统运行时间
    const uptime = os.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);

    return {
      // 服务器信息
      server: {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        release: os.release(),
        uptime: `${days}天${hours}小时${minutes}分钟`,
      },
      // CPU信息
      cpu: {
        model: cpus[0]?.model || 'Unknown',
        cores: cpus.length,
        usage: cpuUsage,
      },
      // 内存信息
      memory: {
        total: this.formatBytes(totalMemory),
        used: this.formatBytes(usedMemory),
        free: this.formatBytes(freeMemory),
        usage: Math.round((usedMemory / totalMemory) * 100),
      },
      // Node.js信息
      node: {
        version: process.version,
        pid: process.pid,
        uptime: this.formatUptime(process.uptime()),
        memoryUsage: {
          rss: this.formatBytes(process.memoryUsage().rss),
          heapTotal: this.formatBytes(process.memoryUsage().heapTotal),
          heapUsed: this.formatBytes(process.memoryUsage().heapUsed),
          external: this.formatBytes(process.memoryUsage().external),
        },
      },
    };
  }

  /**
   * 获取缓存信息
   */
  async getCacheInfo() {
    const client = this.redisService.getClient();
    // 获取Redis信息
    const info = await client.info();
    const lines = info.split('\r\n');
    const data: Record<string, string> = {};

    lines.forEach((line) => {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split(':');
        if (key && value) {
          data[key] = value;
        }
      }
    });

    // 获取缓存键数量
    const dbSize = await client.dbsize();

    return {
      version: data.redis_version || 'Unknown',
      mode: data.redis_mode || 'standalone',
      port: data.tcp_port || '6379',
      uptime: this.formatUptime(parseInt(data.uptime_in_seconds || '0')),
      connectedClients: data.connected_clients || '0',
      usedMemory: data.used_memory_human || '0B',
      usedMemoryPeak: data.used_memory_peak_human || '0B',
      totalKeys: dbSize,
      hitRate: this.calculateHitRate(data),
      commandStats: {
        totalCommands: data.total_commands_processed || '0',
        instantaneousOps: data.instantaneous_ops_per_sec || '0',
      },
    };
  }

  /**
   * 获取缓存键列表
   */
  async getCacheKeys(pattern = '*', limit = 100) {
    const client = this.redisService.getClient();
    const keys = await client.keys(pattern);
    const limitedKeys = keys.slice(0, limit);

    const result = await Promise.all(
      limitedKeys.map(async (key) => {
        const type = await client.type(key);
        const ttl = await client.ttl(key);
        return { key, type, ttl };
      }),
    );

    return {
      total: keys.length,
      list: result,
    };
  }

  /**
   * 获取缓存值
   */
  async getCacheValue(key: string) {
    const client = this.redisService.getClient();
    const type = await client.type(key);
    let value: any;

    switch (type) {
      case 'string':
        value = await client.get(key);
        break;
      case 'list':
        value = await client.lrange(key, 0, -1);
        break;
      case 'set':
        value = await client.smembers(key);
        break;
      case 'zset':
        value = await client.zrange(key, 0, -1, 'WITHSCORES');
        break;
      case 'hash':
        value = await client.hgetall(key);
        break;
      default:
        value = null;
    }

    const ttl = await client.ttl(key);

    return { key, type, value, ttl };
  }

  /**
   * 删除缓存
   */
  async deleteCache(key: string) {
    await this.redisService.del(key);
    return true;
  }

  /**
   * 清空缓存
   */
  async clearCache(pattern?: string) {
    if (pattern) {
      await this.redisService.delByPattern(pattern);
    } else {
      await this.redisService.getClient().flushdb();
    }
    return true;
  }

  // ==================== 私有方法 ====================

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (days > 0) {
      return `${days}天${hours}小时${minutes}分钟`;
    } else if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    } else if (minutes > 0) {
      return `${minutes}分钟${secs}秒`;
    }
    return `${secs}秒`;
  }

  private calculateHitRate(data: Record<string, string>): string {
    const hits = parseInt(data.keyspace_hits || '0');
    const misses = parseInt(data.keyspace_misses || '0');
    const total = hits + misses;
    if (total === 0) return '0%';
    return ((hits / total) * 100).toFixed(2) + '%';
  }
}
