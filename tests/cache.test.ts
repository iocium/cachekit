import { createCacheKit } from '../src/lib/cache';
import { MemoryBackend } from '../src/lib/memory';

const mockBackend = () => {
  const store = new Map<string, any>();
  return {
    get: jest.fn((key) => Promise.resolve(store.get(key))),
    set: jest.fn((key, record) => {
      store.set(key, record);
      return Promise.resolve(); // <-- important: return void
    }),
    delete: jest.fn((key) => {
      store.delete(key);
      return Promise.resolve(); // <-- also return void
    }),
    clear: jest.fn(() => {
      store.clear();
      return Promise.resolve(); // <-- and here too
    }),
  };
};

describe('createCacheKit', () => {
  it('uses MemoryBackend by default when no backend is provided', async () => {
    const cache = createCacheKit(); // no options
    await cache.set('foo', 'bar', 1000);
    const result = await cache.get('foo');
    expect(result).toBe('bar');
  });

  it('returns undefined for missing key', async () => {
    const backend = mockBackend();
    const cache = createCacheKit({ backend });
    expect(await cache.get('missing')).toBeUndefined();
  });

  it('returns value if present and not expired', async () => {
    const backend = mockBackend();
    const record = { value: 'ok', expiresAt: Date.now() + 10000 };
    await backend.set('key', record);
    const cache = createCacheKit({ backend });
    expect(await cache.get('key')).toBe('ok');
  });

  it('evicts expired value', async () => {
    const backend = mockBackend();
    const expired = { value: 'expired', expiresAt: Date.now() - 1000 };
    await backend.set('expired', expired);
    const cache = createCacheKit({ backend });
    expect(await cache.get('expired')).toBeUndefined();
    expect(backend.delete).toHaveBeenCalledWith('expired');
  });

  it('writes and clears correctly', async () => {
    const backend = mockBackend();
    const cache = createCacheKit({ backend });
    await cache.set('foo', 42, 1000);
    expect(backend.set).toHaveBeenCalled();
    await cache.clear();
    expect(backend.clear).toHaveBeenCalled();
  });

  it('deletes correctly', async () => {
    const backend = new MemoryBackend();
    const cache = createCacheKit({ backend });
  
    await cache.set('to-delete', 'value', 1000);
    await cache.delete('to-delete');
  
    const result = await cache.get('to-delete');
    expect(result).toBeUndefined();
  });

  it('stores a value without TTL', async () => {
    const backend = new MemoryBackend();
    const cache = createCacheKit({ backend });
  
    await cache.set('permanent', 'data'); // no TTL
    const result = await cache.get('permanent');
  
    expect(result).toBe('data');
  });  
});