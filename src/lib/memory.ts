import type { CacheBackend, CacheRecord } from '../types';

/**
 * A simple in-memory cache backend using Map.
 */
export class MemoryBackend implements CacheBackend {
  private store = new Map<string, CacheRecord>();

  async get(key: string) {
    return this.store.get(key);
  }

  async set(key: string, record: CacheRecord) {
    if (record.expiresAt !== undefined && (!Number.isInteger(record.expiresAt) || record.expiresAt < 0)) {
      throw new Error('expiresAt must be a non-negative integer if provided');
    }
    this.store.set(key, record);
  }

  async delete(key: string) {
    this.store.delete(key);
  }

  async clear() {
    this.store.clear();
  }
}