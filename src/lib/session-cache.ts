/**
 * Session caching layer
 *
 * Reduces database reads on every authenticated request by caching validated
 * session payloads in memory.
 *
 * Optional Redis support
 * ---------------------
 * Set the REDIS_URL environment variable and install ioredis:
 *   npm install ioredis
 *   npm install --save-dev @types/ioredis   (for TypeScript types, if needed)
 *
 * When REDIS_URL is present and ioredis can be imported, the Redis store is
 * used automatically.  Otherwise the app falls back to the in-process store.
 */

// ---------------------------------------------------------------------------
// In-process store
// ---------------------------------------------------------------------------

interface CacheEntry<T> {
  value: T;
  expiresAt: number; // unix ms
}

class InProcessCache {
  private readonly store = new Map<string, CacheEntry<unknown>>();
  private readonly maxSize: number;

  constructor(maxSize = 2000) {
    this.maxSize = maxSize;
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set<T>(key: string, value: T, ttlSeconds: number): void {
    // Simple eviction: remove the oldest entry when the store is full
    if (this.store.size >= this.maxSize) {
      const firstKey = this.store.keys().next().value;
      if (firstKey !== undefined) this.store.delete(firstKey);
    }
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  delete(key: string): void {
    this.store.delete(key);
  }
}

const inProcess = new InProcessCache();

// ---------------------------------------------------------------------------
// Redis client (loaded lazily – only when REDIS_URL is configured)
// ---------------------------------------------------------------------------

// Minimal interface so we can call ioredis without a hard dependency
interface RedisLike {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, exMode: 'EX', ttl: number): Promise<unknown>;
  del(key: string | string[]): Promise<unknown>;
}

let _redis: RedisLike | null = null;
let _redisChecked = false;

async function getRedis(): Promise<RedisLike | null> {
  if (_redisChecked) return _redis;
  _redisChecked = true;

  const url = process.env.REDIS_URL;
  if (!url) return null;

  try {
    // Dynamic import keeps ioredis optional.
    // Install it with: npm install ioredis
    // TypeScript: the module is intentionally absent until the user installs it.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    const { default: Redis } = await import('ioredis');
    _redis = new Redis(url) as unknown as RedisLike;
    console.log('[session-cache] Connected to Redis at', url.replace(/:\/\/.*@/, '://***@'));
  } catch {
    console.warn(
      '[session-cache] REDIS_URL is set but ioredis failed to load – ' +
        'run `npm install ioredis` or falling back to in-process cache.',
    );
  }

  return _redis;
}

// ---------------------------------------------------------------------------
// Default TTL
// ---------------------------------------------------------------------------

export const DEFAULT_CACHE_TTL = 300; // 5 minutes

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = await getRedis();
  if (redis) {
    const raw = await redis.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }
  return inProcess.get<T>(key);
}

export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds = DEFAULT_CACHE_TTL,
): Promise<void> {
  const redis = await getRedis();
  if (redis) {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    return;
  }
  inProcess.set(key, value, ttlSeconds);
}

export async function cacheDelete(key: string): Promise<void> {
  const redis = await getRedis();
  if (redis) {
    await redis.del(key);
    return;
  }
  inProcess.delete(key);
}
