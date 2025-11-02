import express from 'express';
import jwt from 'jsonwebtoken';
import User, { initUserModel } from '../models/User.js';
import { validateRegistration, validateLogin } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import { getSequelize } from '../config/database.js';

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Development mode: use mock data
    if (process.env.NODE_ENV === 'development') {
      // Simple mock user creation
      const mockUser = {
        _id: 'mock_' + Date.now(),
        username,
        email,
        points: 100,
        level: 1,
        achievements: [],
        createdAt: new Date(),
        profile: {
          username,
          email,
          points: 100,
          level: 1,
          achievements: []
        }
      };

      const token = generateToken(mockUser._id);

      return res.status(201).json({
        success: true,
        message: 'User registered successfully (mock)',
        token,
        user: mockUser.profile
      });
    }

    // Production mode: use database
    try {
      // 初始化模型
      const UserModel = initUserModel();
      if (!UserModel) {
        throw new Error('Database not available');
      }

      // Check if user already exists
      const sequelize = getSequelize();
      const existingUser = await UserModel.findOne({
        where: {
          [sequelize.Sequelize.Op.or]: [
            { email },
            { username }
          ]
        }
      });

      if (existingUser) {
        return res.status(400).json({
          error: 'User already exists',
          message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
        });
      }

      // Create new user
      const user = await UserModel.create({
        username,
        email,
        password
      });

      // Generate token
      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: user.profile
      });
    } catch (dbError) {
      console.error('Database error during registration:', dbError);
      return res.status(500).json({
        success: false,
        error: 'Registration failed',
        message: 'Database connection error'
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      message: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Development mode: use mock authentication
    if (process.env.NODE_ENV === 'development') {
      // Simple mock authentication - accept any valid email/password format
      const mockUser = {
        _id: 'mock_' + Date.now(),
        username: email.split('@')[0],
        email,
        points: 150,
        level: 2,
        achievements: ['early_adopter'],
        lastLogin: new Date(),
        profile: {
          username: email.split('@')[0],
          email,
          points: 150,
          level: 2,
          achievements: ['early_adopter']
        }
      };

      const token = generateToken(mockUser._id);

      return res.json({
        success: true,
        message: 'Login successful (mock)',
        token,
        user: mockUser.profile
      });
    }

    // Production mode: use database
    try {
      // 初始化模型
      const UserModel = initUserModel();
      if (!UserModel) {
        throw new Error('Database not available');
      }

      // Find user by email
      const user = await UserModel.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = generateToken(user._id);

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: user.profile
      });
    } catch (dbError) {
      console.error('Database error during login:', dbError);
      return res.status(500).json({
        success: false,
        error: 'Login failed',
        message: 'Database connection error'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: error.message
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: error.message
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // 初始化模型
    const UserModel = initUserModel();
    if (!UserModel) {
      return res.status(500).json({
        error: 'Database not available'
      });
    }

    const user = await UserModel.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      user: user.profile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile',
      message: error.message
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    // 初始化模型
    const UserModel = initUserModel();
    if (!UserModel) {
      return res.status(500).json({
        error: 'Database not available'
      });
    }

    const { username, avatar, preferences } = req.body;
    const user = await UserModel.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Update allowed fields
    if (username && username !== user.username) {
      // Check if username is already taken
      const existingUser = await UserModel.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({
          error: 'Username already taken'
        });
      }
      user.username = username;
    }

    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: user.profile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: error.message
    });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    // 初始化模型
    const UserModel = initUserModel();
    if (!UserModel) {
      return res.status(500).json({
        error: 'Database not available'
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'New password must be at least 6 characters long'
      });
    }

    const user = await UserModel.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        error: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Failed to change password',
      message: error.message
    });
  }
});

// @route   POST /api/auth/verify-token
// @desc    Verify JWT token
// @access  Private
router.post('/verify-token', authenticateToken, async (req, res) => {
  try {
    res.json({
      valid: true,
      user: req.user.profile
    });
  } catch (error) {
    res.status(401).json({
      valid: false,
      error: 'Invalid token'
    });
  }
});

export default router;