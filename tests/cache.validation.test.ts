import { createCacheKit } from '../src/lib/cache';

describe('TTL validation', () => {
  it('throws if TTL is a negative number', async () => {
    const cache = createCacheKit();
    await expect(cache.set('key', 'value', -5)).rejects.toThrow('TTL must be a non-negative integer');
  });

  it('throws if TTL is a float', async () => {
    const cache = createCacheKit();
    await expect(cache.set('key', 'value', 1.5)).rejects.toThrow('TTL must be a non-negative integer');
  });

  it('does not throw for valid TTL', async () => {
    const cache = createCacheKit();
    await expect(cache.set('key', 'value', 1000)).resolves.toBeUndefined();
  });

  it('does not throw when TTL is undefined', async () => {
    const cache = createCacheKit();
    await expect(cache.set('key', 'value')).resolves.toBeUndefined();
  });
});