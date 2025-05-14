/**
 * Represents a cache entry, with optional expiration timestamp.
 */
export interface CacheRecord {
  value: any;
  expiresAt?: number;
}

/**
 * A backend interface that defines required cache operations.
 */
export interface CacheBackend {
  get(key: string): Promise<CacheRecord | undefined>;
  set(key: string, record: CacheRecord): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * A user-facing cache API for setting and retrieving values.
 */
export interface CacheKit {
  get(key: string): Promise<any>;
  set(key: string, value: any, ttlMs?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Configuration options for creating a cache instance.
 */
export interface CacheKitOptions {
  backend?: CacheBackend;
}