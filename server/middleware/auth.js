import jwt from 'jsonwebtoken';
import { initUserModel } from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 初始化User模型
    const User = initUserModel();
    if (!User) {
      return res.status(500).json({ error: 'Database connection error' });
    }
    
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // 更新最后登录时间
    user.lastLogin = new Date();
    await user.save();

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication error' });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 初始化User模型
      const User = initUserModel();
      if (User) {
        const user = await User.findByPk(decoded.userId, {
          attributes: { exclude: ['password'] }
        });
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    console.warn('Optional auth failed:', error.message);
    next();
  }
};