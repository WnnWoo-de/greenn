import express from 'express';
import { initFeedbackModel } from '../models/Feedback.js';
import { initUserModel } from '../models/User.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { validateFeedback } from '../middleware/validation.js';
import { Op } from 'sequelize';

const router = express.Router();

// @route   POST /api/feedback
// @desc    Submit feedback
// @access  Private
router.post('/', authenticateToken, validateFeedback, async (req, res) => {
  try {
    const { type, subject, message, rating, tags, isPublic } = req.body;

    // 初始化模型
    const Feedback = initFeedbackModel();
    
    if (!Feedback) {
      return res.status(500).json({
        error: 'Database connection error'
      });
    }

    const feedback = await Feedback.create({
      userId: req.user.id,
      type,
      subject,
      message,
      rating,
      tags: tags || [],
      isPublic: isPublic || false
    });

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: {
        id: feedback.id,
        type: feedback.type,
        subject: feedback.subject,
        status: feedback.status,
        priority: feedback.priority,
        createdAt: feedback.createdAt
      }
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      error: 'Failed to submit feedback',
      message: error.message
    });
  }
});

// @route   GET /api/feedback/my
// @desc    Get user's feedback
// @access  Private
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // 初始化模型
    const Feedback = initFeedbackModel();
    
    if (!Feedback) {
      return res.status(500).json({
        error: 'Database connection error'
      });
    }

    // Build where clause
    const whereClause = { userId: req.user.id };
    if (status) whereClause.status = status;
    if (type) whereClause.type = type;

    // Build order clause
    const order = [[sortBy, sortOrder.toUpperCase()]];

    const { count, rows: feedbacks } = await Feedback.findAndCountAll({
      where: whereClause,
      order,
      offset,
      limit: limitNum,
      attributes: [
        'id', 'type', 'subject', 'message', 'rating', 
        'status', 'priority', 'adminResponse', 'resolvedAt',
        'tags', 'isPublic', 'createdAt', 'updatedAt'
      ]
    });

    res.json({
      feedbacks,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total: count,
        pages: Math.ceil(count / limitNum)
      }
    });
  } catch (error) {
    console.error('Get my feedback error:', error);
    res.status(500).json({
      error: 'Failed to get feedback',
      message: error.message
    });
  }
});

// @route   GET /api/feedback/:id
// @desc    Get single feedback
// @access  Private (owner or admin)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    // 初始化模型
    const Feedback = initFeedbackModel();
    const User = initUserModel();
    
    if (!Feedback || !User) {
      return res.status(500).json({
        error: 'Database connection error'
      });
    }

    const feedback = await Feedback.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        },
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'username'],
          required: false
        }
      ]
    });

    if (!feedback) {
      return res.status(404).json({
        error: 'Feedback not found'
      });
    }

    // Check access permissions (owner or admin)
    if (feedback.userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    res.json(feedback);
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      error: 'Failed to get feedback',
      message: error.message
    });
  }
});

// @route   PUT /api/feedback/:id
// @desc    Update feedback (owner only, before resolution)
// @access  Private
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { subject, message, rating, tags, isPublic } = req.body;

    // 初始化模型
    const Feedback = initFeedbackModel();
    
    if (!Feedback) {
      return res.status(500).json({
        error: 'Database connection error'
      });
    }

    const feedback = await Feedback.findByPk(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        error: 'Feedback not found'
      });
    }

    // Check ownership
    if (feedback.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    // Check if feedback can be updated
    if (feedback.status === 'resolved' || feedback.status === 'closed') {
      return res.status(400).json({
        error: 'Cannot update resolved or closed feedback'
      });
    }

    // Update allowed fields
    const updateData = {};
    if (subject !== undefined) updateData.subject = subject;
    if (message !== undefined) updateData.message = message;
    if (rating !== undefined) updateData.rating = rating;
    if (tags !== undefined) updateData.tags = tags;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    await feedback.update(updateData);

    res.json({
      message: 'Feedback updated successfully',
      feedback
    });
  } catch (error) {
    console.error('Update feedback error:', error);
    res.status(500).json({
      error: 'Failed to update feedback',
      message: error.message
    });
  }
});

// @route   DELETE /api/feedback/:id
// @desc    Delete feedback (owner only, if not resolved)
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // 初始化模型
    const Feedback = initFeedbackModel();
    
    if (!Feedback) {
      return res.status(500).json({
        error: 'Database connection error'
      });
    }

    const feedback = await Feedback.findByPk(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        error: 'Feedback not found'
      });
    }

    // Check ownership
    if (feedback.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    // Check if feedback can be deleted
    if (feedback.status === 'resolved' || feedback.status === 'in_progress') {
      return res.status(400).json({
        error: 'Cannot delete feedback that is being processed or resolved'
      });
    }

    await feedback.destroy();

    res.json({
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({
      error: 'Failed to delete feedback',
      message: error.message
    });
  }
});

// @route   GET /api/feedback/public
// @desc    Get public feedback (for community viewing)
// @access  Public
router.get('/public', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      status = 'resolved',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // 初始化模型
    const Feedback = initFeedbackModel();
    const User = initUserModel();
    
    if (!Feedback || !User) {
      return res.status(500).json({
        error: 'Database connection error'
      });
    }

    // Build where clause
    const whereClause = { 
      isPublic: true,
      status: status || 'resolved'
    };
    if (type) whereClause.type = type;

    // Build order clause
    const order = [[sortBy, sortOrder.toUpperCase()]];

    const { count, rows: feedbacks } = await Feedback.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['username']
      }],
      order,
      offset,
      limit: limitNum,
      attributes: [
        'id', 'type', 'subject', 'message', 'rating',
        'status', 'adminResponse', 'resolvedAt', 'tags', 'createdAt'
      ]
    });

    res.json({
      feedbacks,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total: count,
        pages: Math.ceil(count / limitNum)
      }
    });
  } catch (error) {
    console.error('Get public feedback error:', error);
    res.status(500).json({
      error: 'Failed to get public feedback',
      message: error.message
    });
  }
});

// @route   GET /api/feedback/stats
// @desc    Get feedback statistics
// @access  Private (admin only)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Check admin permissions
    if (!req.user.isAdmin) {
      return res.status(403).json({
        error: 'Admin access required'
      });
    }

    const { startDate, endDate } = req.query;

    // 初始化模型
    const Feedback = initFeedbackModel();
    
    if (!Feedback) {
      return res.status(500).json({
        error: 'Database connection error'
      });
    }

    const stats = await Feedback.getStats(startDate, endDate);

    res.json(stats);
  } catch (error) {
    console.error('Get feedback stats error:', error);
    res.status(500).json({
      error: 'Failed to get feedback statistics',
      message: error.message
    });
  }
});

export default router;