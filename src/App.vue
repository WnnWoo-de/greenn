<template>
  <WelcomeDialog />
  <div class="themed-app" :class="themeStore.appliedTheme" :style="combinedThemeVars">
    <n-message-provider>
      <n-notification-provider>
        <div class="app-background">
          <LightRays
            rays-origin="top-center"
            :rays-color="raysColor"
            :rays-speed="1.5"
            :light-spread="0.8"
            :ray-length="1.2"
            :follow-mouse="true"
            :mouse-influence="0.1"
            :noise-amount="0.1"
            :distortion="0.05"
            :class-name="'global-rays'"
          />
        </div>
        <Navbar />
        <main class="page">
          <transition name="view" mode="out-in">
            <router-view />
          </transition>
        </main>
        <Footer />
        <Toast />
      </n-notification-provider>
    </n-message-provider>
  </div>
</template>

<script setup>
import WelcomeDialog from '@/components/ui/WelcomeDialog.vue'
import { ref, computed } from 'vue'
import { NMessageProvider, NNotificationProvider } from 'naive-ui'
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
import Toast from '@/components/ui/Toast.vue'
import LightRays from '@/views/LightRays.vue'
import { useThemeStore } from '@/stores/theme'


// 主题系统
const themeStore = useThemeStore()

// 全局光线主题色（与 LightRays 联动）
const raysColor = ref('#ffffff')

// 将十六进制颜色转换为 RGB（0-255）
function hexToRgb255(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!m) return { r: 255, g: 255, b: 255 }
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
}

// 将十六进制颜色按比例与白色混合，实现亮度提升
function lightenHex(hex, amount = 20) {
  const { r, g, b } = hexToRgb255(hex)
  const p = Math.max(0, Math.min(100, amount)) / 100
  const nr = Math.round(r + (255 - r) * p)
  const ng = Math.round(g + (255 - g) * p)
  const nb = Math.round(b + (255 - b) * p)
  const toHex = (v) => v.toString(16).padStart(2, '0')
  return `#${toHex(nr)}${toHex(ng)}${toHex(nb)}`
}

const themeVars = computed(() => {
  const { r, g, b } = hexToRgb255(raysColor.value)
  return {
    '--ray-color': raysColor.value,
    '--ray-accent-1': lightenHex(raysColor.value, 0),
    '--ray-accent-2': lightenHex(raysColor.value, 20),
    '--ray-accent-3': lightenHex(raysColor.value, 40),
    '--ray-shadow': `rgba(${r}, ${g}, ${b}, 0.45)`
  }
})

// 合并主题系统变量和光线变量
const combinedThemeVars = computed(() => {
  const currentThemeConfig = themeStore.getCurrentThemeConfig
  return {
    ...currentThemeConfig,
    ...themeVars.value
  }
})
</script>

<style>
html, body, #app { height: 100%; position: relative; }
.page { padding-top: 60px; position: relative; z-index: 10; }
.themed-app { min-height: 100vh; position: relative; }
.app-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1;
  pointer-events: none;
}
</style>
