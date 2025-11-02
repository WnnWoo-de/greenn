<template>
  <div class="floating-theme-toggle" :class="{ expanded: isExpanded }">
    <!-- 主切换按钮 -->
    <button 
      @click="toggleExpanded"
      class="main-toggle-btn"
      :title="isExpanded ? '收起主题选项' : '展开主题选项'"
      :aria-expanded="isExpanded.toString()"
    >
      <div class="icon-container">
        <transition name="icon-fade" mode="out-in">
          <span :key="getCurrentThemeIcon()" class="theme-icon">
            {{ getCurrentThemeIcon() }}
          </span>
        </transition>
      </div>
      <div class="ripple-effect" ref="rippleRef"></div>
    </button>

    <!-- 展开的选项面板 -->
    <transition name="panel-slide">
      <div v-if="isExpanded" class="options-panel">
        <div class="panel-header">
          <span class="panel-title">主题设置</span>
        </div>
        
        <div class="theme-options">
          <button
            v-for="option in themeOptions"
            :key="option.value"
            @click="selectTheme(option.value)"
            class="theme-option"
            :class="{ active: currentTheme === option.value }"
            :title="`切换到${option.name}`"
          >
            <span class="option-icon">{{ option.icon }}</span>
            <span class="option-name">{{ option.name }}</span>
            <div v-if="currentTheme === option.value" class="active-indicator">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20,6 9,17 4,12"></polyline>
              </svg>
            </div>
          </button>
        </div>
        
        <div class="panel-footer">
          <span class="current-theme-text">当前: {{ getCurrentThemeName() }}</span>
        </div>
      </div>
    </transition>

    <!-- 背景遮罩 -->
    <div 
      v-if="isExpanded" 
      class="backdrop" 
      @click="closePanel"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useThemeStore } from '@/stores/theme'

// Theme store
const themeStore = useThemeStore()
const { currentTheme, THEMES } = themeStore

// Component state
const isExpanded = ref(false)
const rippleRef = ref(null)

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

// Methods
const toggleExpanded = async () => {
  if (!isExpanded.value) {
    createRippleEffect()
  }
  isExpanded.value = !isExpanded.value
}

const selectTheme = (theme) => {
  themeStore.setTheme(theme)
  // 延迟关闭面板，让用户看到选择效果
  setTimeout(() => {
    isExpanded.value = false
  }, 300)
}

const closePanel = () => {
  isExpanded.value = false
}

const createRippleEffect = async () => {
  if (!rippleRef.value) return
  
  const ripple = rippleRef.value
  ripple.style.animation = 'none'
  
  await nextTick()
  
  ripple.style.animation = 'ripple 0.6s ease-out'
}

// Close panel on escape key
const handleKeydown = (event) => {
  if (event.key === 'Escape' && isExpanded.value) {
    closePanel()
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.floating-theme-toggle {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  font-family: inherit;
}

/* 主切换按钮 */
.main-toggle-btn {
  position: relative;
  width: 56px;
  height: 56px;
  border: none;
  border-radius: 50%;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  box-shadow: 
    0 4px 12px var(--shadow),
    0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--border-primary);
}

.main-toggle-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 
    0 8px 24px var(--shadow),
    0 4px 8px rgba(0, 0, 0, 0.15);
  border-color: var(--accent-1);
}

.main-toggle-btn:active {
  transform: translateY(-1px) scale(1.02);
}

.icon-container {
  position: relative;
  z-index: 2;
}

.theme-icon {
  font-size: 24px;
  line-height: 1;
  display: block;
}

/* 波纹效果 */
.ripple-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: var(--accent-1);
  opacity: 0.3;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

@keyframes ripple {
  0% {
    width: 0;
    height: 0;
    opacity: 0.3;
  }
  50% {
    opacity: 0.1;
  }
  100% {
    width: 120px;
    height: 120px;
    opacity: 0;
  }
}

/* 选项面板 */
.options-panel {
  position: absolute;
  bottom: 72px;
  right: 0;
  min-width: 200px;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  box-shadow: 
    0 8px 32px var(--shadow),
    0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.panel-header {
  padding: 16px 16px 8px;
  border-bottom: 1px solid var(--border-secondary);
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.theme-options {
  padding: 8px 0;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  text-align: left;
  position: relative;
}

.theme-option:hover {
  background: var(--bg-secondary);
  transform: translateX(2px);
}

.theme-option.active {
  background: var(--bg-tertiary);
  color: var(--accent-1);
}

.theme-option.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--accent-1);
}

.option-icon {
  font-size: 18px;
  line-height: 1;
  min-width: 18px;
}

.option-name {
  flex: 1;
  font-weight: 500;
}

.active-indicator {
  color: var(--accent-1);
  opacity: 0.8;
}

.panel-footer {
  padding: 8px 16px 16px;
  border-top: 1px solid var(--border-secondary);
}

.current-theme-text {
  font-size: 12px;
  color: var(--text-tertiary);
  font-weight: 500;
}

/* 背景遮罩 */
.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  z-index: -1;
  backdrop-filter: blur(2px);
}

/* 动画 */
.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: all 0.2s ease;
}

.icon-fade-enter-from,
.icon-fade-leave-to {
  opacity: 0;
  transform: scale(0.8) rotate(180deg);
}

.panel-slide-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.panel-slide-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.6, 1);
}

.panel-slide-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

.panel-slide-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

/* 展开状态 */
.floating-theme-toggle.expanded .main-toggle-btn {
  background: var(--accent-1);
  color: white;
  transform: rotate(45deg);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .floating-theme-toggle {
    bottom: 20px;
    right: 20px;
  }
  
  .main-toggle-btn {
    width: 48px;
    height: 48px;
  }
  
  .theme-icon {
    font-size: 20px;
  }
  
  .options-panel {
    bottom: 64px;
    min-width: 180px;
  }
  
  .theme-option {
    padding: 10px 14px;
  }
}

@media (max-width: 480px) {
  .floating-theme-toggle {
    bottom: 16px;
    right: 16px;
  }
  
  .options-panel {
    right: -20px;
    min-width: 160px;
  }
}

/* 深色模式优化 */
@media (prefers-color-scheme: dark) {
  .main-toggle-btn {
    box-shadow: 
      0 4px 12px rgba(0, 0, 0, 0.3),
      0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  .main-toggle-btn:hover {
    box-shadow: 
      0 8px 24px rgba(0, 0, 0, 0.4),
      0 4px 8px rgba(0, 0, 0, 0.25);
  }
  
  .options-panel {
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.4),
      0 4px 16px rgba(0, 0, 0, 0.2);
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .main-toggle-btn {
    border-width: 3px;
  }
  
  .theme-option.active::before {
    width: 4px;
  }
}

/* 减少动画模式 */
@media (prefers-reduced-motion: reduce) {
  .main-toggle-btn,
  .theme-option,
  .icon-fade-enter-active,
  .icon-fade-leave-active,
  .panel-slide-enter-active,
  .panel-slide-leave-active {
    transition: none;
  }
  
  .ripple-effect {
    display: none;
  }
}
</style>