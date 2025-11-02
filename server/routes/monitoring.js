import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { queryOptimizer } from '../utils/queryOptimizer.js';
import { globalCache, activityCache, userCache } from '../utils/cacheService.js';
import { Logger } from '../middleware/errorHandler.js';
import os from 'os';

const router = express.Router();

// @route   GET /api/monitoring/performance
// @desc    Get performance metrics
// @access  Private (Admin only)
router.get('/performance', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin (you might want to implement proper admin check)
    // For now, we'll allow any authenticated user
    
    const metrics = {
      timestamp: new Date().toISOString(),
      system: {
        uptime: process.uptime(),
        memory: {
          used: process.memoryUsage(),
          system: {
            total: os.totalmem(),
            free: os.freemem(),
            usage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2) + '%'
          }
        },
        cpu: {
          loadAverage: os.loadavg(),
          cpuCount: os.cpus().length
        },
        platform: os.platform(),
        nodeVersion: process.version
      },
      database: {
        queryStats: queryOptimizer.getStats(),
        connectionPool: {
          // This would need to be implemented based on your database setup
          active: 'N/A',
          idle: 'N/A',
          total: 'N/A'
        }
      },
      cache: {
        global: globalCache.getStats(),
        activity: activityCache.getStats(),
        user: userCache.getStats()
      },
      requests: {
        // This would need request tracking middleware
        total: 'N/A',
        errors: 'N/A',
        averageResponseTime: 'N/A'
      }
    };

    res.json({
      success: true,
      metrics
    });
  } catch (error) {
    Logger.error('Performance metrics error:', error);
    res.status(500).json({
      error: 'Failed to get performance metrics',
      message: error.message
    });
  }
});

// @route   GET /api/monitoring/cache
// @desc    Get cache statistics
// @access  Private (Admin only)
router.get('/cache', authenticateToken, async (req, res) => {
  try {
    const cacheStats = {
      timestamp: new Date().toISOString(),
      caches: {
        global: {
          ...globalCache.getStats(),
          keys: globalCache.keys()
        },
        activity: {
          ...activityCache.getStats(),
          keys: activityCache.keys()
        },
        user: {
          ...userCache.getStats(),
          keys: userCache.keys()
        }
      },
      summary: {
        totalSize: globalCache.size + activityCache.size + userCache.size,
        totalHits: globalCache.getStats().hits + activityCache.getStats().hits + userCache.getStats().hits,
        totalMisses: globalCache.getStats().misses + activityCache.getStats().misses + userCache.getStats().misses
      }
    };

    // Calculate overall hit rate
    const totalRequests = cacheStats.summary.totalHits + cacheStats.summary.totalMisses;
    cacheStats.summary.hitRate = totalRequests > 0 ? 
      ((cacheStats.summary.totalHits / totalRequests) * 100).toFixed(2) + '%' : '0%';

    res.json({
      success: true,
      cacheStats
    });
  } catch (error) {
    Logger.error('Cache stats error:', error);
    res.status(500).json({
      error: 'Failed to get cache statistics',
      message: error.message
    });
  }
});

// @route   POST /api/monitoring/cache/clear
// @desc    Clear cache
// @access  Private (Admin only)
router.post('/cache/clear', authenticateToken, async (req, res) => {
  try {
    const { cacheType } = req.body;

    let cleared = 0;
    
    if (!cacheType || cacheType === 'all') {
      cleared += globalCache.clear();
      cleared += activityCache.clear();
      cleared += userCache.clear();
      Logger.info('All caches cleared by admin', { userId: req.user.id });
    } else {
      switch (cacheType) {
        case 'global':
          cleared = globalCache.clear();
          break;
        case 'activity':
          cleared = activityCache.clear();
          break;
        case 'user':
          cleared = userCache.clear();
          break;
        default:
          return res.status(400).json({
            error: 'Invalid cache type. Use: global, activity, user, or all'
          });
      }
      Logger.info(`${cacheType} cache cleared by admin`, { userId: req.user.id });
    }

    res.json({
      success: true,
      message: `Cache cleared successfully`,
      clearedEntries: cleared
    });
  } catch (error) {
    Logger.error('Cache clear error:', error);
    res.status(500).json({
      error: 'Failed to clear cache',
      message: error.message
    });
  }
});

// @route   GET /api/monitoring/database
// @desc    Get database performance metrics
// @access  Private (Admin only)
router.get('/database', authenticateToken, async (req, res) => {
  try {
    const dbStats = queryOptimizer.getStats();
    
    const metrics = {
      timestamp: new Date().toISOString(),
      queries: {
        total: dbStats.totalQueries,
        cached: dbStats.cacheHits,
        uncached: dbStats.totalQueries - dbStats.cacheHits,
        cacheHitRate: dbStats.totalQueries > 0 ? 
          ((dbStats.cacheHits / dbStats.totalQueries) * 100).toFixed(2) + '%' : '0%'
      },
      performance: {
        averageQueryTime: dbStats.averageQueryTime ? 
          dbStats.averageQueryTime.toFixed(2) + 'ms' : 'N/A',
        slowQueries: dbStats.slowQueries || 0,
        optimizedQueries: dbStats.optimizedQueries || 0
      },
      operations: dbStats.operationStats || {}
    };

    res.json({
      success: true,
      metrics
    });
  } catch (error) {
    Logger.error('Database metrics error:', error);
    res.status(500).json({
      error: 'Failed to get database metrics',
      message: error.message
    });
  }
});

// @route   POST /api/monitoring/database/reset-stats
// @desc    Reset database statistics
// @access  Private (Admin only)
router.post('/database/reset-stats', authenticateToken, async (req, res) => {
  try {
    queryOptimizer.resetStats();
    Logger.info('Database statistics reset by admin', { userId: req.user.id });
    
    res.json({
      success: true,
      message: 'Database statistics reset successfully'
    });
  } catch (error) {
    Logger.error('Database stats reset error:', error);
    res.status(500).json({
      error: 'Failed to reset database statistics',
      message: error.message
    });
  }
});

export default router;