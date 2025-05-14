import { MemoryBackend } from '../src/lib/memory';

describe('MemoryBackend', () => {
  let backend: MemoryBackend;

  beforeEach(() => {
    backend = new MemoryBackend();
  });

  it('throws if expiresAt is not a non-negative integer', async () => {
    const backend = new MemoryBackend();
    await expect(backend.set('invalid', { value: 'test', expiresAt: -100 }))
      .rejects.toThrow('expiresAt must be a non-negative integer');
    await expect(backend.set('invalid', { value: 'test', expiresAt: 5.5 }))
      .rejects.toThrow('expiresAt must be a non-negative integer');
  });
  
  it('sets and gets a value', async () => {
    await backend.set('test', { value: 123 });
    expect(await backend.get('test')).toEqual({ value: 123 });
  });

  it('deletes a value', async () => {
    await backend.set('foo', { value: 'bar' });
    await backend.delete('foo');
    expect(await backend.get('foo')).toBeUndefined();
  });

  it('clears all values', async () => {
    await backend.set('one', { value: 1 });
    await backend.set('two', { value: 2 });
    await backend.clear();
    expect(await backend.get('one')).toBeUndefined();
    expect(await backend.get('two')).toBeUndefined();
  });
});