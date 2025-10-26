/**
 * Simple in-memory cache with TTL (Time To Live)
 * Prevents repeated expensive API calls
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  /**
   * Get cached data if it exists and hasn't expired
   * @param key - Cache key
   * @param ttlMs - Time to live in milliseconds
   * @returns Cached data or null if expired/missing
   */
  get<T>(key: string, ttlMs: number): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const age = Date.now() - entry.timestamp;

    if (age > ttlMs) {
      // Cache expired, remove it
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cache data
   * @param key - Cache key
   * @param data - Data to cache
   */
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear specific cache entry
   * @param key - Cache key to clear
   */
  clear(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clearAll(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const cache = new SimpleCache();

// Cache keys
export const CACHE_KEYS = {
  THEME: 'theme',
  FEED: 'feed',
  REDDIT_POSTS: 'reddit_posts',
} as const;

// Cache TTLs (Time To Live in milliseconds)
export const CACHE_TTL = {
  THEME: 5 * 60 * 1000, // 5 minutes
  FEED: 2 * 60 * 1000,  // 2 minutes
  REDDIT_POSTS: 2 * 60 * 1000, // 2 minutes
} as const;
