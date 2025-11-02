# MySQL 8.0 数据库设置指南

到 MySQL 8.0。请按照以下步骤设置数据库。

## 前提条件

1. 确保已安装 MySQL 8.0
2. MySQL 服务正在运行
3. 有 MySQL 管理员权限

## 数据库设置步骤

### 1. 创建数据库和表

使用 MySQL 命令行或 MySQL Workbench 执行以下脚本：

```bash
mysql -u root -p < server/scripts/create_database.sql
```

或者手动执行 `server/scripts/create_database.sql` 文件中的 SQL 语句。

### 2. 配置环境变量

在项目根目录的 `.env` 文件中设置以下 MySQL 连接参数：

```env
# MySQL 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=greenn_db
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password

# JWT 配置
JWT_SECRET=your_jwt_secret_key
```

**重要：** 请将 `your_mysql_username` 和 `your_mysql_password` 替换为你的实际 MySQL 用户名和密码。

### 3. 安装依赖

确保已安装新的数据库依赖：

```bash
cd server
npm install
```

### 4. 初始化数据库（可选）

运行数据库初始化脚本来创建表结构和默认数据：

```bash
cd server
node scripts/initDatabase.js
```

### 5. 启动应用

```bash
npm start
```

## 数据库结构

### 用户表 (users)
- 存储用户基本信息、积分、等级、碳减排数据等
- 支持用户偏好设置和成就记录

### 活动表 (activities)
- 存储用户的环保活动记录
- 包含活动类型、碳减排量、积分、验证状态等

### 成就表 (achievements)
- 存储系统成就定义
- 包含成就条件、奖励、稀有度等信息

## 开发模式

在开发模式下，如果数据库连接失败，应用会使用模拟数据继续运行，方便开发和测试。

## 故障排除

### 连接问题
1. 检查 MySQL 服务是否运行
2. 验证 `.env` 文件中的连接参数
3. 确认 MySQL 用户有足够的权限

### 字符编码问题
数据库使用 `utf8mb4` 字符集，支持完整的 Unicode 字符，包括 emoji。

### 端口冲突
默认使用 3306 端口，如果有冲突请修改 `.env` 文件中的 `DB_PORT`。

## 数据迁移

如果你有现有的 MongoDB 数据需要迁移，请联系开发团队获取迁移脚本。

## 备份建议

定期备份数据库：

```bash
mysqldump -u username -p greenn_db > backup_$(date +%Y%m%d_%H%M%S).sql
```