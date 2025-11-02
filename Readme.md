# 绿我同行 GreenSight AI

一个基于 Vue 3 的环保公益平台，集成 AI 识别、活动参与、积分商城等功能，致力于推广绿色生活方式。

## 🌱 项目简介

绿我同行 GreenSight AI 是一个现代化的环保公益平台，旨在通过技术手段促进环保意识的普及和绿色生活方式的推广。平台提供多样化的环保功能，让用户在参与环保行动的同时获得积分奖励，形成良性的环保生态循环。

## ✨ 主要功能

### 🤖 AI 智能识别
- 垃圾分类识别：使用 TensorFlow.js 实现前端 AI 识别
- 环保知识学习：提供垃圾分类指导和环保小贴士
- 实时识别反馈：即时获取识别结果和建议

### 🎯 公益活动系统
- 活动浏览与搜索：支持按分类、地点、时间筛选
- 在线报名参与：一键报名环保公益活动
- 活动状态管理：跟踪已报名、进行中、已结束的活动
- 积分奖励机制：参与活动获得绿色积分

### 🏪 积分商城
- 环保商品兑换：使用积分兑换环保用品
- 积分历史记录：详细的积分收支明细
- 个性化推荐：根据用户行为推荐商品

### 👤 用户系统
- 用户注册登录：完整的身份认证系统
- 个人资料管理：用户信息和偏好设置
- 成就系统：环保行为激励机制
- 排行榜功能：用户积分排名展示

### 📊 数据统计
- 碳足迹追踪：个人环保行为数据分析
- 环保建议：基于数据的个性化建议
- 社区互动：用户间的环保经验分享

## 🛠 技术栈

### 前端框架
- **Vue 3** - 渐进式 JavaScript 框架
- **Vue Router 4** - 官方路由管理器
- **Pinia** - 现代化状态管理库

### UI 与动画
- **GSAP** - 高性能动画库
- **Animate.css** - CSS 动画库
- **Particles.vue3** - 粒子效果组件
- **Chart.js** - 数据可视化图表库

### AI 与数据处理
- **TensorFlow.js** - 前端机器学习框架
- **XLSX** - Excel 文件处理库

### 开发工具
- **Vite** - 现代化构建工具
- **TypeScript** - 类型安全的 JavaScript
- **Sass** - CSS 预处理器
- **PostCSS** - CSS 后处理工具

## 📁 项目结构

```
greenn/
├── src/
│   ├── assets/              # 静态资源
│   │   ├── images/         # 图片资源
│   │   └── styles/         # 样式文件
│   ├── components/         # 组件库
│   │   ├── layout/         # 布局组件
│   │   └── ui/            # UI 组件
│   ├── directives/         # 自定义指令
│   │   └── reveal.js      # 滚动显示指令
│   ├── router/            # 路由配置
│   │   └── index.js       # 路由定义
│   ├── stores/            # 状态管理
│   │   ├── auth.js        # 用户认证
│   │   ├── activity.js    # 活动管理
│   │   ├── achievements.js # 成就系统
│   │   ├── advice.js      # 建议系统
│   │   ├── checkin.js     # 签到功能
│   │   ├── feedback.js    # 反馈系统
│   │   ├── footprint.js   # 碳足迹
│   │   ├── notify.js      # 通知系统
│   │   └── shop.js        # 商城功能
│   ├── views/             # 页面组件
│   │   ├── Home.vue       # 首页
│   │   ├── Activity.vue   # 活动页面
│   │   ├── AIRecognition.vue # AI识别
│   │   ├── Store.vue      # 积分商城
│   │   ├── Profile.vue    # 个人中心
│   │   ├── Login.vue      # 登录页面
│   │   ├── Register.vue   # 注册页面
│   │   └── ...           # 其他页面
│   ├── App.vue           # 根组件
│   └── main.js           # 应用入口
├── package.json          # 项目配置
├── vite.config.js       # Vite 配置
└── README.md            # 项目说明
```

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```
访问 http://localhost:5173 查看应用

### 生产构建
```bash
npm run build
```

### 预览构建结果
```bash
npm run preview
```

## 🎨 核心特性

### 响应式设计
- 移动端优先的响应式布局
- 适配各种屏幕尺寸和设备
- 流畅的用户交互体验

### 动画效果
- 页面切换动画
- 滚动显示动画
- 粒子背景效果
- 光线追踪效果

### 数据持久化
- 本地存储用户状态
- 离线数据缓存
- 状态恢复机制

### 性能优化
- 路由懒加载
- 组件按需加载
- 图片懒加载
- 代码分割优化

## 🔧 配置说明

### 路径别名
项目配置了 `@` 别名指向 `src` 目录，可以使用绝对路径导入：
```javascript
import Component from '@/components/Component.vue'
```

### 环境变量
可以在项目根目录创建 `.env` 文件配置环境变量：
```
VITE_API_BASE_URL=https://api.example.com
VITE_APP_TITLE=绿我同行 GreenSight AI
```

## 📱 页面功能

| 页面 | 路径 | 功能描述 |
|------|------|----------|
| 首页 | `/` | 平台介绍、功能导航、最新活动 |
| 活动页面 | `/activity` | 活动浏览、搜索、报名 |
| AI识别 | `/ai-recognition` | 垃圾分类识别、环保知识 |
| 积分商城 | `/store` | 商品浏览、积分兑换 |
| 社区 | `/community` | 用户互动、经验分享 |
| 个人中心 | `/profile` | 用户信息、积分历史 |
| 排行榜 | `/achievements` | 用户积分排名 |
| 成就系统 | `/achievements` | 环保成就展示 |
| 碳足迹 | `/carbon-footprint` | 个人环保数据 |
| AI建议 | `/ai-advice` | 个性化环保建议 |

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🌟 致谢

感谢所有为环保事业贡献力量的开发者和用户！

---

**让环保成为一种生活习惯** 🌍💚