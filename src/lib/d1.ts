import type { CacheBackend, CacheRecord } from '../types';

/**
 * A Cloudflare D1 backend using SQLite-like SQL syntax.
 */
export class D1Backend implements CacheBackend {
  constructor(private db: D1Database) {}

  async get(key: string): Promise<CacheRecord | undefined> {
    const result = await this.db.prepare(
      'SELECT value, expiresAt FROM cache WHERE key = ?'
    ).bind(key).first<{ value: string; expiresAt: number | null }>();

    if (!result || typeof result.value !== 'string') return undefined;

    return {
      value: JSON.parse(result.value),
      expiresAt: result.expiresAt ?? undefined,
    };
  }

  async set(key: string, record: CacheRecord): Promise<void> {
    if (record.expiresAt !== undefined && (!Number.isInteger(record.expiresAt) || record.expiresAt < 0)) {
      throw new Error('expiresAt must be a non-negative integer if provided');
    }
    await this.db.prepare('INSERT OR REPLACE INTO cache (key, value, expiresAt) VALUES (?, ?, ?)')
      .bind(key, JSON.stringify(record.value), record.expiresAt ?? null)
      .run();
  }

  async delete(key: string): Promise<void> {
    await this.db.prepare('DELETE FROM cache WHERE key = ?').bind(key).run();
  }

  async clear(): Promise<void> {
    await this.db.prepare('DELETE FROM cache').run();
  }
}