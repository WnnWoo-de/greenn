-- 创建数据库脚本 for MySQL 8.0
-- 使用前请确保MySQL服务已启动

-- 创建数据库
CREATE DATABASE IF NOT EXISTS greenn_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE greenn_db;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) DEFAULT NULL,
    points INT DEFAULT 0,
    level INT DEFAULT 1,
    totalCarbonSaved DECIMAL(10,2) DEFAULT 0.00,
    streak JSON DEFAULT NULL,
    achievements JSON DEFAULT NULL,
    preferences JSON DEFAULT NULL,
    isActive BOOLEAN DEFAULT true,
    lastLoginAt DATETIME DEFAULT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_points (points),
    INDEX idx_level (level),
    INDEX idx_totalCarbonSaved (totalCarbonSaved),
    INDEX idx_isActive (isActive),
    INDEX idx_createdAt (createdAt)
);

-- 创建活动表
CREATE TABLE IF NOT EXISTS activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    type ENUM('transport', 'energy', 'waste', 'food', 'water', 'other') NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    carbonSaved DECIMAL(8,2) DEFAULT 0.00,
    points INT DEFAULT 0,
    duration INT DEFAULT NULL,
    location VARCHAR(100) DEFAULT NULL,
    tags JSON DEFAULT NULL,
    images JSON DEFAULT NULL,
    verificationStatus ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    isPublic BOOLEAN DEFAULT true,
    likes JSON DEFAULT NULL,
    comments JSON DEFAULT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_userId (userId),
    INDEX idx_type (type),
    INDEX idx_category (category),
    INDEX idx_carbonSaved (carbonSaved),
    INDEX idx_points (points),
    INDEX idx_verificationStatus (verificationStatus),
    INDEX idx_isPublic (isPublic),
    INDEX idx_createdAt (createdAt)
);

-- 创建成就表
CREATE TABLE IF NOT EXISTS achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(10) DEFAULT NULL,
    category ENUM('beginner', 'activity', 'carbon', 'streak', 'social', 'special') NOT NULL,
    type ENUM('milestone', 'cumulative', 'streak', 'social', 'special') NOT NULL,
    criteria JSON NOT NULL,
    rewards JSON NOT NULL,
    rarity ENUM('common', 'rare', 'epic', 'legendary') DEFAULT 'common',
    isActive BOOLEAN DEFAULT true,
    order_num INT DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_type (type),
    INDEX idx_rarity (rarity),
    INDEX idx_isActive (isActive),
    INDEX idx_order (order_num)
);

-- 插入默认成就数据
INSERT INTO achievements (name, description, icon, category, type, criteria, rewards, rarity, order_num) VALUES
('环保新手', '完成第一个环保活动', '🌱', 'beginner', 'milestone', 
 '{"metric": "activities_count", "target": 1, "timeframe": "all_time"}',
 '{"points": 50, "badge": "beginner_badge", "title": "环保新手"}',
 'common', 1),

('环保达人', '完成10个环保活动', '🌿', 'activity', 'milestone',
 '{"metric": "activities_count", "target": 10, "timeframe": "all_time"}',
 '{"points": 200, "badge": "activity_badge", "title": "环保达人"}',
 'rare', 2),

('碳减排先锋', '累计减少100kg碳排放', '♻️', 'carbon', 'cumulative',
 '{"metric": "carbon_saved", "target": 100, "timeframe": "all_time"}',
 '{"points": 500, "badge": "carbon_badge", "title": "碳减排先锋"}',
 'epic', 3),

('坚持不懈', '连续7天完成环保活动', '🔥', 'streak', 'streak',
 '{"metric": "streak_days", "target": 7, "timeframe": "all_time"}',
 '{"points": 300, "badge": "streak_badge", "title": "坚持不懈"}',
 'rare', 4),

('积分大师', '累计获得1000积分', '⭐', 'activity', 'cumulative',
 '{"metric": "points_earned", "target": 1000, "timeframe": "all_time"}',
 '{"points": 100, "badge": "points_badge", "title": "积分大师"}',
 'epic', 5);

-- 显示创建的表
SHOW TABLES;

-- 显示表结构
DESCRIBE users;
DESCRIBE activities;
DESCRIBE achievements;