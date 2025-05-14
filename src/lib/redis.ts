import type { CacheBackend, CacheRecord } from '../types';

/**
 * A Redis-backed cache implementation.
 */
export class RedisBackend implements CacheBackend {
  constructor(private redis: { get: Function; set: Function; del: Function; flushall: Function }) {}

  async get(key: string): Promise<CacheRecord | undefined> {
    const raw = await this.redis.get(key);
    return raw ? JSON.parse(raw) : undefined;
  }

  async set(key: string, record: CacheRecord): Promise<void> {
    if (record.expiresAt !== undefined && (!Number.isInteger(record.expiresAt) || record.expiresAt < 0)) {
      throw new Error('expiresAt must be a non-negative integer if provided');
    }
    const ttl = record.expiresAt ? Math.ceil((record.expiresAt - Date.now()) / 1000) : undefined;
    if (ttl) await this.redis.set(key, JSON.stringify(record), 'EX', ttl);
    else await this.redis.set(key, JSON.stringify(record));
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async clear(): Promise<void> {
    await this.redis.flushall();
  }
}