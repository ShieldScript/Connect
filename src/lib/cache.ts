/**
 * Simple in-memory cache for expensive queries
 * TTL-based expiration to reduce database load
 */

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();

  /**
   * Get a cached value if it exists and hasn't expired
   */
  get<T>(key: string, ttlMs: number): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const isExpired = Date.now() - entry.timestamp > ttlMs;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Set a cached value with current timestamp
   */
  set<T>(key: string, value: T): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear expired entries to prevent memory leaks
   */
  cleanup(ttlMs: number): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > ttlMs) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
  }
}

// Global cache instance
const globalCache = new MemoryCache();

// Auto-cleanup every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    globalCache.cleanup(10 * 60 * 1000); // Clean entries older than 10 minutes
  }, 10 * 60 * 1000);
}

export { globalCache as cache };

/**
 * Cache TTLs
 */
export const CACHE_TTL = {
  NEARBY_COUNT: 5 * 60 * 1000,   // 5 minutes
  NEARBY_PERSONS: 3 * 60 * 1000, // 3 minutes - for actual persons list
  UNREAD_COUNT: 2 * 60 * 1000,   // 2 minutes
  PROFILE: 10 * 60 * 1000,       // 10 minutes
} as const;
