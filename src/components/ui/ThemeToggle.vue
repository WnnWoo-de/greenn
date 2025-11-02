<template>
  <div class="theme-toggle">
    <!-- 简单切换按钮 -->
    <button 
      v-if="mode === 'simple'"
      @click="toggleTheme"
      class="theme-btn"
      :title="`切换到${getNextThemeName()}`"
    >
      <span class="theme-icon">{{ getCurrentThemeIcon() }}</span>
    </button>

    <!-- 下拉选择器 -->
    <div v-else-if="mode === 'dropdown'" class="theme-dropdown" ref="dropdownRef">
      <button 
        @click="toggleDropdown"
        class="theme-btn dropdown-trigger"
        :class="{ active: isDropdownOpen }"
      >
        <span class="theme-icon">{{ getCurrentThemeIcon() }}</span>
        <span class="theme-text">{{ getCurrentThemeName() }}</span>
        <svg 
          class="dropdown-arrow" 
          :class="{ rotated: isDropdownOpen }"
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2"
        >
          <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
      </button>
      
      <transition name="dropdown">
        <div v-if="isDropdownOpen" class="dropdown-menu">
          <button
            v-for="option in themeOptions"
            :key="option.value"
            @click="selectTheme(option.value)"
            class="dropdown-item"
            :class="{ active: currentTheme === option.value }"
          >
            <span class="option-icon">{{ option.icon }}</span>
            <span class="option-text">{{ option.name }}</span>
            <svg 
              v-if="currentTheme === option.value"
              class="check-icon" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="2"
            >
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
          </button>
        </div>
      </transition>
    </div>

    <!-- 切换器样式 -->
    <div v-else-if="mode === 'switch'" class="theme-switch">
      <label class="switch-label">
        <input 
          type="checkbox" 
          :checked="isDark" 
          @change="toggleLightDark"
          class="switch-input"
        >
        <span class="switch-slider">
          <span class="switch-icon sun">☀️</span>
          <span class="switch-icon moon">🌙</span>
        </span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '@/stores/theme'

// Props
const props = defineProps({
  mode: {
    type: String,
    default: 'simple', // 'simple', 'dropdown', 'switch'
    validator: (value) => ['simple', 'dropdown', 'switch'].includes(value)
  },
  showText: {
    type: Boolean,
    default: false
  }
})

// Theme store
const themeStore = useThemeStore()
const { currentTheme, isDark, THEMES } = themeStore

// Dropdown state
const isDropdownOpen = ref(false)
const dropdownRef = ref(null)

// Theme options
const themeOptions = computed(() => themeStore.getThemeOptions())

// Current theme info
const getCurrentThemeIcon = () => {
  const option = themeOptions.value.find(opt => opt.value === currentTheme.value)
  return option?.icon || '🔄'
}

const getCurrentThemeName = () => {
  const option = themeOptions.value.find(opt => opt.value === currentTheme.value)
  return option?.name || '跟随系统'
}

const getNextThemeName = () => {
  const themes = [THEMES.LIGHT, THEMES.DARK, THEMES.AUTO]
  const currentIndex = themes.indexOf(currentTheme.value)
  const nextIndex = (currentIndex + 1) % themes.length
  const nextTheme = themes[nextIndex]
  const option = themeOptions.value.find(opt => opt.value === nextTheme)
  return option?.name || '跟随系统'
}

// Methods
const toggleTheme = () => {
  themeStore.toggleTheme()
}

const toggleLightDark = () => {
  themeStore.setTheme(isDark.value ? THEMES.LIGHT : THEMES.DARK)
}

const selectTheme = (theme) => {
  themeStore.setTheme(theme)
  isDropdownOpen.value = false
}

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const closeDropdown = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isDropdownOpen.value = false
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<style scoped>
.theme-toggle {
  position: relative;
  display: inline-block;
}

/* 基础按钮样式 */
.theme-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  min-width: 40px;
  justify-content: center;
}

.theme-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--accent-1);
  transform: translateY(-1px);
}

.theme-btn.active {
  border-color: var(--accent-1);
  box-shadow: 0 0 0 2px var(--accent-1);
}

.theme-icon {
  font-size: 16px;
  line-height: 1;
}

.theme-text {
  font-weight: 500;
}

/* 下拉箭头 */
.dropdown-arrow {
  transition: transform 0.2s ease;
  opacity: 0.7;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

/* 下拉菜单 */
.theme-dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  min-width: 160px;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--shadow);
  z-index: 1000;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 14px;
  text-align: left;
}

.dropdown-item:hover {
  background: var(--bg-secondary);
}

.dropdown-item.active {
  background: var(--bg-tertiary);
  color: var(--accent-1);
}

.option-icon {
  font-size: 16px;
  line-height: 1;
}

.option-text {
  flex: 1;
  font-weight: 500;
}

.check-icon {
  color: var(--accent-1);
  opacity: 0.8;
}

/* 下拉动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

/* 开关样式 */
.theme-switch {
  display: inline-block;
}

.switch-label {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 32px;
  cursor: pointer;
}

.switch-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 6px;
  overflow: hidden;
}

.switch-slider::before {
  content: '';
  position: absolute;
  height: 22px;
  width: 22px;
  left: 4px;
  background: var(--bg-primary);
  border-radius: 50%;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px var(--shadow);
  z-index: 2;
}

.switch-input:checked + .switch-slider::before {
  transform: translateX(28px);
}

.switch-input:checked + .switch-slider {
  background: var(--accent-1);
  border-color: var(--accent-1);
}

.switch-icon {
  font-size: 12px;
  line-height: 1;
  z-index: 1;
  transition: opacity 0.3s ease;
}

.switch-icon.sun {
  opacity: 1;
}

.switch-icon.moon {
  opacity: 0.5;
}

.switch-input:checked + .switch-slider .switch-icon.sun {
  opacity: 0.5;
}

.switch-input:checked + .switch-slider .switch-icon.moon {
  opacity: 1;
}

/* 响应式 */
@media (max-width: 640px) {
  .theme-btn {
    padding: 6px 8px;
    font-size: 13px;
  }
  
  .dropdown-menu {
    min-width: 140px;
  }
  
  .switch-label {
    width: 50px;
    height: 28px;
  }
  
  .switch-slider::before {
    height: 20px;
    width: 20px;
  }
  
  .switch-input:checked + .switch-slider::before {
    transform: translateX(22px);
  }
}
</style>