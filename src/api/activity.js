import api from './config.js'

export const activityAPI = {
  // 创建活动
  createActivity: async (activityData) => {
    const response = await api.post('/activities', activityData)
    return response.data
  },

  // 获取活动列表
  getActivities: async (params = {}) => {
    const response = await api.get('/activities', { params })
    return response.data
  },

  // 获取我的活动
  getMyActivities: async (params = {}) => {
    const response = await api.get('/activities/my', { params })
    return response.data
  },

  // 获取活动统计
  getActivityStats: async (params = {}) => {
    const response = await api.get('/activities/stats', { params })
    return response.data
  },

  // 获取单个活动
  getActivity: async (id) => {
    const response = await api.get(`/activities/${id}`)
    return response.data
  },

  // 更新活动
  updateActivity: async (id, activityData) => {
    const response = await api.put(`/activities/${id}`, activityData)
    return response.data
  },

  // 删除活动
  deleteActivity: async (id) => {
    const response = await api.delete(`/activities/${id}`)
    return response.data
  },

  // 点赞/取消点赞活动
  toggleLike: async (id) => {
    const response = await api.post(`/activities/${id}/like`)
    return response.data
  },

  // 添加评论
  addComment: async (id, commentData) => {
    const response = await api.post(`/activities/${id}/comment`, commentData)
    return response.data
  }
}