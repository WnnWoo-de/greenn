import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss';
import { Logger } from './errorHandler.js';

// CORS配置
export const corsOptions = {
  origin: function (origin, callback) {
    // 允许的域名列表
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    // 在开发环境中允许所有来源
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    // 检查来源是否在允许列表中
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      Logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-CSRF-Token'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // 24小时
};

// Helmet安全配置
export const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
};

// XSS清理中间件
export const xssClean = (req, res, next) => {
  try {
    // 清理请求体
    if (req.body && typeof req.body === 'object') {
      req.body = cleanObject(req.body);
    }

    // 清理查询参数
    if (req.query && typeof req.query === 'object') {
      req.query = cleanObject(req.query);
    }

    // 清理路径参数
    if (req.params && typeof req.params === 'object') {
      req.params = cleanObject(req.params);
    }

    next();
  } catch (error) {
    Logger.error('XSS cleaning error', error, req);
    next(error);
  }
};

// 递归清理对象中的XSS
function cleanObject(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => cleanObject(item));
  }

  if (typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      cleaned[key] = cleanObject(value);
    }
    return cleaned;
  }

  if (typeof obj === 'string') {
    return xss(obj, {
      whiteList: {}, // 不允许任何HTML标签
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script']
    });
  }

  return obj;
}

// SQL注入防护（虽然使用Sequelize，但额外保护）
export const sqlInjectionProtection = (req, res, next) => {
  const suspiciousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(--|\/\*|\*\/|;)/,
    /(\b(WAITFOR|DELAY)\b)/i
  ];

  const checkValue = (value) => {
    if (typeof value === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(value));
    }
    return false;
  };

  const checkObject = (obj) => {
    if (obj === null || obj === undefined) return false;
    
    if (Array.isArray(obj)) {
      return obj.some(item => checkObject(item));
    }
    
    if (typeof obj === 'object') {
      return Object.values(obj).some(value => checkObject(value));
    }
    
    return checkValue(obj);
  };

  try {
    if (checkObject(req.body) || checkObject(req.query) || checkObject(req.params)) {
      Logger.warn('Potential SQL injection attempt detected', req);
      return res.status(400).json({
        error: 'Invalid input detected',
        statusCode: 400
      });
    }
    next();
  } catch (error) {
    Logger.error('SQL injection protection error', error, req);
    next(error);
  }
};

// 文件上传安全检查
export const fileUploadSecurity = (req, res, next) => {
  if (!req.file && !req.files) {
    return next();
  }

  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/csv'
  ];

  const maxFileSize = 5 * 1024 * 1024; // 5MB

  const files = req.files || [req.file];
  
  for (const file of files) {
    if (!file) continue;

    // 检查文件类型
    if (!allowedMimeTypes.includes(file.mimetype)) {
      Logger.warn(`Blocked file upload with invalid mime type: ${file.mimetype}`, req);
      return res.status(400).json({
        error: 'File type not allowed',
        statusCode: 400
      });
    }

    // 检查文件大小
    if (file.size > maxFileSize) {
      Logger.warn(`Blocked file upload exceeding size limit: ${file.size} bytes`, req);
      return res.status(400).json({
        error: 'File size too large',
        statusCode: 400
      });
    }

    // 检查文件名
    const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (dangerousChars.test(file.originalname)) {
      Logger.warn(`Blocked file upload with dangerous filename: ${file.originalname}`, req);
      return res.status(400).json({
        error: 'Invalid filename',
        statusCode: 400
      });
    }
  }

  next();
};

// IP白名单中间件（用于管理员功能）
export const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (allowedIPs.length === 0 || allowedIPs.includes(clientIP)) {
      return next();
    }

    Logger.warn(`Access denied for IP: ${clientIP}`, req);
    res.status(403).json({
      error: 'Access denied from this IP address',
      statusCode: 403
    });
  };
};

// 请求大小限制
export const requestSizeLimit = (limit = '10mb') => {
  return (req, res, next) => {
    const contentLength = parseInt(req.get('content-length') || '0');
    const maxSize = parseSize(limit);

    if (contentLength > maxSize) {
      Logger.warn(`Request size limit exceeded: ${contentLength} bytes`, req);
      return res.status(413).json({
        error: 'Request entity too large',
        statusCode: 413
      });
    }

    next();
  };
};

// 解析大小字符串（如 '10mb'）
function parseSize(size) {
  if (typeof size === 'number') return size;
  
  const units = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024
  };
  
  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)(b|kb|mb|gb)?$/);
  if (!match) return 0;
  
  const value = parseFloat(match[1]);
  const unit = match[2] || 'b';
  
  return Math.floor(value * units[unit]);
}

// 导出安全中间件组合
export const securityMiddleware = [
  helmet(helmetConfig),
  cors(corsOptions),
  mongoSanitize(),
  xssClean,
  sqlInjectionProtection
];