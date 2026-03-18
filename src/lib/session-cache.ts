/**
 * Session caching layer
 *
 * Reduces database reads on every authenticated request by caching validated
 * session payloads in memory.
 *
 * Redis support
 * -------------
 * Set the REDIS_URL environment variable to enable the Redis store.
 * When REDIS_URL is present the Redis store is used automatically.
 * Otherwise the app falls back to the in-process store.
 */

import Redis from 'ioredis';

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
// Redis client (only connected when REDIS_URL is configured)
// ---------------------------------------------------------------------------

let _redis: Redis | null = null;
let _redisChecked = false;

async function getRedis(): Promise<Redis | null> {
  if (_redisChecked) return _redis;
  _redisChecked = true;

  const url = process.env.REDIS_URL;
  if (!url) return null;

  _redis = new Redis(url);
  console.log('[session-cache] Connected to Redis at', url.replace(/:\/\/.*@/, '://***@'));

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
    try {
      const raw = await redis.get(key);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    } catch (error) {
      // Redis error – log and fall back to in-process cache
      console.warn('[session-cache] Redis get failed:', error);
      return inProcess.get<T>(key);
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
    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      return;
    } catch (error) {
      // Redis error – log and fall back to in-process cache
      console.warn('[session-cache] Redis set failed:', error);
    }
  }
  inProcess.set(key, value, ttlSeconds);
}

export async function cacheDelete(key: string): Promise<void> {
  const redis = await getRedis();
  if (redis) {
    try {
      await redis.del(key);
      return;
    } catch (error) {
      // Redis error – log and fall back to in-process cache
      console.warn('[session-cache] Redis delete failed:', error);
    }
  }
  inProcess.delete(key);
}
