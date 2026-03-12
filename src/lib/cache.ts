interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL_HOURS = parseInt(process.env.CACHE_TTL_HOURS || '12', 10);

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;

  const ttlMs = DEFAULT_TTL_HOURS * 60 * 60 * 1000;
  if (Date.now() - entry.timestamp > ttlMs) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

export function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export function clearCache(): void {
  cache.clear();
}
