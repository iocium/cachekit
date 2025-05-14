import type { CacheBackend, CacheRecord } from '../types';

/**
 * A Memcached-based cache implementation.
 */
export class MemcachedBackend implements CacheBackend {
  constructor(private memcached: { get: Function; set: Function; del: Function; flush: Function }) {}

  async get(key: string): Promise<CacheRecord | undefined> {
    const raw = await new Promise<string | undefined>((resolve) => {
      this.memcached.get(key, (err: any, data: string) => resolve(data));
    });

    if (!raw) return undefined;
    const data = JSON.parse(raw);
    if (typeof data === 'object' && data !== null && 'value' in data) {
      return data as CacheRecord;
    }
    return undefined;
  }

  async set(key: string, record: CacheRecord): Promise<void> {
    if (record.expiresAt !== undefined && (!Number.isInteger(record.expiresAt) || record.expiresAt < 0)) {
      throw new Error('expiresAt must be a non-negative integer if provided');
    }

    const ttl = record.expiresAt ? Math.ceil((record.expiresAt - Date.now()) / 1000) : 0;
    await new Promise<void>((resolve, reject) => {
      this.memcached.set(key, JSON.stringify(record), ttl, (err: any) => err ? reject(err) : resolve());
    });
  }

  async delete(key: string): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.memcached.del(key, (err: any) => err ? reject(err) : resolve());
    });
  }

  async clear(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.memcached.flush((err: any) => err ? reject(err) : resolve());
    });
  }
}