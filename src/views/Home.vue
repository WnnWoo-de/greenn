<template>
  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-background">
      <div class="hero-overlay"></div>
    </div>
    <div class="container hero-inner">
      <div class="hero-content">
        <h1 class="brand animate-in delay-1">绿我同行 GreenSight AI</h1>
        <div class="tagline animate-in delay-2">GreenSight · AI for Sustainable Living</div>
        <p class="hero-desc animate-in delay-2">
          <span class="typewriter-text" aria-live="polite">用科技守护家园，全方面AI分析碳足迹绿色生活。</span>
        </p>
        <div class="cta animate-in delay-3">
          <router-link to="/checkin" class="btn btn-primary">
            <span class="btn-icon">✓</span>
            开始使用
          </router-link>
          <router-link to="/about" class="btn btn-outline">
            <span class="btn-icon">ℹ</span>
            了解更多
          </router-link>
        </div>
        <div class="quotes-section animate-in delay-3">
          <div class="quotes-grid">
            <div class="quote-card">“每一次更绿色的选择，都是为地球投下未来的一票。”</div>
            <div class="quote-card">“用数据看见不可见的足迹，用行动改写可见的未来。”</div>
            <div class="quote-card">“绿色不是口号，是 AI 与你共同的日常。”</div>
          </div>
        </div>
        <div v-if="auth.isLoggedIn" class="user-status animate-in delay-4">
          <div class="status-card">
            <div class="status-info">
              <span class="welcome-text">欢迎回来，{{ auth.user?.username }}</span>
              <div class="status-details">
                <span class="points-info">
                  <span class="points-icon">💎</span>
                  当前积分：<strong>{{ auth.points }}</strong>
                </span>
                <span v-if="checkedToday" class="checkin-status">
                  <span class="status-icon">✅</span>
                  今日已打卡
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="hero-visual animate-in delay-2">
        <div class="visual-container">
        </div>
      </div>
    </div>
  </section>


  

  <!-- Gallery Section -->
  <section class="gallery-section">
    <div class="section-container">
      <div class="section-header">
        <div class="header-content">
          <span class="section-badge">🌍 绿色瞬间</span>
          <h2 class="section-title">绿色生活瞬间</h2>
          <p class="section-desc">探索美丽的自然风光，感受绿色生活的魅力</p>
        </div>
      </div>
      <div class="gallery-container">
        <CircularGallery
          :items="galleryItems"
          :bend="3"
          text-color="#ffffff"
          :border-radius="0.05"
          font="bold 24px 'Microsoft YaHei', Arial, sans-serif"
          :scroll-speed="2"
          :scroll-ease="0.05"
        />
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section class="features-section">
    <div class="container">
      <div class="section-header">
        <span class="section-badge">⚡ 核心功能</span>
        <h2 class="section-title">功能一览</h2>
        <p class="section-desc">体验我们的核心环保功能，开启绿色生活之旅</p>
      </div>
      <div class="features-grid">
        <ImageCard class="feature-card reveal"
          img="@/assets/images/logo.svg"
          alt="AI 识别"
          title="AI 智能识别"
          subtitle="精准识别垃圾类型，学习环保知识，让分类更简单。"
          link="/ai-recognition"
          linkText="立即体验"
          :revealOptions="{ duration: 0.6, distance: 20 }"
        />
        <ImageCard class="feature-card reveal"
          img="@/assets/images/logo.svg"
          alt="公益活动"
          title="绿色公益活动"
          subtitle="参与本地环保活动，与志同道合的伙伴一起行动。"
          link="/activity"
          linkText="查看活动"
          :revealOptions="{ duration: 0.6, distance: 20, delay: 0.1 }"
        />
        <ImageCard class="feature-card reveal"
          img="@/assets/images/logo.svg"
          alt="积分商城"
          title="环保积分商城"
          subtitle="用绿色积分兑换精美环保商品，让环保更有价值。"
          link="/store"
          linkText="去兑换"
          :revealOptions="{ duration: 0.6, distance: 20, delay: 0.2 }"
        />
      </div>
    </div>
  </section>

  <!-- Steps Section -->
  <section class="steps-section">
    <div class="container">
      <div class="section-header">
        <span class="section-badge">📋 参与指南</span>
        <h2 class="section-title">如何参与</h2>
        <p class="section-desc">三个简单步骤，开启你的绿色环保之旅</p>
      </div>
      <div class="steps-container">
        <div class="step-item reveal">
          <div class="step-number">01</div>
          <div class="step-content">
            <h3 class="step-title">每日打卡</h3>
            <p class="step-desc">每日打卡签到，积累绿色积分，养成环保习惯。</p>
          </div>
          <div class="step-icon">✓</div>
        </div>
        <div class="step-connector"></div>
        <div class="step-item reveal">
          <div class="step-number">02</div>
          <div class="step-content">
            <h3 class="step-title">参与活动</h3>
            <p class="step-desc">报名环保活动，实践绿色行动，结识环保伙伴。</p>
          </div>
          <div class="step-icon">🎯</div>
        </div>
        <div class="step-connector"></div>
        <div class="step-item reveal">
          <div class="step-number">03</div>
          <div class="step-content">
            <h3 class="step-title">积分兑换</h3>
            <p class="step-desc">用积分兑换环保商品，让环保行动更有意义。</p>
          </div>
          <div class="step-icon">🎁</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Latest Activities Section -->
  <section class="activities-section">
    <div class="container">
      <div class="section-header">
        <div class="header-content">
          <span class="section-badge">🔥 热门活动</span>
          <h2 class="section-title">最新活动</h2>
          <p class="section-desc">参与最新的环保活动，与社区一起行动</p>
        </div>
        <router-link to="/activity" class="section-link">
          查看全部
          <span class="link-arrow">→</span>
        </router-link>
      </div>
      <div class="activities-grid">
        <ImageCard
          v-for="(a, index) in latestActivities"
          :key="a.id"
          class="activity-card reveal"
          img="@/assets/images/logo.svg"
          :alt="a.title"
          :title="a.title"
          :subtitle="'📅 ' + a.date"
          :meta="'📍 ' + a.location"
          link="/activity"
          linkText="立即报名"
          :revealOptions="{ duration: 0.6, distance: 20, delay: index * 0.1 }"
        />
      </div>
    </div>
  </section>

  <!-- Popular Products Section -->
  <section class="products-section">
    <div class="container">
      <div class="section-header">
        <div class="header-content">
          <span class="section-badge">🎁 人气商品</span>
          <h2 class="section-title">人气兑换</h2>
          <p class="section-desc">精选环保好物，用积分兑换心仪商品</p>
        </div>
        <router-link to="/store" class="section-link">
          去商城
          <span class="link-arrow">→</span>
        </router-link>
      </div>
      <div class="products-grid">
        <ImageCard
          v-for="(p, index) in popularProducts"
          :key="p.id"
          class="product-card reveal"
          img="@/assets/images/logo.svg"
          :alt="p.name"
          :title="p.name"
          :subtitle="p.desc || '精选环保商品'"
          :meta="'💎 ' + p.price + ' 积分'"
          link="/store"
          linkText="立即兑换"
          :revealOptions="{ duration: 0.6, distance: 20, delay: index * 0.1 }"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCheckinStore } from '@/stores/checkin'
import { useActivityStore } from '@/stores/activity'
import { useShopStore } from '@/stores/shop'
import ImageCard from '@/components/ui/ImageCard.vue'
import TextType from '@/components/ui/TextType.vue'
import CircularGallery from '@/CircularGallery.vue'

const auth = useAuthStore()
const checkin = useCheckinStore()
const activity = useActivityStore()
const shop = useShopStore()
const username = computed(() => auth.user?.username ?? '')
const checkedToday = computed(() => checkin.isChecked(username.value))

// 轮播图数据 - 环保主题
const galleryItems = [
  { image: 'https://picsum.photos/800/600?random=1', text: '绿色森林' },
  { image: 'https://picsum.photos/800/600?random=2', text: '清洁能源' },
  { image: 'https://picsum.photos/800/600?random=3', text: '蓝天白云' },
  { image: 'https://picsum.photos/800/600?random=4', text: '垃圾分类' },
  { image: 'https://picsum.photos/800/600?random=5', text: '绿色出行' },
  { image: 'https://picsum.photos/800/600?random=6', text: '节能减排' },
  { image: 'https://picsum.photos/800/600?random=7', text: '生态保护' },
  { image: 'https://picsum.photos/800/600?random=8', text: '可持续性' },
  { image: 'https://picsum.photos/800/600?random=9', text: '环保生活' },
  { image: 'https://picsum.photos/800/600?random=10', text: '绿色家园' }
]

let io
onMounted(() => {
  try {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible')
          io?.unobserve(e.target)
        }
      })
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' })

    const els = Array.from(document.querySelectorAll('.reveal'))
    els.forEach((el, i) => {
      const delay = Math.min(i * 0.08, 0.24)
      el.style.transitionDelay = `${delay}s`
      io.observe(el)
    })
  } catch {}
})

onBeforeUnmount(() => { if (io) io.disconnect() })

function parseDate(str) {
  const [y, m, d] = (str || '').split('-').map(n => parseInt(n, 10))
  return new Date(y, (m || 1) - 1, d || 1)
}

const latestActivities = computed(() => {
  const today = new Date()
  const items = activity.activities.slice().sort((a, b) => parseDate(a.date) - parseDate(b.date))
  const upcoming = items.filter(a => parseDate(a.date) >= today)
  return (upcoming.length ? upcoming : items).slice(0, 3)
})

const popularProducts = computed(() => {
  const counts = new Map()
  const data = shop.redemptionsByUser || {}
  for (const k of Object.keys(data)) {
    (data[k] || []).forEach(id => counts.set(id, (counts.get(id) || 0) + 1))
  }
  const sorted = shop.products.slice().sort((a, b) => (counts.get(b.id) || 0) - (counts.get(a.id) || 0))
  return (sorted.length ? sorted : shop.products).slice(0, 3)
})
</script>

<style scoped>
/* ===== Hero Section ===== */
.hero {
  background: transparent;
  color: #fff;
  position: relative;
  overflow: visible;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 0;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(76, 175, 80, 0.15) 0%, 
    rgba(102, 166, 255, 0.12) 25%, 
    rgba(76, 175, 80, 0.18) 50%, 
    rgba(33, 150, 243, 0.15) 75%, 
    rgba(76, 175, 80, 0.2) 100%);
  backdrop-filter: blur(2px);
}

.hero-overlay::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 20%, rgba(76, 175, 80, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(33, 150, 243, 0.25) 0%, transparent 50%),
              radial-gradient(circle at 20% 80%, rgba(156, 39, 176, 0.15) 0%, transparent 50%);
  animation: gradientShift 15s ease-in-out infinite;
}

.hero-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120px 0;
  gap: 80px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding-left: 40px;
  padding-right: 40px;
}

.hero-content {
  flex: 1;
  max-width: 760px;
  text-align: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  backdrop-filter: blur(10px);
  margin-bottom: 24px;
  font-size: 0.9rem;
  font-weight: 500;
}

.badge-icon {
  font-size: 1.1rem;
}

.badge-text {
  color: rgba(255, 255, 255, 0.95);
}

.brand {
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 24px;
  letter-spacing: -0.02em;
  line-height: 1.1;
  background: linear-gradient(135deg, #ffffff 0%, #e8f5e8 50%, #f0f8ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
  text-align: center;
}

.typewriter-container {
  min-height: 40px;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
}

.typewriter-text {
  font-size: 1.25rem;
  opacity: 0.95;
  font-weight: 400;
  text-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* 示例化标语与描述 */
.tagline {
  color: #4caf50;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.02em;
  margin-bottom: 8px;
}

.hero-desc {
  font-size: 1.05rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.8;
  max-width: 820px;
  margin: 12px auto 24px;
}
/* 打字机效果（包裹在段落内部的 span 上，避免与进入动画冲突）*/
.hero-desc .typewriter-text {
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid var(--accent-1, #22c55e);
  animation: typing 4.8s steps(30, end) infinite, blink-caret .8s step-end infinite;
  font-size: inherit;
  font-weight: inherit;
  width: 0;
}
@keyframes typing {
  0% { width: 0 }
  30% { width: 100% }
  50% { width: 100% } /* 停顿阶段 */
  80% { width: 0 } /* 逐字退回删除 */
  100% { width: 0 } /* 等待下一次循环 */
}
@keyframes blink-caret {
  from, to { border-color: transparent }
  50% { border-color: #22c55e }
}

/* 引言卡片区域 */
.quotes-section {
  margin: 40px 0 60px;
}

.quotes-grid {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.quote-card {
  flex: 1 1 300px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 12px;
  padding: 16px 20px;
  color: rgba(255, 255, 255, 0.92);
  box-shadow: 0 8px 20px rgba(0,0,0,0.12);
}

.cta {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  flex-wrap: wrap;
  justify-content: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  border-radius: 12px;
  background: rgba(255,255,255,0.15);
  color: #fff;
  text-decoration: none;
  border: 1px solid rgba(255,255,255,0.25);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 0.95rem;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.15);
  background: rgba(255,255,255,0.2);
}

.btn:active {
  transform: translateY(0);
}

.btn-primary {
  background: linear-gradient(135deg, #66a6ff 0%, #5b9af0 100%);
  border-color: rgba(255,255,255,0.3);
  box-shadow: 0 4px 16px rgba(102, 166, 255, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #5b9af0 0%, #4a8de8 100%);
  box-shadow: 0 8px 24px rgba(102, 166, 255, 0.4);
}

.btn-secondary {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  border-color: rgba(255,255,255,0.3);
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.3);
}

.btn-secondary:hover {
  background: linear-gradient(135deg, #45a049 0%, #3d8b40 100%);
  box-shadow: 0 8px 24px rgba(76, 175, 80, 0.4);
}

.btn-outline {
  background: rgba(255,255,255,0.1);
  border-color: rgba(255,255,255,0.4);
}

.btn-outline:hover {
  background: rgba(255,255,255,0.2);
  border-color: rgba(255,255,255,0.6);
}

.btn-icon {
  font-size: 1rem;
}

.user-status {
  margin-top: 24px;
}

.status-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px);
}

.welcome-text {
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #fff;
}

.status-details {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.points-info, .checkin-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
}

.points-icon, .status-icon {
  font-size: 1rem;
}

.hero-visual {
  display: none;
}

.visual-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.brand-display {
  position: relative;
  z-index: 2;
  text-align: center;
  animation: float 6s ease-in-out infinite;
}

.brand-text-main {
  font-size: 4rem;
  font-weight: 900;
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 30%, #81c784 60%, #a5d6a7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
  margin-bottom: 12px;
  letter-spacing: 0.05em;
  line-height: 1;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.brand-text-sub {
  font-size: 2rem;
  font-weight: 600;
  background: linear-gradient(135deg, #2196f3 0%, #42a5f5 30%, #64b5f6 60%, #90caf9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(33, 150, 243, 0.3);
  letter-spacing: 0.1em;
  line-height: 1;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
}

/* 打字机效果样式 */
.typewriter-brand-main {
  font-size: 3.2rem !important;
  font-weight: 900 !important;
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 30%, #81c784 60%, #a5d6a7 100%) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
  text-shadow: 0 4px 8px rgba(76, 175, 80, 0.3) !important;
  letter-spacing: 0.05em !important;
  line-height: 1.1 !important;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)) !important;
  display: inline-block !important;
}

.typewriter-brand-sub {
  font-size: 1.6rem !important;
  font-weight: 600 !important;
  background: linear-gradient(135deg, #2196f3 0%, #42a5f5 30%, #64b5f6 60%, #90caf9 100%) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
  text-shadow: 0 2px 4px rgba(33, 150, 243, 0.3) !important;
  letter-spacing: 0.08em !important;
  line-height: 1.3 !important;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1)) !important;
  display: inline-block !important;
  margin-top: 8px !important;
}

/* 打字机光标样式 */
.typewriter-brand-main .cursor,
.typewriter-brand-sub .cursor {
  animation: blink 1s infinite;
  color: #4caf50;
  font-weight: normal;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* ===== Section Styles ===== */
.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-header.flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
}

.header-content {
  flex: 1;
}

.section-badge {
  display: inline-block;
  padding: 8px 16px;
  background: rgba(102, 166, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(102, 166, 255, 0.3);
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 16px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 16px;
  color: #fff;
  letter-spacing: -0.02em;
}

.section-desc {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.6;
}

.section-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #66a6ff;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.section-link:hover {
  color: #5b9af0;
  transform: translateX(4px);
}

.link-arrow {
  transition: transform 0.3s ease;
}

.section-link:hover .link-arrow {
  transform: translateX(4px);
}

/* ===== Gallery Section ===== */
.gallery-section {
  margin: 100px 0;
  padding: 60px 0;
}

.gallery-container {
  height: 500px;
  width: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* ===== Features Section ===== */
.features-section {
  margin: 100px 0;
  padding: 60px 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 32px;
}

.feature-card {
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
}

/* ===== Steps Section ===== */
.steps-section {
  margin: 100px 0;
  padding: 60px 0;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.steps-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  max-width: 900px;
  margin: 0 auto;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
  padding: 32px 20px;
  position: relative;
}

.step-number {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #66a6ff 0%, #5b9af0 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 20px;
  box-shadow: 0 8px 24px rgba(102, 166, 255, 0.3);
}

.step-content {
  margin-bottom: 16px;
}

.step-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 8px;
}

.step-desc {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.5;
}

.step-icon {
  font-size: 1.5rem;
  opacity: 0.8;
}

.step-connector {
  width: 80px;
  height: 2px;
  background: linear-gradient(90deg, rgba(102, 166, 255, 0.3) 0%, rgba(102, 166, 255, 0.6) 50%, rgba(102, 166, 255, 0.3) 100%);
  margin: 0 -40px;
  z-index: 1;
  position: relative;
  top: -60px;
}

/* ===== Activities & Products Sections ===== */
.activities-section,
.products-section {
  margin: 100px 0;
  padding: 60px 0;
}

.activities-section .section-header,
.products-section .section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  text-align: left;
  margin-bottom: 48px;
}

.activities-grid,
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;
}

.activity-card,
.product-card {
  transition: transform 0.3s ease;
}

.activity-card:hover,
.product-card:hover {
  transform: translateY(-8px);
}

/* ===== Animations ===== */
.animate-in {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.8s ease forwards;
}

.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }
.delay-3 { animation-delay: 0.3s; }
.delay-4 { animation-delay: 0.4s; }

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}

@keyframes gradientShift {
  0%, 100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
  25% {
    opacity: 0.8;
    transform: scale(1.1) rotate(90deg);
  }
  50% {
    opacity: 0.9;
    transform: scale(0.9) rotate(180deg);
  }
  75% {
    opacity: 0.7;
    transform: scale(1.05) rotate(270deg);
  }
}

.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* ===== ImageCard Overrides ===== */
:deep(.image-card) {
  background: rgba(255, 255, 255, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

:deep(.image-card:hover) {
  background: rgba(255, 255, 255, 0.12) !important;
  border-color: rgba(255, 255, 255, 0.25);
  box-shadow: 0 12px 32px rgba(0,0,0,0.15);
}

:deep(.image-card .media) {
  background: rgba(255, 255, 255, 0.05) !important;
  border-radius: 12px;
}

:deep(.image-card .title) {
  color: #fff;
  font-weight: 600;
}

:deep(.image-card .subtitle),
:deep(.image-card .meta) {
  color: rgba(255, 255, 255, 0.8);
}

:deep(.image-card .card-link) {
  color: #66a6ff;
  border-color: rgba(102, 166, 255, 0.3);
  background: rgba(102, 166, 255, 0.1);
  transition: all 0.3s ease;
}

:deep(.image-card .card-link:hover) {
  background: rgba(102, 166, 255, 0.2);
  border-color: rgba(102, 166, 255, 0.5);
  color: #5b9af0;
}

/* ===== Responsive Design ===== */
@media (max-width: 1200px) {
  .hero-inner {
    max-width: 1000px;
    padding-left: 30px;
    padding-right: 30px;
    gap: 60px;
  }
  
  .hero-content {
    max-width: 600px;
  }
}

@media (max-width: 1024px) {
  .hero-inner {
    gap: 40px;
  }
  
  .brand {
    font-size: 2.5rem;
    text-align: center;
  }
  
  .section-title {
    font-size: 2.2rem;
  }
  
  .features-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .hero {
    min-height: 90vh;
  }
  
  .hero-inner {
    flex-direction: column;
    gap: 40px;
    text-align: center;
    padding: 60px 20px;
  }
  
  .hero-content {
    max-width: 100%;
  }
  
  .brand {
    font-size: 2.2rem;
    text-align: center;
  }
  
  .typewriter-text {
    font-size: 1.1rem;
  }
  
  .cta {
    justify-content: center;
  }
  
  .brand-text-main {
    font-size: 2.5rem;
  }
  
  .brand-text-sub {
    font-size: 1.3rem;
  }
  
  /* 打字机效果响应式样式 */
  .typewriter-brand-main {
    font-size: 2.5rem !important;
    line-height: 1.2 !important;
  }
  
  .typewriter-brand-sub {
    font-size: 1.3rem !important;
    line-height: 1.4 !important;
    letter-spacing: 0.06em !important;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .section-desc {
    font-size: 1rem;
  }
  
  .features-grid,
  .activities-grid,
  .products-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .steps-container {
    flex-direction: column;
    gap: 32px;
  }
  
  .step-connector {
    width: 2px;
    height: 60px;
    margin: -16px 0;
    background: linear-gradient(180deg, rgba(102, 166, 255, 0.3) 0%, rgba(102, 166, 255, 0.6) 50%, rgba(102, 166, 255, 0.3) 100%);
    top: 0;
  }
  
  .activities-section .section-header,
  .products-section .section-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .gallery-container {
    height: 400px;
  }
}

@media (max-width: 480px) {
  .hero {
    min-height: 100vh;
  }
  
  .hero-inner {
    padding: 40px 15px;
  }
  
  .brand {
    font-size: 1.8rem;
    text-align: center;
  }
  
  .brand-text-main {
    font-size: 2.2rem;
  }
  
  .brand-text-sub {
    font-size: 1.1rem;
  }
  
  /* 打字机效果小屏幕样式 */
  .typewriter-brand-main {
    font-size: 2.2rem !important;
    line-height: 1.3 !important;
    letter-spacing: 0.03em !important;
  }
  
  .typewriter-brand-sub {
    font-size: 1.1rem !important;
    line-height: 1.5 !important;
    letter-spacing: 0.04em !important;
    margin-top: 12px !important;
  }
  
  .typewriter-text {
    font-size: 1rem;
  }
  
  .btn {
    padding: 12px 20px;
    font-size: 0.9rem;
  }
  
  .cta {
    gap: 12px;
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 200px;
    justify-content: center;
  }
  
  .section-title {
    font-size: 1.8rem;
  }
  
  .step-number {
    width: 50px;
    height: 50px;
    font-size: 1rem;
  }
  
  .step-title {
    font-size: 1.1rem;
  }
  
  .step-desc {
    font-size: 0.9rem;
  }
  
  .gallery-container {
    height: 300px;
  }
  
  .status-details {
    flex-direction: column;
    gap: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .reveal {
    transition: none !important;
    opacity: 1;
    transform: none;
  }
  
  .animate-in {
    animation: none !important;
    opacity: 1;
    transform: none;
  }
  
  * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
</style>

@media (prefers-reduced-motion: reduce) {
  .hero-desc .typewriter-text {
    animation: none;
    border-right: none;
  }
}