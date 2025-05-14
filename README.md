# @iocium/cachekit

**A flexible caching adapter with pluggable backends for Node.js and serverless environments**

---

## ✨ Features

- ✅ Modular backend support: Memory, Redis, Memcached, Cloudflare KV, Cloudflare D1
- ✅ TTL and automatic expiry logic
- ✅ Works in Node.js and edge/serverless environments
- ✅ Fully typed and tested with 100% coverage

---

## 📦 Installation

```bash
npm install @iocium/cachekit
```

---

## 🚀 Usage

```ts
import { createCacheKit, MemoryBackend } from '@iocium/cachekit';

const cache = createCacheKit();
await cache.set('key', 'value', 5000); // TTL in ms
const result = await cache.get('key');
```

---

## 🧩 Using Custom Backends

### Redis
```ts
import { RedisBackend } from '@iocium/cachekit';
import { createClient } from 'redis';

const client = createClient();
await client.connect();
const cache = createCacheKit({ backend: new RedisBackend(client) });
```

### Memcached
```ts
import { MemcachedBackend } from '@iocium/cachekit';
import Memcached from 'memcached';

const memcached = new Memcached('localhost:11211');
const cache = createCacheKit({ backend: new MemcachedBackend(memcached) });
```

### Cloudflare KV (in Workers)
```ts
import { KVBackend } from '@iocium/cachekit';
const cache = createCacheKit({ backend: new KVBackend(MY_KV_NAMESPACE) });
```

### Cloudflare D1 (in Workers)
```ts
import { D1Backend } from '@iocium/cachekit';
const cache = createCacheKit({ backend: new D1Backend(MY_D1_INSTANCE) });
```

> D1 requires a `cache` table:  
```text
CREATE TABLE cache (
  key TEXT PRIMARY KEY,
  value TEXT,
  expiresAt INTEGER
);
```

---

## 🧪 Testing

```bash
npm run test
npm run test:coverage
```

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Made with 💙 by [Iocium](https://github.com/iocium)