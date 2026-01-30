import { Injectable, Inject } from '@nestjs/common';
import type { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  /**
   * 获取原始Redis客户端
   */
  getClient(): Redis {
    return this.redis;
  }

  /**
   * 获取值
   */
  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  /**
   * 设置值
   */
  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redis.set(key, value, 'EX', ttl);
    } else {
      await this.redis.set(key, value);
    }
  }

  /**
   * 删除键
   */
  async del(key: string | string[]): Promise<number> {
    return this.redis.del(...(Array.isArray(key) ? key : [key]));
  }

  /**
   * 检查键是否存在
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key);
    return result === 1;
  }

  /**
   * 设置过期时间
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    const result = await this.redis.expire(key, ttl);
    return result === 1;
  }

  /**
   * 获取剩余过期时间
   */
  async ttl(key: string): Promise<number> {
    return this.redis.ttl(key);
  }

  /**
   * 获取JSON对象
   */
  async getJson<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  /**
   * 设置JSON对象
   */
  async setJson(key: string, value: any, ttl?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttl);
  }

  /**
   * 模糊删除键
   */
  async delByPattern(pattern: string): Promise<number> {
    const keys = await this.redis.keys(pattern);
    if (keys.length === 0) return 0;
    return this.redis.del(...keys);
  }

  /**
   * 自增
   */
  async incr(key: string): Promise<number> {
    return this.redis.incr(key);
  }

  /**
   * 自减
   */
  async decr(key: string): Promise<number> {
    return this.redis.decr(key);
  }
}
