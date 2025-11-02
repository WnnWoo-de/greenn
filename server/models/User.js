import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import { getSequelize } from '../config/database.js';

class User extends Model {
  // 实例方法：比较密码
  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  // 实例方法：添加积分
  async addPoints(points, reason = 'Activity reward') {
    this.points = Math.max(0, this.points + points);
    
    // 计算等级（每1000积分升一级）
    const newLevel = Math.floor(this.points / 1000) + 1;
    if (newLevel > this.level) {
      this.level = newLevel;
    }
    
    return await this.save();
  }

  // 实例方法：更新连续签到
  async updateStreak() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastActivity = this.streak?.lastActivity ? new Date(this.streak.lastActivity) : null;
    
    if (lastActivity) {
      const lastActivityDate = new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate());
      const daysDiff = Math.floor((today - lastActivityDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // 连续签到
        this.streak.current += 1;
        this.streak.longest = Math.max(this.streak.longest, this.streak.current);
      } else if (daysDiff > 1) {
        // 断签，重新开始
        this.streak.current = 1;
      }
      // daysDiff === 0 表示今天已经签到过了，不做处理
    } else {
      // 第一次签到
      this.streak.current = 1;
      this.streak.longest = 1;
    }
    
    this.streak.lastActivity = now;
    return await this.save();
  }

  // 虚拟属性：用户资料
  get profile() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      avatar: this.avatar,
      points: this.points,
      level: this.level,
      totalCarbonSaved: this.totalCarbonSaved,
      streak: this.streak,
      achievements: this.achievements || [],
      preferences: this.preferences,
      createdAt: this.createdAt,
      lastLogin: this.lastLogin
    };
  }
}

// 初始化模型
const initUserModel = () => {
  const sequelize = getSequelize();
  if (!sequelize) return null;

  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 30],
        is: /^[a-zA-Z0-9_]+$/
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [6, 255]
      }
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    totalCarbonSaved: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    streak: {
      type: DataTypes.JSON,
      defaultValue: {
        current: 0,
        longest: 0,
        lastActivity: null
      }
    },
    preferences: {
      type: DataTypes.JSON,
      defaultValue: {
        notifications: {
          email: true,
          push: true
        },
        privacy: {
          showProfile: true,
          showActivities: true
        },
        theme: 'auto'
      }
    },
    achievements: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastLogin: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    indexes: [
      { fields: ['email'] },
      { fields: ['username'] },
      { fields: ['points'] },
      { fields: ['totalCarbonSaved'] }
    ],
    hooks: {
      beforeSave: async (user) => {
        // 如果密码被修改，则加密
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  return User;
};

// 导出初始化函数和模型类
export { initUserModel };
export default User;