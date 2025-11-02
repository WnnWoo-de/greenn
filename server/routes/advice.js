import express from 'express';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Mock AI advice data
const adviceCategories = {
  transport: [
    '尝试使用公共交通工具或骑自行车代替开车',
    '考虑拼车或使用共享汽车服务',
    '步行短距离路程，既环保又健康',
    '选择电动或混合动力车辆'
  ],
  energy: [
    '使用LED灯泡替换传统灯泡',
    '在不使用时关闭电器设备',
    '调整空调温度，夏天26°C，冬天20°C',
    '考虑安装太阳能板'
  ],
  waste: [
    '减少一次性塑料制品的使用',
    '进行垃圾分类和回收',
    '使用可重复使用的购物袋',
    '堆肥有机废物'
  ],
  food: [
    '减少肉类消费，增加植物性食物',
    '购买本地和季节性食物',
    '减少食物浪费',
    '选择有机食品'
  ]
};

// @route   GET /api/advice/daily
// @desc    Get daily advice
// @access  Public (with optional auth for personalization)
router.get('/daily', optionalAuth, async (req, res) => {
  try {
    const categories = Object.keys(adviceCategories);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const categoryAdvice = adviceCategories[randomCategory];
    const randomAdvice = categoryAdvice[Math.floor(Math.random() * categoryAdvice.length)];

    res.json({
      advice: {
        category: randomCategory,
        text: randomAdvice,
        date: new Date().toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('Get daily advice error:', error);
    res.status(500).json({
      error: 'Failed to get daily advice',
      message: error.message
    });
  }
});

// @route   GET /api/advice/category/:category
// @desc    Get advice by category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    if (!adviceCategories[category]) {
      return res.status(404).json({
        error: 'Category not found'
      });
    }

    res.json({
      category,
      advice: adviceCategories[category]
    });
  } catch (error) {
    console.error('Get category advice error:', error);
    res.status(500).json({
      error: 'Failed to get category advice',
      message: error.message
    });
  }
});

// @route   POST /api/advice/personalized
// @desc    Get personalized advice based on user data
// @access  Private
router.post('/personalized', authenticateToken, async (req, res) => {
  try {
    const { preferences, recentActivities } = req.body;
    
    // Simple personalization logic
    let recommendedCategory = 'transport';
    
    if (recentActivities && recentActivities.length > 0) {
      const activityTypes = recentActivities.map(a => a.type);
      const leastUsedTypes = ['transport', 'energy', 'waste', 'food'].filter(
        type => !activityTypes.includes(type)
      );
      
      if (leastUsedTypes.length > 0) {
        recommendedCategory = leastUsedTypes[Math.floor(Math.random() * leastUsedTypes.length)];
      }
    }
    
    const categoryAdvice = adviceCategories[recommendedCategory];
    const personalizedAdvice = categoryAdvice[Math.floor(Math.random() * categoryAdvice.length)];

    res.json({
      advice: {
        category: recommendedCategory,
        text: personalizedAdvice,
        reason: 'Based on your activity patterns',
        personalized: true
      }
    });
  } catch (error) {
    console.error('Get personalized advice error:', error);
    res.status(500).json({
      error: 'Failed to get personalized advice',
      message: error.message
    });
  }
});

export default router;