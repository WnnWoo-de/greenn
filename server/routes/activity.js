import express from 'express';
import { initActivityModel } from '../models/Activity.js';
import { initUserModel } from '../models/User.js';
import { initAchievementModel } from '../models/Achievement.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { validateActivity } from '../middleware/validation.js';
import { Op } from 'sequelize';
import { queryOptimizer } from '../utils/queryOptimizer.js';
import { activityCache, cacheMiddleware } from '../utils/cacheService.js';

const router = express.Router();

// @route   POST /api/activities
// @desc    Create a new activity
// @access  Private
router.post('/', authenticateToken, validateActivity, async (req, res) => {
  try {
    const { type, category, description, carbonSaved, points, duration, location, tags, images } = req.body;

    // 初始化模型
    const Activity = initActivityModel();
    const User = initUserModel();
    const Achievement = initAchievementModel();
    
    if (!Activity || !User || !Achievement) {
      return res.status(500).json({
        error: 'Database connection error'
      });
    }

    const activity = await Activity.create({
      userId: req.user.id,
      type,
      category,
      description,
      carbonSaved,
      points,
      duration,
      location,
      tags,
      images
    });

    // Update user stats
    const user = await User.findByPk(req.user.id);
    user.totalCarbonSaved = parseFloat(user.totalCarbonSaved) + parseFloat(carbonSaved);
    await user.addPoints(points, 'Activity completion');
    await user.updateStreak();

    // Check for new achievements
    const newAchievements = await Achievement.checkUserAchievements(req.user.id);

    // Get activity with user info
    const activityWithUser = await Activity.findByPk(activity.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'avatar', 'level']
      }]
    });

    res.status(201).json({
      message: 'Activity created successfully',
      activity: activityWithUser,
      newAchievements: newAchievements.length > 0 ? newAchievements : undefined
    });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({
      error: 'Failed to create activity',
      message: error.message
    });
  }
});

// @route   GET /api/activities
// @desc    Get activities (with pagination and filters)
// @access  Public (with optional auth for personalized content)
router.get('/', 
  optionalAuth, 
  cacheMiddleware({ 
    ttl: 180000, // 3分钟缓存
    keyGenerator: (req) => `activities.list.${JSON.stringify(req.query)}`,
    condition: (req) => !req.user // 只缓存未登录用户的请求
  }),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        type,
        category,
        userId,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search
      } = req.query;

      // 初始化模型
      const Activity = initActivityModel();
      const User = initUserModel();
      
      if (!Activity || !User) {
        return res.status(500).json({
          error: 'Database connection error'
        });
      }

      // 使用查询优化器的分页选项
      const paginationOptions = queryOptimizer.getPaginationOptions(parseInt(page), parseInt(limit));

      // 构建查询条件
      const whereClause = { isPublic: true };

      if (type) whereClause.type = type;
      if (category) whereClause.category = category;
      if (userId) whereClause.userId = userId;
      
      // 使用查询优化器构建搜索查询
      if (search) {
        const searchQuery = queryOptimizer.buildSearchQuery(search, ['description', 'category', 'type']);
        Object.assign(whereClause, searchQuery);
      }

      // 使用查询优化器构建排序选项
      const orderOptions = queryOptimizer.buildOrderOptions(sortBy, sortOrder);

      // 使用优化的查询
      const result = await queryOptimizer.optimizedQuery(
        Activity,
        'findAndCountAll',
        whereClause,
        {
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'avatar', 'level']
          }],
          order: orderOptions,
          ...paginationOptions,
          useCache: !req.user, // 只对未登录用户使用缓存
          cacheTTL: 180000
        }
      );

      const { count, rows: activities } = result;

      // 为已登录用户添加交互信息
      if (req.user) {
        for (const activity of activities) {
          const likes = activity.likes || [];
          activity.dataValues.isLiked = likes.some(like => 
            like.userId === req.user.id
          );
        }
      }

      res.json({
        activities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get activities error:', error);
      res.status(500).json({
        error: 'Failed to get activities',
        message: error.message
      });
    }
  }
);

// @route   GET /api/activities/my
// @desc    Get current user's activities
// @access  Private
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      category,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // 初始化模型
    const Activity = initActivityModel();
    const User = initUserModel();
    
    if (!Activity || !User) {
      return res.status(500).json({
        error: 'Database connection error'
      });
    }

    const whereClause = { userId: req.user.id };
    if (type) whereClause.type = type;
    if (category) whereClause.category = category;

    const order = [[sortBy, sortOrder.toUpperCase()]];

    const { count, rows: activities } = await Activity.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'avatar', 'level']
      }],
      order,
      offset,
      limit: limitNum
    });

    res.json({
      activities,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total: count,
        pages: Math.ceil(count / limitNum)
      }
    });
  } catch (error) {
    console.error('Get user activities error:', error);
    res.status(500).json({
      error: 'Failed to get user activities',
      message: error.message
    });
  }
});

// @route   GET /api/activities/stats
// @desc    Get activity statistics
// @access  Private
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // 初始化模型
    const Activity = initActivityModel();
    
    if (!Activity) {
      return res.status(500).json({
        error: 'Database connection error'
      });
    }
    
    const stats = await Activity.getStats(req.user.id, startDate, endDate);
    
    res.json(stats);
  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({
      error: 'Failed to get activity statistics',
      message: error.message
    });
  }
});

// @route   GET /api/activities/:id
// @desc    Get single activity
// @access  Public (with optional auth)
router.get('/:id', 
  optionalAuth,
  cacheMiddleware({ 
    ttl: 300000, // 5分钟缓存
    keyGenerator: (req) => `activity:${req.params.id}:${req.user?.id || 'public'}`,
    condition: (req) => req.method === 'GET'
  }),
  async (req, res) => {
    try {
      // 初始化模型
      const Activity = initActivityModel();
      const User = initUserModel();
      
      if (!Activity || !User) {
        return res.status(500).json({
          error: 'Database connection error'
        });
      }

      // 使用查询优化器
      const activity = await queryOptimizer.optimizedQuery(Activity, 'findByPk', {
        id: req.params.id,
        options: {
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'avatar', 'level']
          }]
        },
        cacheKey: `activity:${req.params.id}`,
        cacheTTL: 300000 // 5分钟
      });

      if (!activity) {
        return res.status(404).json({
          error: 'Activity not found'
        });
      }

      // Check if activity is public or user owns it
      if (!activity.isPublic && (!req.user || activity.userId !== req.user.id)) {
        return res.status(403).json({
          error: 'Access denied'
        });
      }

      // Add user interaction info if authenticated
      if (req.user) {
        const likes = activity.likes || [];
        activity.dataValues.isLiked = likes.some(like => 
          like.userId === req.user.id
        );
      }

      res.json(activity);
    } catch (error) {
      console.error('Get activity error:', error);
      res.status(500).json({
        error: 'Failed to get activity',
        message: error.message
      });
    }
  }
);

// @route   PUT /api/activities/:id
// @desc    Update activity
// @access  Private (owner only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // 初始化模型
    const Activity = initActivityModel();
    const User = initUserModel();
    
    if (!Activity || !User) {
      return res.status(500).json({
        error: 'Database connection error'
      });
    }

    const activity = await Activity.findByPk(req.params.id);

    if (!activity) {
      return res.status(404).json({
        error: 'Activity not found'
      });
    }

    // Check ownership
    if (activity.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    const { description, location, tags, images, isPublic } = req.body;

    // Update allowed fields
    const updateData = {};
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    if (tags !== undefined) updateData.tags = tags;
    if (images !== undefined) updateData.images = images;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    await activity.update(updateData);

    // Get updated activity with user info
    const updatedActivity = await Activity.findByPk(activity.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'avatar', 'level']
      }]
    });

    res.json({
      message: 'Activity updated successfully',
      activity: updatedActivity
    });
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({
      error: 'Failed to update activity',
      message: error.message
    });
  }
});

// @route   DELETE /api/activities/:id
// @desc    Delete activity
// @access  Private (owner only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // 初始化模型
    const Activity = initActivityModel();
    
    if (!Activity) {
      return res.status(500).json({
        error: 'Database connection error'
      });
    }

    const activity = await Activity.findByPk(req.params.id);

    if (!activity) {
      return res.status(404).json({
        error: 'Activity not found'
      });
    }

    // Check ownership
    if (activity.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    await activity.destroy();

    res.json({
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({
      error: 'Failed to delete activity',
      message: error.message
    });
  }
});

// @route   POST /api/activities/:id/like
// @desc    Like/unlike activity
// @access  Private
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    // 初始化模型
    const Activity = initActivityModel();
    
    if (!Activity) {
      return res.status(500).json({
        error: 'Database connection error'
      });
    }

    const activity = await Activity.findByPk(req.params.id);

    if (!activity) {
      return res.status(404).json({
        error: 'Activity not found'
      });
    }

    const likes = activity.likes || [];
    const existingLikeIndex = likes.findIndex(like => 
      like.userId === req.user.id
    );

    if (existingLikeIndex !== -1) {
      // Unlike
      await activity.removeLike(req.user.id);
      res.json({
        message: 'Activity unliked',
        liked: false,
        likeCount: activity.likeCount - 1
      });
    } else {
      // Like
      await activity.addLike(req.user.id);
      res.json({
        message: 'Activity liked',
        liked: true,
        likeCount: activity.likeCount + 1
      });
    }
  } catch (error) {
    console.error('Like activity error:', error);
    res.status(500).json({
      error: 'Failed to like/unlike activity',
      message: error.message
    });
  }
});

// @route   POST /api/activities/:id/comment
// @desc    Add comment to activity
// @access  Private
router.post('/:id/comment', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        error: 'Comment text is required'
      });
    }

    if (text.length > 300) {
      return res.status(400).json({
        error: 'Comment cannot exceed 300 characters'
      });
    }

    // 初始化模型
    const Activity = initActivityModel();
    
    if (!Activity) {
      return res.status(500).json({
        error: 'Database connection error'
      });
    }

    const activity = await Activity.findByPk(req.params.id);

    if (!activity) {
      return res.status(404).json({
        error: 'Activity not found'
      });
    }

    await activity.addComment(req.user.id, text.trim());

    res.json({
      message: 'Comment added successfully',
      commentCount: activity.commentCount + 1
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      error: 'Failed to add comment',
      message: error.message
    });
  }
});

export default router;