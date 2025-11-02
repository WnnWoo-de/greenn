import { getSequelize } from '../config/database.js';
import { initUserModel } from '../models/User.js';
import { initActivityModel } from '../models/Activity.js';
import { initAchievementModel } from '../models/Achievement.js';

// 初始化数据库和表结构
async function initDatabase() {
  try {
    console.log('开始初始化数据库...');
    
    // 获取Sequelize实例
    const sequelize = getSequelize();
    if (!sequelize) {
      console.error('无法连接到数据库');
      return false;
    }

    // 测试数据库连接
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 初始化所有模型
    console.log('初始化模型...');
    const User = initUserModel();
    const Activity = initActivityModel();
    const Achievement = initAchievementModel();

    if (!User || !Activity || !Achievement) {
      console.error('模型初始化失败');
      return false;
    }

    // 设置模型关联
    console.log('设置模型关联...');
    
    // User 和 Activity 的关联
    User.hasMany(Activity, {
      foreignKey: 'userId',
      as: 'activities'
    });
    Activity.belongsTo(User, {
      foreignKey: 'userId',
      as: 'user'
    });

    // 同步数据库表结构
    console.log('同步数据库表结构...');
    await sequelize.sync({ force: false }); // force: false 表示不删除现有表
    
    console.log('数据库初始化完成！');
    
    // 创建默认成就数据
    await createDefaultAchievements(Achievement);
    
    return true;
  } catch (error) {
    console.error('数据库初始化失败:', error);
    return false;
  }
}

// 创建默认成就数据
async function createDefaultAchievements(Achievement) {
  try {
    console.log('创建默认成就数据...');
    
    const defaultAchievements = [
      {
        name: '环保新手',
        description: '完成第一个环保活动',
        icon: '🌱',
        category: 'beginner',
        type: 'milestone',
        criteria: {
          metric: 'activities_count',
          target: 1,
          timeframe: 'all_time'
        },
        rewards: {
          points: 50,
          badge: 'beginner_badge',
          title: '环保新手'
        },
        rarity: 'common',
        order: 1
      },
      {
        name: '环保达人',
        description: '完成10个环保活动',
        icon: '🌿',
        category: 'activity',
        type: 'milestone',
        criteria: {
          metric: 'activities_count',
          target: 10,
          timeframe: 'all_time'
        },
        rewards: {
          points: 200,
          badge: 'activity_badge',
          title: '环保达人'
        },
        rarity: 'rare',
        order: 2
      },
      {
        name: '碳减排先锋',
        description: '累计减少100kg碳排放',
        icon: '♻️',
        category: 'carbon',
        type: 'cumulative',
        criteria: {
          metric: 'carbon_saved',
          target: 100,
          timeframe: 'all_time'
        },
        rewards: {
          points: 500,
          badge: 'carbon_badge',
          title: '碳减排先锋'
        },
        rarity: 'epic',
        order: 3
      },
      {
        name: '坚持不懈',
        description: '连续7天完成环保活动',
        icon: '🔥',
        category: 'streak',
        type: 'streak',
        criteria: {
          metric: 'streak_days',
          target: 7,
          timeframe: 'all_time'
        },
        rewards: {
          points: 300,
          badge: 'streak_badge',
          title: '坚持不懈'
        },
        rarity: 'rare',
        order: 4
      },
      {
        name: '积分大师',
        description: '累计获得1000积分',
        icon: '⭐',
        category: 'activity',
        type: 'cumulative',
        criteria: {
          metric: 'points_earned',
          target: 1000,
          timeframe: 'all_time'
        },
        rewards: {
          points: 100,
          badge: 'points_badge',
          title: '积分大师'
        },
        rarity: 'epic',
        order: 5
      }
    ];

    // 检查是否已存在成就数据
    const existingCount = await Achievement.count();
    if (existingCount === 0) {
      await Achievement.bulkCreate(defaultAchievements);
      console.log(`成功创建 ${defaultAchievements.length} 个默认成就`);
    } else {
      console.log('成就数据已存在，跳过创建');
    }
  } catch (error) {
    console.error('创建默认成就失败:', error);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase().then((success) => {
    if (success) {
      console.log('数据库初始化成功完成');
      process.exit(0);
    } else {
      console.log('数据库初始化失败');
      process.exit(1);
    }
  });
}

export { initDatabase, createDefaultAchievements };