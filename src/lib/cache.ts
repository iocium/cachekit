import { MemoryBackend } from './memory';
import type { CacheKit, CacheBackend, CacheKitOptions } from '../types';

/**
 * Creates a new instance of an CacheKit with the specified backend.
 * Defaults to an in-memory backend if none is provided.
 *
 * @param options Optional configuration object specifying the backend.
 * @returns An CacheKit interface instance.
 */
export function createCacheKit(options: CacheKitOptions = {}): CacheKit {
  const backend: CacheBackend = options.backend || new MemoryBackend();

  return {
    /**
     * Retrieves a value from cache if it exists and is not expired.
     */
    async get(key) {
      const record = await backend.get(key);
      if (!record) return undefined;
      if (record.expiresAt && record.expiresAt < Date.now()) {
        await backend.delete(key);
        return undefined;
      }
      return record.value;
    },

    /**
     * Stores a value in the cache, with optional TTL.
     */
    async set(key, value, ttlMs) {
      if (ttlMs !== undefined && (!Number.isInteger(ttlMs) || ttlMs < 0)) {
        throw new Error('TTL must be a non-negative integer if provided');
      }
      const expiresAt = ttlMs ? Date.now() + ttlMs : undefined;
      await backend.set(key, { value, expiresAt });
    },


    /**
     * Deletes a key from the cache.
     */
    async delete(key) {
      await backend.delete(key);
    },

    /**
     * Clears all cache entries (where supported).
     */
    async clear() {
      await backend.clear();
    },
  };
}