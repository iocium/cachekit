import type { CacheBackend, CacheRecord } from '../types';

/**
 * A Cloudflare KV-based backend implementation.
 */
export class KVBackend implements CacheBackend {
  constructor(private kv: KVNamespace) {}

  async get(key: string): Promise<CacheRecord | undefined> {
    const data = await this.kv.get(key, 'json');
  
    if (
      typeof data === 'object' &&
      data !== null &&
      'value' in data
    ) {
      return data as CacheRecord;
    }
  
    return undefined;
  }

  async set(key: string, record: CacheRecord): Promise<void> {
    if (record.expiresAt !== undefined && (!Number.isInteger(record.expiresAt) || record.expiresAt < 0)) {
      throw new Error('expiresAt must be a non-negative integer if provided');
    }
    let ttl = record.expiresAt ? Math.ceil((record.expiresAt - Date.now()) / 1000) : undefined;
    if (ttl !== undefined && ttl < 90) {
      ttl = 90;
    }
    await this.kv.put(key, JSON.stringify(record), ttl ? { expirationTtl: ttl } : {});
  }

  async delete(key: string): Promise<void> {
    await this.kv.delete(key);
  }

  async clear(): Promise<void> {
    // Not supported
    throw new Error('KVBackend does not support clear()');
  }
}