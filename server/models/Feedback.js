import { DataTypes, Op } from 'sequelize';
import { getSequelize } from '../config/database.js';

let Feedback = null;

export const initFeedbackModel = () => {
  if (Feedback) return Feedback;

  try {
    const sequelize = getSequelize();
    if (!sequelize) {
      console.error('Database connection not available');
      return null;
    }

    Feedback = sequelize.define('Feedback', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      type: {
        type: DataTypes.ENUM('bug', 'feature', 'improvement', 'general'),
        allowNull: false,
        defaultValue: 'general'
      },
      subject: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
          len: [1, 200],
          notEmpty: true
        }
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          len: [10, 2000],
          notEmpty: true
        }
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 1,
          max: 5
        }
      },
      status: {
        type: DataTypes.ENUM('pending', 'in_progress', 'resolved', 'closed'),
        allowNull: false,
        defaultValue: 'pending'
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'medium'
      },
      adminResponse: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      adminId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      resolvedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      tags: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
      },
      attachments: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    }, {
      tableName: 'feedbacks',
      timestamps: true,
      indexes: [
        {
          fields: ['userId']
        },
        {
          fields: ['type']
        },
        {
          fields: ['status']
        },
        {
          fields: ['priority']
        },
        {
          fields: ['createdAt']
        }
      ]
    });

    // Instance methods
    Feedback.prototype.markAsResolved = async function(adminId, response) {
      this.status = 'resolved';
      this.adminId = adminId;
      this.adminResponse = response;
      this.resolvedAt = new Date();
      return await this.save();
    };

    Feedback.prototype.updateStatus = async function(status, adminId = null) {
      this.status = status;
      if (adminId) {
        this.adminId = adminId;
      }
      if (status === 'resolved' && !this.resolvedAt) {
        this.resolvedAt = new Date();
      }
      return await this.save();
    };

    // Static methods
    Feedback.getStats = async function(startDate = null, endDate = null) {
      try {
        const whereClause = {};
        
        if (startDate && endDate) {
          whereClause.createdAt = {
            [Op.between]: [new Date(startDate), new Date(endDate)]
          };
        }

        const stats = await this.findAll({
          attributes: [
            'type',
            'status',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
            [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']
          ],
          where: whereClause,
          group: ['type', 'status'],
          raw: true
        });

        const totalCount = await this.count({ where: whereClause });
        
        return {
          byTypeAndStatus: stats,
          totalCount,
          avgRating: stats.reduce((sum, stat) => sum + (parseFloat(stat.avgRating) || 0), 0) / stats.length || 0
        };
      } catch (error) {
        console.error('Get feedback stats error:', error);
        throw error;
      }
    };

    console.log('Feedback model initialized successfully');
    return Feedback;
  } catch (error) {
    console.error('Error initializing Feedback model:', error);
    return null;
  }
};

export { Feedback };
export default initFeedbackModel;