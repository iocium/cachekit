/**
 * Main entry point for the CacheKit library.
 * Exports core factory and available cache backends.
 */
export { createCacheKit } from './lib/cache';
export type { CacheKit, CacheKitOptions, CacheRecord, CacheBackend } from './types';

export { MemoryBackend } from './lib/memory';
export { KVBackend } from './lib/kv';
export { D1Backend } from './lib/d1';
export { RedisBackend } from './lib/redis';
export { MemcachedBackend } from './lib/memcached';