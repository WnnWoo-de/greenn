import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 主题类型定义
  const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    AUTO: 'auto'
  }

  // 当前主题设置
  const currentTheme = ref(THEMES.AUTO)
  
  // 系统主题偏好
  const systemPreference = ref('light')
  
  // 实际应用的主题
  const appliedTheme = computed(() => {
    if (currentTheme.value === THEMES.AUTO) {
      return systemPreference.value
    }
    return currentTheme.value
  })

  // 主题配置
  const themeConfig = {
    [THEMES.LIGHT]: {
      name: '浅色主题',
      icon: '☀️',
      colors: {
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#f8fafc',
        '--bg-tertiary': '#f1f5f9',
        '--text-primary': '#1e293b',
        '--text-secondary': '#475569',
        '--text-muted': '#64748b',
        '--border-primary': '#e2e8f0',
        '--border-secondary': '#cbd5e1',
        '--green': '#22c55e',
        '--blue': '#3b82f6',
        '--accent-1': '#10b981',
        '--accent-2': '#059669',
        '--shadow': 'rgba(0, 0, 0, 0.1)',
        '--glass-bg': 'rgba(255, 255, 255, 0.8)',
        '--glass-border': 'rgba(255, 255, 255, 0.2)'
      }
    },
    [THEMES.DARK]: {
      name: '深色主题',
      icon: '🌙',
      colors: {
        '--bg-primary': '#0f172a',
        '--bg-secondary': '#1e293b',
        '--bg-tertiary': '#334155',
        '--text-primary': '#f8fafc',
        '--text-secondary': '#cbd5e1',
        '--text-muted': '#94a3b8',
        '--border-primary': '#334155',
        '--border-secondary': '#475569',
        '--green': '#10b981',
        '--blue': '#3b82f6',
        '--accent-1': '#059669',
        '--accent-2': '#047857',
        '--shadow': 'rgba(0, 0, 0, 0.3)',
        '--glass-bg': 'rgba(15, 23, 42, 0.8)',
        '--glass-border': 'rgba(255, 255, 255, 0.1)'
      }
    }
  }

  // 初始化主题
  const initTheme = () => {
    // 从 localStorage 读取保存的主题设置
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
      currentTheme.value = savedTheme
    }

    // 检测系统主题偏好
    updateSystemPreference()
    
    // 监听系统主题变化
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', updateSystemPreference)
    }

    // 应用主题
    applyTheme()
  }

  // 更新系统主题偏好
  const updateSystemPreference = () => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      systemPreference.value = THEMES.DARK
    } else {
      systemPreference.value = THEMES.LIGHT
    }
  }

  // 应用主题到 DOM
  const applyTheme = () => {
    const theme = appliedTheme.value
    const config = themeConfig[theme]
    
    if (!config) return

    // 设置 HTML 的 data-theme 属性
    document.documentElement.setAttribute('data-theme', theme)
    
    // 应用 CSS 变量
    const root = document.documentElement
    Object.entries(config.colors).forEach(([property, value]) => {
      root.style.setProperty(property, value)
    })

    // 更新 Tailwind 的暗色模式类
    if (theme === THEMES.DARK) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // 设置主题
  const setTheme = (theme) => {
    if (!Object.values(THEMES).includes(theme)) return
    
    currentTheme.value = theme
    localStorage.setItem('theme', theme)
    applyTheme()
  }

  // 切换主题
  const toggleTheme = () => {
    const themes = [THEMES.LIGHT, THEMES.DARK, THEMES.AUTO]
    const currentIndex = themes.indexOf(currentTheme.value)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  // 获取当前主题配置
  const getCurrentThemeConfig = computed(() => {
    return themeConfig[appliedTheme.value]
  })

  // 获取主题选项
  const getThemeOptions = () => {
    return [
      { value: THEMES.LIGHT, ...themeConfig[THEMES.LIGHT] },
      { value: THEMES.DARK, ...themeConfig[THEMES.DARK] },
      { value: THEMES.AUTO, name: '跟随系统', icon: '🔄' }
    ]
  }

  // 监听主题变化
  watch(appliedTheme, () => {
    applyTheme()
  })

  // 是否为暗色主题
  const isDark = computed(() => appliedTheme.value === THEMES.DARK)

  return {
    // 状态
    currentTheme,
    appliedTheme,
    systemPreference,
    isDark,
    
    // 配置
    THEMES,
    getCurrentThemeConfig,
    
    // 方法
    initTheme,
    setTheme,
    toggleTheme,
    getThemeOptions,
    applyTheme
  }
})