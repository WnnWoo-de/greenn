import rateLimit from 'express-rate-limit';
import { Logger, rateLimitHandler } from './errorHandler.js';

// 通用速率限制配置
const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 限制每个IP在窗口期内最多100个请求
    message: {
      error: 'Too many requests from this IP, please try again later',
      statusCode: 429
    },
    standardHeaders: true, // 返回速率限制信息在 `RateLimit-*` headers
    legacyHeaders: false, // 禁用 `X-RateLimit-*` headers
    handler: rateLimitHandler,
    skip: (req) => {
      // 跳过健康检查和静态资源
      return req.url === '/health' || req.url.startsWith('/static');
    },
    keyGenerator: (req) => {
      // 如果用户已认证，使用用户ID，否则使用IP
      return req.user?.id || req.ip;
    },
    onLimitReached: (req) => {
      Logger.warn(`Rate limit reached for ${req.user?.id || req.ip}`, req);
    },
    ...options
  };

  return rateLimit(defaultOptions);
};

// 严格的速率限制（用于敏感操作）
export const strictRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 每15分钟最多5次请求
  message: {
    error: 'Too many attempts, please try again in 15 minutes',
    statusCode: 429
  }
});

// 认证相关的速率限制
export const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 10, // 每15分钟最多10次登录尝试
  message: {
    error: 'Too many login attempts, please try again in 15 minutes',
    statusCode: 429
  },
  skipSuccessfulRequests: true // 成功的请求不计入限制
});

// API通用速率限制
export const apiRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每15分钟最多100个请求
  message: {
    error: 'API rate limit exceeded, please try again later',
    statusCode: 429
  }
});

// 上传文件的速率限制
export const uploadRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 20, // 每小时最多20次上传
  message: {
    error: 'Upload rate limit exceeded, please try again in an hour',
    statusCode: 429
  }
});

// 创建活动的速率限制
export const createActivityRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 50, // 每小时最多创建50个活动
  message: {
    error: 'Activity creation rate limit exceeded',
    statusCode: 429
  }
});

// 反馈提交的速率限制
export const feedbackRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 10, // 每小时最多提交10个反馈
  message: {
    error: 'Feedback submission rate limit exceeded',
    statusCode: 429
  }
});

// 搜索的速率限制
export const searchRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1分钟
  max: 30, // 每分钟最多30次搜索
  message: {
    error: 'Search rate limit exceeded, please slow down',
    statusCode: 429
  }
});

// 密码重置的速率限制
export const passwordResetRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 3, // 每小时最多3次密码重置请求
  message: {
    error: 'Password reset rate limit exceeded, please try again in an hour',
    statusCode: 429
  }
});

// 邮件发送的速率限制
export const emailRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 5, // 每小时最多发送5封邮件
  message: {
    error: 'Email sending rate limit exceeded',
    statusCode: 429
  }
});

// 导出默认速率限制
export default apiRateLimit;