import api from './config.js'

export const authAPI = {
  // 用户注册
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  // 用户登录
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  // 用户登出
  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  },

  // 获取当前用户信息
  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  // 更新用户资料
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData)
    return response.data
  },

  // 修改密码
  changePassword: async (passwordData) => {
    const response = await api.post('/auth/change-password', passwordData)
    return response.data
  },

  // 验证token
  verifyToken: async () => {
    const response = await api.post('/auth/verify-token')
    return response.data
  }
}