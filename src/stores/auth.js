import { defineStore } from 'pinia'
import { authAPI } from '@/api/auth.js'

const STORAGE_KEY = 'auth-state'
const TOKEN_KEY = 'auth-token'

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { isLoggedIn: false, user: null, points: 0, history: [], loading: false, error: null }
    const parsed = JSON.parse(raw)
    return {
      isLoggedIn: Boolean(parsed?.isLoggedIn),
      user: parsed?.user ?? null,
      points: Number.isFinite(parsed?.points) ? parsed.points : 0,
      history: Array.isArray(parsed?.history) ? parsed.history : [],
      loading: false,
      error: null
    }
  } catch (e) {
    return { isLoggedIn: false, user: null, points: 0, history: [], loading: false, error: null }
  }
}

function save(state) {
  const { loading, error, ...stateToSave } = state
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
}

export const useAuthStore = defineStore('auth', {
  state: () => loadState(),
  getters: {
    username: (state) => state.user?.username ?? '',
    isAuthenticated: (state) => state.isLoggedIn && !!localStorage.getItem(TOKEN_KEY),
  },
  actions: {
    // 设置加载状态
    setLoading(loading) {
      this.loading = loading
    },

    // 设置错误信息
    setError(error) {
      this.error = error
    },

    // 清除错误信息
    clearError() {
      this.error = null
    },

    // 用户注册
    async register(userData) {
      try {
        this.setLoading(true)
        this.clearError()
        
        const response = await authAPI.register(userData)
        
        if (response.success && response.token) {
          localStorage.setItem(TOKEN_KEY, response.token)
          this.user = response.user
          this.isLoggedIn = true
          this.points = response.user.points || 0
          save(this.$state)
          return { success: true, user: response.user }
        }
        
        throw new Error(response.message || '注册失败')
      } catch (error) {
        const message = error.response?.data?.message || error.message || '注册失败'
        this.setError(message)
        return { success: false, message }
      } finally {
        this.setLoading(false)
      }
    },

    // 用户登录
    async login(credentials) {
      try {
        this.setLoading(true)
        this.clearError()
        
        const response = await authAPI.login(credentials)
        
        if (response.success && response.token) {
          localStorage.setItem(TOKEN_KEY, response.token)
          this.user = response.user
          this.isLoggedIn = true
          this.points = response.user.points || 0
          if (!Array.isArray(this.history)) this.history = []
          save(this.$state)
          return { success: true, user: response.user }
        }
        
        throw new Error(response.message || '登录失败')
      } catch (error) {
        const message = error.response?.data?.message || error.message || '登录失败'
        this.setError(message)
        return { success: false, message }
      } finally {
        this.setLoading(false)
      }
    },

    // 用户登出
    async logout() {
      try {
        await authAPI.logout()
      } catch (error) {
        console.warn('登出请求失败:', error)
      } finally {
        // 无论API调用是否成功，都清除本地状态
        localStorage.removeItem(TOKEN_KEY)
        this.user = null
        this.isLoggedIn = false
        this.points = 0
        this.history = []
        save(this.$state)
      }
    },

    // 获取当前用户信息
    async fetchCurrentUser() {
      try {
        this.setLoading(true)
        this.clearError()
        
        const response = await authAPI.getCurrentUser()
        
        if (response.success) {
          this.user = response.user
          this.points = response.user.points || 0
          this.isLoggedIn = true
          save(this.$state)
          return { success: true, user: response.user }
        }
        
        throw new Error(response.message || '获取用户信息失败')
      } catch (error) {
        const message = error.response?.data?.message || error.message || '获取用户信息失败'
        this.setError(message)
        
        // 如果是认证错误，清除本地状态
        if (error.response?.status === 401) {
          await this.logout()
        }
        
        return { success: false, message }
      } finally {
        this.setLoading(false)
      }
    },

    // 更新用户资料
    async updateProfile(profileData) {
      try {
        this.setLoading(true)
        this.clearError()
        
        const response = await authAPI.updateProfile(profileData)
        
        if (response.success) {
          this.user = { ...this.user, ...response.user }
          save(this.$state)
          return { success: true, user: response.user }
        }
        
        throw new Error(response.message || '更新资料失败')
      } catch (error) {
        const message = error.response?.data?.message || error.message || '更新资料失败'
        this.setError(message)
        return { success: false, message }
      } finally {
        this.setLoading(false)
      }
    },

    // 修改密码
    async changePassword(passwordData) {
      try {
        this.setLoading(true)
        this.clearError()
        
        const response = await authAPI.changePassword(passwordData)
        
        if (response.success) {
          return { success: true, message: response.message || '密码修改成功' }
        }
        
        throw new Error(response.message || '密码修改失败')
      } catch (error) {
        const message = error.response?.data?.message || error.message || '密码修改失败'
        this.setError(message)
        return { success: false, message }
      } finally {
        this.setLoading(false)
      }
    },

    // 验证token
    async verifyToken() {
      const token = localStorage.getItem(TOKEN_KEY)
      if (!token) {
        this.isLoggedIn = false
        return false
      }

      try {
        const response = await authAPI.verifyToken()
        if (response.success) {
          this.isLoggedIn = true
          return true
        }
      } catch (error) {
        console.warn('Token验证失败:', error)
      }

      // Token无效，清除状态
      await this.logout()
      return false
    },

    // 本地添加积分（保持向后兼容）
    addPoints(amount, reason = '活动奖励') {
      const val = Number(amount) || 0
      if (val <= 0) return
      this.points += val
      this.history.unshift({ type: 'income', amount: val, reason, at: Date.now() })
      save(this.$state)
    },

    // 本地消费积分（保持向后兼容）
    spendPoints(amount, reason = '积分消费') {
      const val = Number(amount) || 0
      if (val <= 0) return false
      if (this.points < val) return false
      this.points -= val
      this.history.unshift({ type: 'expense', amount: val, reason, at: Date.now() })
      save(this.$state)
      return true
    },

    // 同步用户积分（从服务器获取最新积分）
    async syncPoints() {
      if (!this.isLoggedIn) return
      
      try {
        const result = await this.fetchCurrentUser()
        if (result.success) {
          this.points = result.user.points || 0
          save(this.$state)
        }
      } catch (error) {
        console.warn('同步积分失败:', error)
      }
    }
  },
})