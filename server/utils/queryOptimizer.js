import { Op } from 'sequelize';
import { Logger } from '../middleware/errorHandler.js';

/**
 * 查询优化器类
 * 提供数据库查询优化、缓存和性能监控功能
 */
export class QueryOptimizer {
  constructor() {
    this.cache = new Map();
    this.queryStats = new Map();
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.defaultTTL = 300000; // 5分钟默认缓存时间
  }

  /**
   * 生成缓存键
   */
  generateCacheKey(model, query, options = {}) {
    const key = {
      model: model.name,
      query: JSON.stringify(query),
      options: JSON.stringify(options)
    };
    return Buffer.from(JSON.stringify(key)).toString('base64');
  }

  /**
   * 设置缓存
   */
  setCache(key, data, ttl = this.defaultTTL) {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { data, expiry });
    
    // 清理过期缓存
    this.cleanExpiredCache();
  }

  /**
   * 获取缓存
   */
  getCache(key) {
    const cached = this.cache.get(key);
    if (!cached) {
      this.cacheMisses++;
      return null;
    }
    
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      this.cacheMisses++;
      return null;
    }
    
    this.cacheHits++;
    return cached.data;
  }

  /**
   * 清理过期缓存
   */
  cleanExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiry) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 清除所有缓存
   */
  clearCache() {
    this.cache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  /**
   * 清除特定模型的缓存
   */
  clearModelCache(modelName) {
    for (const [key, value] of this.cache.entries()) {
      try {
        const keyData = JSON.parse(Buffer.from(key, 'base64').toString());
        if (keyData.model === modelName) {
          this.cache.delete(key);
        }
      } catch (error) {
        // 忽略解析错误
      }
    }
  }

  /**
   * 优化的查询方法
   */
  async optimizedQuery(model, queryType, query = {}, options = {}) {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(model, { queryType, query }, options);
    
    // 检查缓存
    if (options.useCache !== false) {
      const cached = this.getCache(cacheKey);
      if (cached) {
        this.recordQueryStats(model.name, queryType, Date.now() - startTime, true);
        return cached;
      }
    }

    try {
      let result;
      
      switch (queryType) {
        case 'findAll':
          result = await this.optimizedFindAll(model, query, options);
          break;
        case 'findOne':
          result = await this.optimizedFindOne(model, query, options);
          break;
        case 'findByPk':
          result = await this.optimizedFindByPk(model, query.id, options);
          break;
        case 'count':
          result = await this.optimizedCount(model, query, options);
          break;
        case 'findAndCountAll':
          result = await this.optimizedFindAndCountAll(model, query, options);
          break;
        default:
          throw new Error(`Unsupported query type: ${queryType}`);
      }

      // 缓存结果
      if (options.useCache !== false && result) {
        this.setCache(cacheKey, result, options.cacheTTL);
      }

      this.recordQueryStats(model.name, queryType, Date.now() - startTime, false);
      return result;
    } catch (error) {
      this.recordQueryStats(model.name, queryType, Date.now() - startTime, false, error);
      throw error;
    }
  }

  /**
   * 优化的findAll查询
   */
  async optimizedFindAll(model, query = {}, options = {}) {
    const optimizedOptions = {
      ...options,
      // 添加默认排序以提高查询性能
      order: options.order || [['createdAt', 'DESC']],
      // 限制默认查询数量
      limit: options.limit || 50
    };

    // 优化include查询
    if (optimizedOptions.include) {
      optimizedOptions.include = this.optimizeIncludes(optimizedOptions.include);
    }

    return await model.findAll({
      where: query,
      ...optimizedOptions
    });
  }

  /**
   * 优化的findOne查询
   */
  async optimizedFindOne(model, query = {}, options = {}) {
    const optimizedOptions = {
      ...options
    };

    // 优化include查询
    if (optimizedOptions.include) {
      optimizedOptions.include = this.optimizeIncludes(optimizedOptions.include);
    }

    return await model.findOne({
      where: query,
      ...optimizedOptions
    });
  }

  /**
   * 优化的findByPk查询
   */
  async optimizedFindByPk(model, id, options = {}) {
    const optimizedOptions = {
      ...options
    };

    // 优化include查询
    if (optimizedOptions.include) {
      optimizedOptions.include = this.optimizeIncludes(optimizedOptions.include);
    }

    return await model.findByPk(id, optimizedOptions);
  }

  /**
   * 优化的count查询
   */
  async optimizedCount(model, query = {}, options = {}) {
    return await model.count({
      where: query,
      ...options
    });
  }

  /**
   * 优化的findAndCountAll查询
   */
  async optimizedFindAndCountAll(model, query = {}, options = {}) {
    const optimizedOptions = {
      ...options,
      // 添加默认排序
      order: options.order || [['createdAt', 'DESC']],
      // 限制默认查询数量
      limit: options.limit || 20,
      offset: options.offset || 0
    };

    // 优化include查询
    if (optimizedOptions.include) {
      optimizedOptions.include = this.optimizeIncludes(optimizedOptions.include);
    }

    return await model.findAndCountAll({
      where: query,
      ...optimizedOptions
    });
  }

  /**
   * 优化include查询
   */
  optimizeIncludes(includes) {
    if (!Array.isArray(includes)) {
      includes = [includes];
    }

    return includes.map(include => {
      if (typeof include === 'object' && include.model) {
        return {
          ...include,
          // 添加必要的属性选择以减少数据传输
          attributes: include.attributes || { exclude: ['createdAt', 'updatedAt'] }
        };
      }
      return include;
    });
  }

  /**
   * 记录查询统计
   */
  recordQueryStats(modelName, queryType, duration, fromCache, error = null) {
    const key = `${modelName}.${queryType}`;
    const stats = this.queryStats.get(key) || {
      count: 0,
      totalDuration: 0,
      avgDuration: 0,
      errors: 0,
      cacheHits: 0
    };

    stats.count++;
    if (fromCache) {
      stats.cacheHits++;
    } else {
      stats.totalDuration += duration;
      stats.avgDuration = stats.totalDuration / (stats.count - stats.cacheHits);
    }
    
    if (error) {
      stats.errors++;
      Logger.error(`Query error for ${key}`, error);
    }

    this.queryStats.set(key, stats);

    // 记录慢查询
    if (!fromCache && duration > 1000) {
      Logger.warn(`Slow query detected: ${key} took ${duration}ms`);
    }
  }

  /**
   * 获取查询统计信息
   */
  getQueryStats() {
    const stats = {};
    for (const [key, value] of this.queryStats.entries()) {
      stats[key] = value;
    }
    
    return {
      queries: stats,
      cache: {
        hits: this.cacheHits,
        misses: this.cacheMisses,
        hitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) || 0,
        size: this.cache.size
      }
    };
  }

  /**
   * 分页查询助手
   */
  getPaginationOptions(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    return {
      limit: Math.min(limit, 100), // 最大限制100条
      offset: Math.max(offset, 0)
    };
  }

  /**
   * 构建搜索查询
   */
  buildSearchQuery(searchTerm, searchFields) {
    if (!searchTerm || !searchFields || searchFields.length === 0) {
      return {};
    }

    const searchConditions = searchFields.map(field => ({
      [field]: {
        [Op.like]: `%${searchTerm}%`
      }
    }));

    return {
      [Op.or]: searchConditions
    };
  }

  /**
   * 构建日期范围查询
   */
  buildDateRangeQuery(field, startDate, endDate) {
    const query = {};
    
    if (startDate || endDate) {
      query[field] = {};
      
      if (startDate) {
        query[field][Op.gte] = new Date(startDate);
      }
      
      if (endDate) {
        query[field][Op.lte] = new Date(endDate);
      }
    }
    
    return query;
  }

  /**
   * 构建排序选项
   */
  buildOrderOptions(sortBy, sortOrder = 'DESC') {
    if (!sortBy) {
      return [['createdAt', 'DESC']];
    }

    const validOrders = ['ASC', 'DESC'];
    const order = validOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
    
    return [[sortBy, order]];
  }
}

// 创建全局查询优化器实例
export const queryOptimizer = new QueryOptimizer();

/**
 * 查询装饰器 - 用于自动应用查询优化
 */
export function optimizeQuery(options = {}) {
  return function(target, propertyName, descriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function(...args) {
      const startTime = Date.now();
      
      try {
        const result = await method.apply(this, args);
        
        const duration = Date.now() - startTime;
        if (duration > 500) {
          Logger.warn(`Slow operation detected: ${target.constructor.name}.${propertyName} took ${duration}ms`);
        }
        
        return result;
      } catch (error) {
        Logger.error(`Error in ${target.constructor.name}.${propertyName}`, error);
        throw error;
      }
    };
    
    return descriptor;
  };
}

export default queryOptimizer;