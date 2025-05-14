import { D1Backend } from '../src/lib/d1';

describe('D1Backend', () => {
  const prepareMock = jest.fn();
  const db = { prepare: prepareMock } as unknown as D1Database;
  const backend = new D1Backend(db);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws if expiresAt is not a non-negative integer', async () => {
    const db = { prepare: () => ({ bind: () => ({ run: jest.fn() }) }) } as any;
    const backend = new D1Backend(db);
    await expect(backend.set('invalid', { value: 'test', expiresAt: -100 }))
      .rejects.toThrow('expiresAt must be a non-negative integer');
    await expect(backend.set('invalid', { value: 'test', expiresAt: 5.5 }))
      .rejects.toThrow('expiresAt must be a non-negative integer');
  });
  
  it('returns undefined for missing key', async () => {
    prepareMock.mockReturnValue({ bind: () => ({ first: () => Promise.resolve(null) }) });
    expect(await backend.get('nope')).toBeUndefined();
  });

  it('returns parsed result', async () => {
    const value = JSON.stringify({ hello: 'world' });
    prepareMock.mockReturnValue({
      bind: () => ({ first: () => Promise.resolve({ value, expiresAt: null }) }),
    });
    const result = await backend.get('yes');
    expect(result?.value).toEqual({ hello: 'world' });
  });

  it('sets and deletes keys', async () => {
    const run = jest.fn();
    const bind = jest.fn(() => ({ run }));
    prepareMock.mockReturnValue({ bind });

    await backend.set('key', { value: 42 });
    await backend.delete('key');
    expect(prepareMock).toHaveBeenCalledTimes(2);
  });

  it('clears all entries', async () => {
    const run = jest.fn();
    prepareMock.mockReturnValue({ run });
    await backend.clear();
    expect(run).toHaveBeenCalled();
  });
});