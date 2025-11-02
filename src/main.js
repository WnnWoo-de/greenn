import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import '@/assets/styles/main.scss'
import '@/assets/styles/tailwind.css'
import reveal from '@/directives/reveal'

// Naive UI
import naive from 'naive-ui'

// Theme system
import { useThemeStore } from '@/stores/theme'

const app = createApp(App)
const pinia = createPinia()

app.directive('reveal', reveal)
app
  .use(router)
  .use(pinia)
  .use(naive)

// Initialize theme system after Pinia is available
app.mount('#app')

// Initialize theme after app is mounted
const themeStore = useThemeStore()
themeStore.initTheme()