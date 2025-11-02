import express from 'express';
import Achievement from '../models/Achievement.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Mock data for development
const mockAchievements = [
  {
    _id: '1',
    name: '环保新手',
    description: '完成第一个环保活动',
    icon: '🌱',
    category: 'beginner',
    type: 'milestone',
    criteria: { metric: 'activities_completed', target: 1 },
    rewards: { points: 10, badge: 'green_starter' },
    rarity: 'common',
    isActive: true
  },
  {
    _id: '2',
    name: '节能达人',
    description: '累计节约100度电',
    icon: '⚡',
    category: 'energy',
    type: 'cumulative',
    criteria: { metric: 'energy_saved', target: 100 },
    rewards: { points: 50, badge: 'energy_saver' },
    rarity: 'rare',
    isActive: true
  },
  {
    _id: '3',
    name: '碳足迹追踪者',
    description: '连续7天记录碳足迹',
    icon: '👣',
    category: 'tracking',
    type: 'streak',
    criteria: { metric: 'tracking_streak', target: 7 },
    rewards: { points: 30, badge: 'tracker' },
    rarity: 'uncommon',
    isActive: true
  }
];

// @route   GET /api/achievements
// @desc    Get all achievements
// @access  Public
router.get('/', async (req, res) => {
  try {
    // 在开发环境下使用模拟数据
    if (process.env.NODE_ENV === 'development') {
      return res.json({ achievements: mockAchievements });
    }

    const achievements = await Achievement.find({ isActive: true })
      .sort({ category: 1, order: 1 });

    res.json({ achievements });
  } catch (error) {
    console.error('Get achievements error:', error);
    
    // 如果数据库操作失败，在开发环境下返回模拟数据
    if (process.env.NODE_ENV === 'development') {
      return res.json({ achievements: mockAchievements });
    }
    
    res.status(500).json({
      error: 'Failed to get achievements',
      message: error.message
    });
  }
});

// @route   POST /api/achievements/check
// @desc    Check user achievements
// @access  Private
router.post('/check', authenticateToken, async (req, res) => {
  try {
    const newAchievements = await Achievement.checkUserAchievements(req.user._id);
    
    res.json({
      newAchievements,
      message: newAchievements.length > 0 ? 'New achievements unlocked!' : 'No new achievements'
    });
  } catch (error) {
    console.error('Check achievements error:', error);
    res.status(500).json({
      error: 'Failed to check achievements',
      message: error.message
    });
  }
});

export default router;