import { MemcachedBackend } from '../src/lib/memcached';

describe('MemcachedBackend', () => {
  const mockStore = new Map<string, string>();
  const mockClient = {
    get: (key: string, cb: (err: any, val: string | undefined) => void) =>
      cb(null, mockStore.get(key)),
    set: (key: string, val: string, ttl: number, cb: (err?: any) => void) => {
      mockStore.set(key, val);
      cb();
    },
    del: (key: string, cb: (err?: any) => void) => {
      mockStore.delete(key);
      cb();
    },
    flush: (cb: (err?: any) => void) => {
      mockStore.clear();
      cb();
    }
  };

  const backend = new MemcachedBackend(mockClient);

  beforeEach(() => mockStore.clear());

  it('sets and retrieves a value', async () => {
    await backend.set('foo', { value: 42 });
    expect(await backend.get('foo')).toEqual({ value: 42 });
  });

  it('deletes a value', async () => {
    await backend.set('temp', { value: 1 });
    await backend.delete('temp');
    expect(await backend.get('temp')).toBeUndefined();
  });

  it('clears all values', async () => {
    await backend.set('a', { value: 'a' });
    await backend.set('b', { value: 'b' });
    await backend.clear();
    expect(await backend.get('a')).toBeUndefined();
    expect(await backend.get('b')).toBeUndefined();
  });

  it('throws if expiresAt is invalid', async () => {
    await expect(backend.set('fail', { value: 'bad', expiresAt: -1 }))
      .rejects.toThrow('expiresAt must be a non-negative integer');
  });

  it('returns undefined if JSON result is not a valid CacheRecord', async () => {
    mockStore.set('bad1', JSON.stringify({ notValue: true }));
    mockStore.set('bad2', JSON.stringify('just-a-string'));
  
    expect(await backend.get('bad1')).toBeUndefined();
    expect(await backend.get('bad2')).toBeUndefined();
  });

  it('sets with TTL and handles callback success', async () => {
    const now = Date.now();
    const future = now + 30000;
  
    const record = { value: 'with-expiry', expiresAt: future };
    await backend.set('ttl-key', record);
    expect(await backend.get('ttl-key')).toEqual(record);
  });

  it('throws if memcached.set callback returns an error', async () => {
    const errorClient = {
      ...mockClient,
      set: (key: string, val: string, ttl: number, cb: (err?: any) => void) => {
        cb(new Error('set failed'));
      }
    };
  
    const backendWithError = new MemcachedBackend(errorClient);
  
    await expect(
      backendWithError.set('fail-key', { value: 'error', expiresAt: Date.now() + 1000 })
    ).rejects.toThrow('set failed');
  });

  it('throws if memcached.del callback returns an error', async () => {
    const errorClient = {
      ...mockClient,
      del: (_key: string, cb: (err?: any) => void) => cb(new Error('delete failed'))
    };
  
    const failingBackend = new MemcachedBackend(errorClient);
    await expect(failingBackend.delete('some-key')).rejects.toThrow('delete failed');
  });

  it('throws if memcached.flush callback returns an error', async () => {
    const errorClient = {
      ...mockClient,
      flush: (cb: (err?: any) => void) => cb(new Error('flush failed'))
    };
  
    const failingBackend = new MemcachedBackend(errorClient);
    await expect(failingBackend.clear()).rejects.toThrow('flush failed');
  });  
});