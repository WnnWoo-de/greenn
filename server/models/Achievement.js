import { DataTypes, Model } from 'sequelize';
import { getSequelize } from '../config/database.js';

class Achievement extends Model {
  // 静态方法：检查用户成就
  static async checkUserAchievements(userId) {
    const sequelize = getSequelize();
    if (!sequelize) return [];

    try {
      // 动态导入模型以避免循环依赖
      const { initUserModel } = await import('./User.js');
      const { initActivityModel } = await import('./Activity.js');
      
      const User = initUserModel();
      const Activity = initActivityModel();
      
      if (!User || !Activity) return [];
      
      const user = await User.findByPk(userId);
      if (!user) return [];
      
      const achievements = await Achievement.findAll({ where: { isActive: true } });
      const newAchievements = [];
      
      for (const achievement of achievements) {
        // 检查用户是否已有此成就
        const userAchievements = user.achievements || [];
        const hasAchievement = userAchievements.some(
          userAch => userAch.achievementId === achievement.id
        );
        
        if (hasAchievement) continue;
        
        let isEarned = false;
        const criteria = achievement.criteria;
        
        switch (criteria.metric) {
          case 'activities_count':
            const activityCount = await Activity.count({ where: { userId } });
            isEarned = activityCount >= criteria.target;
            break;
            
          case 'carbon_saved':
            isEarned = user.totalCarbonSaved >= criteria.target;
            break;
            
          case 'points_earned':
            isEarned = user.points >= criteria.target;
            break;
            
          case 'streak_days':
            const streak = user.streak || { current: 0 };
            isEarned = streak.current >= criteria.target;
            break;
            
          case 'login_days':
            // 使用账户年龄作为代理
            const accountAge = Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24));
            isEarned = accountAge >= criteria.target;
            break;
            
          default:
            isEarned = false;
        }
        
        if (isEarned) {
          newAchievements.push(achievement);
          
          // 添加成就到用户
          const updatedAchievements = [...userAchievements, {
            achievementId: achievement.id,
            unlockedAt: new Date()
          }];
          user.achievements = updatedAchievements;
          
          // 奖励积分
          const rewards = achievement.rewards || {};
          if (rewards.points > 0) {
            user.points += rewards.points;
          }
        }
      }
      
      if (newAchievements.length > 0) {
        await user.save();
      }
      
      return newAchievements;
    } catch (error) {
      console.error('Error checking user achievements:', error);
      return [];
    }
  }
}

// 初始化模型
const initAchievementModel = () => {
  const sequelize = getSequelize();
  if (!sequelize) return null;

  Achievement.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 100]
      }
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        len: [1, 500]
      }
    },
    icon: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM('beginner', 'activity', 'streak', 'carbon', 'social', 'special'),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('milestone', 'streak', 'cumulative', 'special'),
      allowNull: false
    },
    criteria: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidCriteria(value) {
          if (!value || typeof value !== 'object') {
            throw new Error('Criteria must be an object');
          }
          
          const validMetrics = ['activities_count', 'carbon_saved', 'points_earned', 'streak_days', 'login_days', 'social_interactions', 'special_event'];
          if (!validMetrics.includes(value.metric)) {
            throw new Error('Invalid metric');
          }
          
          if (!value.target || value.target < 1) {
            throw new Error('Target must be at least 1');
          }
          
          const validTimeframes = ['daily', 'weekly', 'monthly', 'yearly', 'all_time'];
          if (value.timeframe && !validTimeframes.includes(value.timeframe)) {
            throw new Error('Invalid timeframe');
          }
        }
      },
      defaultValue: {
        metric: 'activities_count',
        target: 1,
        timeframe: 'all_time'
      }
    },
    rewards: {
      type: DataTypes.JSON,
      defaultValue: {
        points: 0,
        badge: null,
        title: null
      },
      validate: {
        isValidRewards(value) {
          if (value && typeof value === 'object') {
            if (value.points && value.points < 0) {
              throw new Error('Points cannot be negative');
            }
          }
        }
      }
    },
    rarity: {
      type: DataTypes.ENUM('common', 'rare', 'epic', 'legendary'),
      defaultValue: 'common'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Achievement',
    tableName: 'achievements',
    timestamps: true,
    indexes: [
      { fields: ['category', 'order'] },
      { fields: ['isActive'] },
      { fields: ['rarity'] },
      { unique: true, fields: ['name'] }
    ]
  });

  return Achievement;
};

// 导出初始化函数和模型类
export { initAchievementModel };
export default Achievement;