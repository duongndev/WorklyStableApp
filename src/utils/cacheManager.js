/**
 * Cache Manager để tránh gọi API liên tục
 * Sử dụng memory cache với TTL (Time To Live) và advanced features
 */

class CacheManager {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 phút
    this.maxSize = 100; // Maximum cache entries
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      cleanups: 0,
    };
  }

  /**
   * Tạo cache key từ action type và params
   * @param {string} actionType - Redux action type
   * @param {Object} params - Parameters của API call
   * @returns {string} - Cache key
   */
  createKey(actionType, params = {}) {
    const paramString = JSON.stringify(params);
    return `${actionType}_${paramString}`;
  }

  /**
   * Lưu data vào cache với LRU eviction
   * @param {string} key - Cache key
   * @param {*} data - Data cần cache
   * @param {number} ttl - Time to live (ms)
   */
  set(key, data, ttl = this.defaultTTL) {
    // Evict oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    const expiresAt = Date.now() + ttl;
    this.cache.set(key, {
      data,
      expiresAt,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 0,
    });
    
    this.stats.sets++;
    console.log(`💾 Cache SET: ${key} (TTL: ${ttl}ms)`);
  }

  /**
   * Lấy data từ cache
   * @param {string} key - Cache key
   * @returns {*} - Cached data hoặc null nếu expired/không tồn tại
   */
  get(key) {
    const cached = this.cache.get(key);

    if (!cached) {
      this.stats.misses++;
      console.log(`❌ Cache MISS: ${key}`);
      return null;
    }

    // Kiểm tra expiration
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      console.log(`⏰ Cache EXPIRED: ${key}`);
      return null;
    }

    // Update access statistics
    cached.lastAccessed = Date.now();
    cached.accessCount++;
    this.stats.hits++;
    
    console.log(`🎯 Cache HIT: ${key} (accessed ${cached.accessCount} times)`);
    return cached.data;
  }

  /**
   * Kiểm tra xem data có trong cache và còn valid không
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Xóa một cache entry
   * @param {string} key - Cache key
   */
  delete(key) {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
      console.log(`🗑️ Cache DELETE: ${key}`);
    }
    return deleted;
  }

  /**
   * Xóa tất cả cache
   */
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.deletes += size;
    console.log(`🧹 Cache CLEAR: ${size} entries removed`);
  }

  /**
   * Evict oldest entry (LRU)
   */
  evictOldest() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, value] of this.cache.entries()) {
      if (value.lastAccessed < oldestTime) {
        oldestTime = value.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log(`📤 Cache EVICT: ${oldestKey} (LRU)`);
    }
  }

  /**
   * Xóa cache đã expired
   */
  cleanup() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiresAt) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    this.stats.cleanups++;
    console.log(`🧹 Cache CLEANUP: ${cleanedCount} expired entries removed`);
    return cleanedCount;
  }

  /**
   * Lấy thông tin cache stats chi tiết
   * @returns {Object} - Cache statistics
   */
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;
    let totalSize = 0;
    let oldestEntry = null;
    let newestEntry = null;

    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiresAt) {
        expiredEntries++;
      } else {
        validEntries++;
      }
      
      totalSize += JSON.stringify(value.data).length;
      
      if (!oldestEntry || value.createdAt < oldestEntry.createdAt) {
        oldestEntry = { key, ...value };
      }
      
      if (!newestEntry || value.createdAt > newestEntry.createdAt) {
        newestEntry = { key, ...value };
      }
    }

    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0;

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      hitRate: `${hitRate}%`,
      hits: this.stats.hits,
      misses: this.stats.misses,
      sets: this.stats.sets,
      deletes: this.stats.deletes,
      cleanups: this.stats.cleanups,
      totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
      oldestEntry: oldestEntry ? {
        key: oldestEntry.key,
        age: `${((now - oldestEntry.createdAt) / 1000).toFixed(2)}s`,
      } : null,
      newestEntry: newestEntry ? {
        key: newestEntry.key,
        age: `${((now - newestEntry.createdAt) / 1000).toFixed(2)}s`,
      } : null,
    };
  }

  /**
   * Invalidate cache theo pattern
   * @param {string} pattern - Pattern để match cache keys
   */
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern);
    let deletedCount = 0;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }
    
    console.log(`Cache PATTERN INVALIDATE: ${pattern} (${deletedCount} entries)`);
    return deletedCount;
  }

  /**
   * Get cache entries by prefix
   * @param {string} prefix - Key prefix
   * @returns {Array} - Array of matching entries
   */
  getByPrefix(prefix) {
    const entries = [];
    
    for (const [key, value] of this.cache.entries()) {
      if (key.startsWith(prefix)) {
        entries.push({ key, ...value });
      }
    }
    
    return entries;
  }

  /**
   * Set multiple entries at once
   * @param {Array} entries - Array of {key, data, ttl}
   */
  setMany(entries) {
    for (const { key, data, ttl } of entries) {
      this.set(key, data, ttl);
    }
  }

  /**
   * Get multiple entries at once
   * @param {Array} keys - Array of keys
   * @returns {Object} - Object with key-value pairs
   */
  getMany(keys) {
    const result = {};
    
    for (const key of keys) {
      result[key] = this.get(key);
    }
    
    return result;
  }
}

// Singleton instance
const cacheManager = new CacheManager();

// Auto cleanup mỗi 5 phút
setInterval(() => {
  cacheManager.cleanup();
}, 5 * 60 * 1000);

/**
 * Higher-order function để wrap async thunks với caching
 * @param {Function} asyncThunk - Redux async thunk
 * @param {Object} options - Cache options
 * @returns {Function} - Wrapped thunk
 */
export const withCache = (asyncThunk, options = {}) => {
  const { ttl = 5 * 60 * 1000, skipCache = false } = options;

  return params => async (dispatch, getState) => {
    if (skipCache) {
      return dispatch(asyncThunk(params));
    }

    const cacheKey = cacheManager.createKey(asyncThunk.typePrefix, params);
    const cachedData = cacheManager.get(cacheKey);

    if (cachedData) {
      console.log(`Cache HIT for ${asyncThunk.typePrefix}`);
      // Return cached data as fulfilled action
      return {
        type: asyncThunk.fulfilled.type,
        payload: cachedData,
        meta: { cached: true },
      };
    }

    console.log(`Cache MISS for ${asyncThunk.typePrefix}, fetching...`);
    const result = await dispatch(asyncThunk(params));

    // Cache successful results
    if (result.type.endsWith('/fulfilled')) {
      cacheManager.set(cacheKey, result.payload, ttl);
    }

    return result;
  };
};

/**
 * Hook để sử dụng cache trong components
 */
export const useCache = () => {
  return {
    get: key => cacheManager.get(key),
    set: (key, data, ttl) => cacheManager.set(key, data, ttl),
    has: key => cacheManager.has(key),
    delete: key => cacheManager.delete(key),
    clear: () => cacheManager.clear(),
    invalidatePattern: pattern => cacheManager.invalidatePattern(pattern),
    getStats: () => cacheManager.getStats(),
    getByPrefix: prefix => cacheManager.getByPrefix(prefix),
    setMany: entries => cacheManager.setMany(entries),
    getMany: keys => cacheManager.getMany(keys),
  };
};

/**
 * Cache TTL constants
 */
export const CACHE_TTL = {
  IMMEDIATE: 0, // No caching
  VERY_SHORT: 30 * 1000, // 30 giây
  SHORT: 1 * 60 * 1000, // 1 phút
  MEDIUM: 5 * 60 * 1000, // 5 phút
  LONG: 15 * 60 * 1000, // 15 phút
  VERY_LONG: 60 * 60 * 1000, // 1 giờ
  SESSION: 24 * 60 * 60 * 1000, // 24 giờ
};

export default cacheManager;
