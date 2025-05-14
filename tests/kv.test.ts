import { KVBackend } from '../src/lib/kv';

describe('KVBackend', () => {
  const kvMock = {
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  };

  const backend = new KVBackend(kvMock as unknown as KVNamespace);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws if expiresAt is not a non-negative integer', async () => {
    const kv = { get: jest.fn(), put: jest.fn(), delete: jest.fn() } as any;
    const backend = new KVBackend(kv);
    await expect(backend.set('invalid', { value: 'test', expiresAt: -100 }))
      .rejects.toThrow('expiresAt must be a non-negative integer');
    await expect(backend.set('invalid', { value: 'test', expiresAt: 5.5 }))
      .rejects.toThrow('expiresAt must be a non-negative integer');
  });
  
  it('returns undefined for missing key', async () => {
    kvMock.get.mockResolvedValue(undefined);
    expect(await backend.get('missing')).toBeUndefined();
  });

  it('returns a parsed record', async () => {
    kvMock.get.mockResolvedValue({ value: 'ok', expiresAt: Date.now() + 10000 });
    expect(await backend.get('found')).toEqual(expect.objectContaining({ value: 'ok' }));
  });

  it('sets and deletes keys', async () => {
    await backend.set('x', { value: 'y', expiresAt: Date.now() + 5000 });
    expect(kvMock.put).toHaveBeenCalled();
    await backend.delete('x');
    expect(kvMock.delete).toHaveBeenCalled();
  });

  it('throws on clear()', async () => {
    await expect(backend.clear()).rejects.toThrow('KVBackend does not support clear()');
  });

  it('sets a key with no TTL (uses default options)', async () => {
    const kvMock = {
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    };
  
    const backend = new KVBackend(kvMock as unknown as KVNamespace);
  
    const record = { value: 'no-expiry' };
    await backend.set('no-ttl', record); // no expiresAt field
  
    expect(kvMock.put).toHaveBeenCalledWith('no-ttl', JSON.stringify(record), {});
  });
});