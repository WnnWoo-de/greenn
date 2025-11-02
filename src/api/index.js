import api from './config.js'
import { authAPI } from './auth.js'
import { activityAPI } from './activity.js'

// 用户相关API
export const userAPI = {
  // 获取排行榜
  getLeaderboard: async (params = {}) => {
    const response = await api.get('/users/leaderboard', { params })
    return response.data
  },

  // 获取用户资料
  getUserProfile: async (id) => {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  // 获取用户活动
  getUserActivities: async (id, params = {}) => {
    const response = await api.get(`/users/${id}/activities`, { params })
    return response.data
  },

  // 获取用户统计
  getUserStats: async (id) => {
    const response = await api.get(`/users/${id}/stats`)
    return response.data
  },

  // 搜索用户
  searchUsers: async (query) => {
    const response = await api.post('/users/search', { query })
    return response.data
  }
}

// 成就相关API
export const achievementAPI = {
  // 获取所有成就
  getAchievements: async () => {
    const response = await api.get('/achievements')
    return response.data
  },

  // 检查用户成就
  checkAchievements: async () => {
    const response = await api.post('/achievements/check')
    return response.data
  }
}

// 碳足迹相关API
export const footprintAPI = {
  // 计算碳足迹
  calculateFootprint: async (data) => {
    const response = await api.post('/footprint/calculate', data)
    return response.data
  }
}

// 商店相关API
export const shopAPI = {
  // 获取商店物品
  getShopItems: async (params = {}) => {
    const response = await api.get('/shop/items', { params })
    return response.data
  },

  // 购买物品
  purchaseItem: async (itemData) => {
    const response = await api.post('/shop/purchase', itemData)
    return response.data
  }
}

// AI建议相关API
export const adviceAPI = {
  // 获取每日建议
  getDailyAdvice: async () => {
    const response = await api.get('/advice/daily')
    return response.data
  },

  // 获取分类建议
  getCategoryAdvice: async (category) => {
    const response = await api.get(`/advice/category/${category}`)
    return response.data
  },

  // 获取个性化建议
  getPersonalizedAdvice: async (data) => {
    const response = await api.post('/advice/personalized', data)
    return response.data
  }
}

// 反馈相关API
export const feedbackAPI = {
  // 提交反馈
  submitFeedback: async (feedbackData) => {
    const response = await api.post('/feedback', feedbackData)
    return response.data
  },

  // 获取我的反馈
  getMyFeedback: async () => {
    const response = await api.get('/feedback/my')
    return response.data
  }
}

// 导出所有API
export {
  authAPI,
  activityAPI
}

// 默认导出api实例
export default api