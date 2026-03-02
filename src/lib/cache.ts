import type { CacheEntry, DashboardData } from '@/types/metrics';

const CACHE_TTL_MS =
  parseInt(process.env.CACHE_TTL_HOURS ?? '12', 10) * 60 * 60 * 1000;

const store = new Map<string, CacheEntry>();

export function getCached(): DashboardData | null {
  const entry = store.get('data');
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttl) {
    store.delete('data');
    return null;
  }
  return entry.data;
}

export function getStale(): DashboardData | null {
  const entry = store.get('data');
  if (!entry) return null;
  return { ...entry.data, fromCache: true };
}

export function setCache(data: DashboardData): void {
  store.set('data', { data, timestamp: Date.now(), ttl: CACHE_TTL_MS });
}

export function invalidateCache(): void {
  store.delete('data');
}
