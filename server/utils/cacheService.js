import { Logger } from '../middleware/errorHandler.js';

/**
 * 内存缓存服务
 * 提供高性能的内存缓存功能，支持TTL、LRU淘汰策略
 */
export class CacheService {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 1000; // 最大缓存条目数
    this.defaultTTL = options.defaultTTL || 300000; // 默认5分钟TTL
    this.cache = new Map();
    this.accessOrder = new Map(); // 用于LRU
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0
    };
    
    // 定期清理过期缓存
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // 每分钟清理一次
  }

  /**
   * 设置缓存
   */
  set(key, value, ttl = this.defaultTTL) {
    try {
      // 如果缓存已满，执行LRU淘汰
      if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
        this.evictLRU();
      }

      const expiry = Date.now() + ttl;
      const cacheItem = {
        value,
        expiry,
        accessCount: 0,
        createdAt: Date.now()
      };

      this.cache.set(key, cacheItem);
      this.accessOrder.set(key, Date.now());
      this.stats.sets++;

      Logger.debug(`Cache set: ${key} (TTL: ${ttl}ms)`);
      return true;
    } catch (error) {
      Logger.error('Cache set error', error);
      return false;
    }
  }

  /**
   * 获取缓存
   */
  get(key) {
    try {
      const item = this.cache.get(key);
      
      if (!item) {
        this.stats.misses++;
        return null;
      }

      // 检查是否过期
      if (Date.now() > item.expiry) {
        this.delete(key);
        this.stats.misses++;
        return null;
      }

      // 更新访问信息
      item.accessCount++;
      this.accessOrder.set(key, Date.now());
      this.stats.hits++;

      Logger.debug(`Cache hit: ${key}`);
      return item.value;
    } catch (error) {
      Logger.error('Cache get error', error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * 删除缓存
   */
  delete(key) {
    try {
      const deleted = this.cache.delete(key);
      this.accessOrder.delete(key);
      
      if (deleted) {
        this.stats.deletes++;
        Logger.debug(`Cache deleted: ${key}`);
      }
      
      return deleted;
    } catch (error) {
      Logger.error('Cache delete error', error);
      return false;
    }
  }

  /**
   * 检查缓存是否存在
   */
  has(key) {
    const item = this.cache.get(key);
    if (!item) return false;
    
    // 检查是否过期
    if (Date.now() > item.expiry) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * 清空所有缓存
   */
  clear() {
    this.cache.clear();
    this.accessOrder.clear();
    Logger.info('Cache cleared');
  }

  /**
   * 获取或设置缓存（如果不存在则执行回调函数）
   */
  async getOrSet(key, callback, ttl = this.defaultTTL) {
    let value = this.get(key);
    
    if (value === null) {
      try {
        value = await callback();
        if (value !== null && value !== undefined) {
          this.set(key, value, ttl);
        }
      } catch (error) {
        Logger.error(`Cache getOrSet callback error for key ${key}`, error);
        throw error;
      }
    }
    
    return value;
  }

  /**
   * 批量获取缓存
   */
  mget(keys) {
    const results = {};
    for (const key of keys) {
      results[key] = this.get(key);
    }
    return results;
  }

  /**
   * 批量设置缓存
   */
  mset(items, ttl = this.defaultTTL) {
    const results = {};
    for (const [key, value] of Object.entries(items)) {
      results[key] = this.set(key, value, ttl);
    }
    return results;
  }

  /**
   * 按模式删除缓存
   */
  deletePattern(pattern) {
    const regex = new RegExp(pattern);
    let deletedCount = 0;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.delete(key);
        deletedCount++;
      }
    }
    
    Logger.info(`Deleted ${deletedCount} cache entries matching pattern: ${pattern}`);
    return deletedCount;
  }

  /**
   * LRU淘汰策略
   */
  evictLRU() {
    let oldestKey = null;
    let oldestTime = Date.now();
    
    for (const [key, time] of this.accessOrder.entries()) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.delete(oldestKey);
      this.stats.evictions++;
      Logger.debug(`LRU evicted: ${oldestKey}`);
    }
  }

  /**
   * 清理过期缓存
   */
  cleanup() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      Logger.debug(`Cleaned up ${cleanedCount} expired cache entries`);
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    const hitRate = this.stats.hits / (this.stats.hits + this.stats.misses) || 0;
    
    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100,
      size: this.cache.size,
      maxSize: this.maxSize,
      memoryUsage: this.getMemoryUsage()
    };
  }

  /**
   * 获取内存使用情况（估算）
   */
  getMemoryUsage() {
    let totalSize = 0;
    
    for (const [key, item] of this.cache.entries()) {
      // 粗略估算内存使用
      totalSize += key.length * 2; // 字符串键
      totalSize += JSON.stringify(item.value).length * 2; // 值的大小
      totalSize += 64; // 对象开销
    }
    
    return {
      estimated: totalSize,
      entries: this.cache.size
    };
  }

  /**
   * 获取缓存键列表
   */
  keys() {
    return Array.from(this.cache.keys());
  }

  /**
   * 获取缓存详细信息
   */
  inspect() {
    const items = {};
    
    for (const [key, item] of this.cache.entries()) {
      items[key] = {
        expiry: new Date(item.expiry).toISOString(),
        accessCount: item.accessCount,
        createdAt: new Date(item.createdAt).toISOString(),
        ttl: item.expiry - Date.now()
      };
    }
    
    return {
      stats: this.getStats(),
      items
    };
  }

  /**
   * 销毁缓存服务
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
    Logger.info('Cache service destroyed');
  }
}

/**
 * 缓存装饰器
 * 用于自动缓存函数结果
 */
export function cached(options = {}) {
  const { ttl = 300000, keyGenerator } = options;
  
  return function(target, propertyName, descriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args) {
      const cacheKey = keyGenerator 
        ? keyGenerator(args) 
        : `${target.constructor.name}.${propertyName}.${JSON.stringify(args)}`;
      
      return await globalCache.getOrSet(cacheKey, async () => {
        return await originalMethod.apply(this, args);
      }, ttl);
    };
    
    return descriptor;
  };
}

/**
 * 缓存中间件
 * 用于HTTP响应缓存
 */
export function cacheMiddleware(options = {}) {
  const { ttl = 300000, keyGenerator, condition } = options;
  
  return (req, res, next) => {
    // 生成缓存键
    const cacheKey = keyGenerator 
      ? keyGenerator(req) 
      : `http.${req.method}.${req.originalUrl}`;
    
    // 检查缓存条件
    if (condition && !condition(req)) {
      return next();
    }
    
    // 尝试从缓存获取响应
    const cachedResponse = globalCache.get(cacheKey);
    if (cachedResponse) {
      Logger.debug(`HTTP cache hit: ${cacheKey}`);
      return res.json(cachedResponse);
    }
    
    // 拦截响应
    const originalJson = res.json;
    res.json = function(data) {
      // 缓存响应数据
      if (res.statusCode === 200) {
        globalCache.set(cacheKey, data, ttl);
        Logger.debug(`HTTP response cached: ${cacheKey}`);
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
}

// 创建全局缓存实例
export const globalCache = new CacheService({
  maxSize: 2000,
  defaultTTL: 300000 // 5分钟
});

// 创建专用缓存实例
export const userCache = new CacheService({
  maxSize: 500,
  defaultTTL: 600000 // 10分钟
});

export const activityCache = new CacheService({
  maxSize: 1000,
  defaultTTL: 180000 // 3分钟
});

export const feedbackCache = new CacheService({
  maxSize: 200,
  defaultTTL: 900000 // 15分钟
});

export default CacheService;