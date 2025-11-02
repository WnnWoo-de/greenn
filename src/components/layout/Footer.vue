<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-logo">
          <img src="@/assets/images/logo.svg" alt="绿我同行 GreenSight" />
          <span>GreenSight AI</span>
        </div>
        <div class="footer-links">
          <div class="link-group">
            <h4>关于我们</h4>
            <router-link to="/about" class="link">项目简介</router-link>
            <router-link to="/contact" class="link">联系方式</router-link>
            <router-link to="/join" class="link">加入我们</router-link>
          </div>
          <div class="link-group">
            <h4>AI 服务</h4>
            <router-link to="/ai-recognition" class="link">垃圾识别</router-link>
            <router-link to="/carbon-footprint" class="link">碳足迹分析</router-link>
            <router-link to="/ai-advice" class="link">环保建议</router-link>
          </div>
          <div class="link-group">
            <h4>帮助中心</h4>
            <router-link :to="{ path: '/help', query: { tab: 'guide' } }" class="link">使用指南</router-link>
            <router-link :to="{ path: '/help', query: { tab: 'faq' } }" class="link">常见问题</router-link>
            <router-link :to="{ path: '/help', query: { tab: 'feedback' } }" class="link">意见反馈</router-link>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2025 绿我同行 GreenSight AI</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme'

// 使用主题系统
const themeStore = useThemeStore()
</script>

<style lang="scss" scoped>
.footer {
  background: var(--bg-secondary);
  padding: 48px 0 24px;
  margin-top: 40px;
  border-top: 1px solid var(--border-primary);
  transition: background-color 0.3s ease, border-color 0.3s ease;
  
  // 浅色主题的渐变背景
  &:not([data-theme="dark"]) {
    background: radial-gradient(1200px 600px at 20% 0%, var(--bg-secondary), var(--bg-tertiary));
  }
  
  // 深色主题的渐变背景
  :global([data-theme="dark"]) & {
    background: radial-gradient(1200px 600px at 20% 0%, var(--bg-secondary), var(--bg-tertiary));
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 30px;
}

.footer-logo {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  
  img {
    height: 30px;
    margin-right: 10px;
  }
  
  span {
    font-weight: bold;
    font-size: 1.2rem;
    color: var(--text-primary);
    transition: color 0.3s ease;
  }
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, minmax(160px, 1fr));
  gap: 40px;
}

.link-group {
  h4 {
    font-size: 1rem;
    margin-bottom: 14px;
    color: var(--text-primary);
    position: relative;
    transition: color 0.3s ease;
  }
  h4::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -6px;
    width: 28px;
    height: 3px;
    border-radius: 3px;
    background: linear-gradient(135deg, #6fcf97, #66a6ff);
    opacity: 0.6;
  }
  
  .link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--text-secondary);
    text-decoration: none;
    margin: 6px 0;
    font-size: 0.95rem;
    transition: color .2s ease, transform .2s ease;
    
    &::before {
      content: "▸";
      font-size: 0.9em;
      color: var(--accent-1);
      transform: translateY(-0.5px);
      transition: color 0.3s ease;
    }
    &:hover {
      color: var(--text-primary);
      transform: translateX(2px);
    }
  }
  
  a[href="#"] {
    cursor: default;
    pointer-events: none;
    opacity: 0.7;
  }
  a[href="#"]::after {
    content: "（敬请期待）";
    margin-left: 6px;
    font-size: 0.85em;
    color: var(--text-muted);
    transition: color 0.3s ease;
  }
}

.footer-bottom {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid var(--border-primary);
  transition: border-color 0.3s ease;
  
  p {
    color: var(--text-muted);
    font-size: 0.8rem;
    transition: color 0.3s ease;
  }
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
  }
  .footer-links {
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
}

@media (max-width: 520px) {
  .footer-links {
    grid-template-columns: 1fr;
  }
}
</style>