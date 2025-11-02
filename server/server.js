import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import database connection
import connectDB from './config/database.js';

// Import enhanced middleware
import { 
  Logger, 
  globalErrorHandler, 
  notFoundHandler, 
  requestLogger,
  setupUncaughtExceptionHandlers 
} from './middleware/errorHandler.js';
import { 
  securityMiddleware, 
  corsOptions, 
  requestSizeLimit 
} from './middleware/security.js';
import { 
  apiRateLimit, 
  authRateLimit, 
  createActivityRateLimit, 
  feedbackRateLimit 
} from './middleware/rateLimiter.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import activityRoutes from './routes/activity.js';
import achievementRoutes from './routes/achievement.js';
import footprintRoutes from './routes/footprint.js';
import shopRoutes from './routes/shop.js';
import adviceRoutes from './routes/advice.js';
import feedbackRoutes from './routes/feedback.js';
import healthRoutes from './routes/health.js';
import docsRoutes from './routes/docs.js';
import monitoringRoutes from './routes/monitoring.js';

// Load environment variables
dotenv.config();

// Setup uncaught exception handlers
setupUncaughtExceptionHandlers();

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// Connect to database
connectDB();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Request logging middleware
app.use(requestLogger);

// Security middleware (helmet, cors, xss protection, etc.)
app.use(securityMiddleware);

// Request size limiting
app.use(requestSizeLimit('10mb'));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check routes
app.use('/health', healthRoutes);

// API documentation routes
app.use('/api/docs', docsRoutes);

// Monitoring endpoints (admin only)
app.use('/api/monitoring', monitoringRoutes);

// API Routes with rate limiting
app.use('/api/', apiRateLimit); // General API rate limit
app.use('/api/auth', authRateLimit, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activities', createActivityRateLimit, activityRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/footprint', footprintRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/advice', adviceRoutes);
app.use('/api/feedback', feedbackRateLimit, feedbackRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(globalErrorHandler);

// Start server
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  Logger.info(`🚀 Server running on port ${PORT}`);
  Logger.info(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  Logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  Logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    Logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  Logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    Logger.info('Process terminated');
    process.exit(0);
  });
});