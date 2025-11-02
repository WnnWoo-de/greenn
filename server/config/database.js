import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

let sequelize;

const connectDB = async () => {
  // 如果是开发环境且没有配置MySQL连接信息，则跳过数据库连接
  if (process.env.NODE_ENV === 'development' && !process.env.DB_HOST) {
    console.log('🔧 Development mode: Running without MySQL connection');
    console.log('📝 Note: Database operations will use mock data');
    return null;
  }

  try {
    // 创建Sequelize实例
    sequelize = new Sequelize(
      process.env.DB_NAME || 'greenn_db',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || 'Wnn0705520@',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        dialectOptions: {
          charset: 'utf8mb4',
          collate: 'utf8mb4_unicode_ci',
        },
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        timezone: '+08:00' // 设置时区为中国时区
      }
    );

    // 测试连接
    await sequelize.authenticate();
    console.log(`✅ MySQL Connected: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
    
    // 同步数据库表结构（仅在开发环境）
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('📊 Database tables synchronized');
    }

    return sequelize;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    
    // 在开发环境下，如果连接失败则继续运行（使用模拟数据）
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: Continuing without database connection');
      console.log('📝 Note: Database operations will use mock data');
      return null;
    }
    
    // 生产环境下连接失败则退出
    process.exit(1);
  }
};

// 获取Sequelize实例
export const getSequelize = () => sequelize;

// 测试数据库连接
export const testConnection = async () => {
  if (!sequelize) {
    throw new Error('Database not connected');
  }
  
  try {
    await sequelize.authenticate();
    return true;
  } catch (error) {
    throw new Error(`Database connection test failed: ${error.message}`);
  }
};

export default connectDB;