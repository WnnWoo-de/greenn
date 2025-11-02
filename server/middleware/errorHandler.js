import fs from 'fs';
import path from 'path';

// 创建日志目录
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 日志记录器
export class Logger {
  static writeLog(level, message, error = null, req = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      }),
      ...(req && {
        request: {
          method: req.method,
          url: req.url,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
          userId: req.user?.id
        }
      })
    };

    // 写入文件
    const logFile = path.join(logDir, `${level}-${new Date().toISOString().split('T')[0]}.log`);
    const logLine = JSON.stringify(logEntry) + '\n';
    
    fs.appendFileSync(logFile, logLine);
    
    // 同时输出到控制台
    if (level === 'error') {
      console.error(`[${timestamp}] ERROR:`, message, error?.stack || '');
    } else if (level === 'warn') {
      console.warn(`[${timestamp}] WARN:`, message);
    } else {
      console.log(`[${timestamp}] ${level.toUpperCase()}:`, message);
    }
  }

  static info(message, req = null) {
    this.writeLog('info', message, null, req);
  }

  static warn(message, req = null) {
    this.writeLog('warn', message, null, req);
  }

  static error(message, error = null, req = null) {
    this.writeLog('error', message, error, req);
  }

  static debug(message, req = null) {
    if (process.env.NODE_ENV === 'development') {
      this.writeLog('debug', message, null, req);
    }
  }
}

// 自定义错误类
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 400);
    this.field = field;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message, 500);
  }
}

// 异步错误处理包装器
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 全局错误处理中间件
export const globalErrorHandler = (err, req, res, next) => {
  // 设置默认错误信息
  let error = { ...err };
  error.message = err.message;

  // 记录错误日志
  Logger.error('Global error handler caught error', err, req);

  // Sequelize 验证错误
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map(e => e.message).join(', ');
    error = new ValidationError(message);
  }

  // Sequelize 唯一约束错误
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'field';
    const message = `${field} already exists`;
    error = new ValidationError(message, field);
  }

  // Sequelize 外键约束错误
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    error = new ValidationError('Invalid reference to related resource');
  }

  // Sequelize 连接错误
  if (err.name === 'SequelizeConnectionError' || err.name === 'SequelizeConnectionRefusedError') {
    error = new DatabaseError('Database connection failed');
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError') {
    error = new AuthenticationError('Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new AuthenticationError('Token expired');
  }

  // 语法错误
  if (err.name === 'SyntaxError') {
    error = new ValidationError('Invalid JSON format');
  }

  // 类型错误
  if (err.name === 'TypeError') {
    error = new AppError('Invalid data type', 400);
  }

  // 范围错误
  if (err.name === 'RangeError') {
    error = new ValidationError('Value out of range');
  }

  // 发送错误响应
  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : 'Something went wrong';

  // 开发环境返回详细错误信息
  if (process.env.NODE_ENV === 'development') {
    res.status(statusCode).json({
      error: message,
      statusCode,
      stack: err.stack,
      details: err
    });
  } else {
    // 生产环境只返回安全的错误信息
    res.status(statusCode).json({
      error: message,
      statusCode
    });
  }
};

// 404 处理中间件
export const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl}`);
  Logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`, req);
  next(error);
};

// 请求日志中间件
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // 记录请求开始
  Logger.info(`${req.method} ${req.url} - Request started`, req);
  
  // 监听响应结束
  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`;
    
    if (res.statusCode >= 400) {
      Logger.warn(message, req);
    } else {
      Logger.info(message, req);
    }
  });
  
  next();
};

// 速率限制错误处理
export const rateLimitHandler = (req, res) => {
  Logger.warn(`Rate limit exceeded for IP: ${req.ip}`, req);
  res.status(429).json({
    error: 'Too many requests, please try again later',
    statusCode: 429,
    retryAfter: '1 minute'
  });
};

// 未捕获异常处理
export const setupUncaughtExceptionHandlers = () => {
  process.on('uncaughtException', (err) => {
    Logger.error('Uncaught Exception', err);
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    process.exit(1);
  });

  process.on('unhandledRejection', (err) => {
    Logger.error('Unhandled Rejection', err);
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    process.exit(1);
  });
};