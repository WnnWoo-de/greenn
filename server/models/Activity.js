import { DataTypes, Model } from 'sequelize';
import { getSequelize } from '../config/database.js';

class Activity extends Model {
  // 实例方法：添加点赞
  async addLike(userId) {
    const likes = this.likes || [];
    const existingLike = likes.find(like => like.userId === userId);
    
    if (!existingLike) {
      likes.push({
        userId: userId,
        likedAt: new Date()
      });
      this.likes = likes;
      await this.save();
    }
    return this;
  }

  // 实例方法：移除点赞
  async removeLike(userId) {
    const likes = this.likes || [];
    this.likes = likes.filter(like => like.userId !== userId);
    await this.save();
    return this;
  }

  // 实例方法：添加评论
  async addComment(userId, text) {
    const comments = this.comments || [];
    comments.push({
      userId: userId,
      text: text,
      createdAt: new Date()
    });
    this.comments = comments;
    await this.save();
    return this;
  }

  // 虚拟属性：点赞数
  get likeCount() {
    return this.likes ? this.likes.length : 0;
  }

  // 虚拟属性：评论数
  get commentCount() {
    return this.comments ? this.comments.length : 0;
  }

  // 静态方法：获取统计数据
  static async getStats(userId, startDate, endDate) {
    const sequelize = getSequelize();
    if (!sequelize) return null;

    const whereClause = { userId };
    if (startDate && endDate) {
      whereClause.createdAt = {
        [sequelize.Sequelize.Op.between]: [startDate, endDate]
      };
    }

    const activities = await Activity.findAll({
      where: whereClause,
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('carbonSaved')), 'totalCarbonSaved'],
        [sequelize.fn('SUM', sequelize.col('points')), 'totalPoints']
      ],
      group: ['type']
    });

    const totalStats = await Activity.findOne({
      where: whereClause,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalActivities'],
        [sequelize.fn('SUM', sequelize.col('carbonSaved')), 'totalCarbonSaved'],
        [sequelize.fn('SUM', sequelize.col('points')), 'totalPoints']
      ]
    });

    return {
      byType: activities,
      total: totalStats
    };
  }
}

// 初始化模型
const initActivityModel = () => {
  const sequelize = getSequelize();
  if (!sequelize) return null;

  Activity.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('transport', 'energy', 'waste', 'food', 'water', 'other'),
      allowNull: false
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 500]
      }
    },
    carbonSaved: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    duration: {
      type: DataTypes.INTEGER, // 分钟
      allowNull: true
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    images: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    verification: {
      type: DataTypes.JSON,
      defaultValue: {
        status: 'pending',
        verifiedBy: null,
        verifiedAt: null,
        notes: null
      }
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    likes: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    comments: {
      type: DataTypes.JSON,
      defaultValue: []
    }
  }, {
    sequelize,
    modelName: 'Activity',
    tableName: 'activities',
    timestamps: true,
    indexes: [
      { fields: ['userId', 'createdAt'] },
      { fields: ['type', 'createdAt'] },
      { fields: ['isPublic', 'createdAt'] },
      { fields: ['carbonSaved'] },
      { fields: ['points'] }
    ]
  });

  return Activity;
};

// 导出初始化函数和模型类
export { initActivityModel };
export default Activity;