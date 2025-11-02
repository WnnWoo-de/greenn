import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { Logger } from '../middleware/errorHandler.js';
import { testConnection } from '../config/database.js';

const router = express.Router();

// Basic health check
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Detailed health check (requires authentication)
router.get('/detailed', authenticateToken, async (req, res) => {
  try {
    // Check database connection
    let dbStatus = 'OK';
    let dbLatency = 0;
    
    try {
      const start = Date.now();
      await testConnection();
      dbLatency = Date.now() - start;
    } catch (error) {
      dbStatus = 'ERROR';
      Logger.error('Database health check failed', error);
    }

    // Memory usage
    const memoryUsage = process.memoryUsage();
    const memoryUsageMB = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100,
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100,
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100,
      external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100
    };

    // CPU usage (approximation)
    const cpuUsage = process.cpuUsage();

    // System information
    const systemInfo = {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      pid: process.pid,
      uptime: process.uptime()
    };

    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbStatus,
          latency: `${dbLatency}ms`
        },
        api: {
          status: 'OK',
          uptime: `${Math.floor(process.uptime())}s`
        }
      },
      system: systemInfo,
      memory: memoryUsageMB,
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      }
    });
  } catch (error) {
    Logger.error('Detailed health check failed', error);
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Readiness probe (for Kubernetes/Docker)
router.get('/ready', async (req, res) => {
  try {
    // Check if all critical services are ready
    await testConnection();
    
    res.status(200).json({
      status: 'READY',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    Logger.error('Readiness check failed', error);
    res.status(503).json({
      status: 'NOT_READY',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Liveness probe (for Kubernetes/Docker)
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'ALIVE',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Metrics endpoint (basic metrics)
router.get('/metrics', authenticateToken, (req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    // Basic Prometheus-style metrics
    const metrics = `
# HELP nodejs_memory_usage_bytes Memory usage in bytes
# TYPE nodejs_memory_usage_bytes gauge
nodejs_memory_usage_rss_bytes ${memoryUsage.rss}
nodejs_memory_usage_heap_total_bytes ${memoryUsage.heapTotal}
nodejs_memory_usage_heap_used_bytes ${memoryUsage.heapUsed}
nodejs_memory_usage_external_bytes ${memoryUsage.external}

# HELP nodejs_cpu_usage_seconds CPU usage in seconds
# TYPE nodejs_cpu_usage_seconds counter
nodejs_cpu_usage_user_seconds ${cpuUsage.user / 1000000}
nodejs_cpu_usage_system_seconds ${cpuUsage.system / 1000000}

# HELP nodejs_uptime_seconds Process uptime in seconds
# TYPE nodejs_uptime_seconds gauge
nodejs_uptime_seconds ${process.uptime()}

# HELP nodejs_version_info Node.js version info
# TYPE nodejs_version_info gauge
nodejs_version_info{version="${process.version}"} 1
    `.trim();

    res.set('Content-Type', 'text/plain');
    res.send(metrics);
  } catch (error) {
    Logger.error('Metrics endpoint failed', error);
    res.status(500).json({
      error: 'Failed to generate metrics',
      message: error.message
    });
  }
});

export default router;