<template>
  <section class="container">
    <div class="section-header">
      <h2>旧物新生</h2>
      <p class="muted">让废弃物品重获新生，践行可持续生活理念。</p>
    </div>

    <!-- 环保统计概览 -->
    <div class="summary card">
      <div class="sum-item">
        <span class="label">已转换物品</span>
        <span class="value">{{ totalConverted }}</span>
      </div>
      <div class="sum-item">
        <span class="label">减少碳排放</span>
        <span class="value">{{ carbonSaved }}kg</span>
      </div>
      <div class="sum-item">
        <span class="label">参与用户</span>
        <span class="value">{{ participantCount }}</span>
      </div>
      <div class="sum-item">
        <span class="label">本月新增</span>
        <span class="value">{{ monthlyNew }}</span>
      </div>
    </div>

    <!-- 分类标签 -->
    <div class="tabs">
      <button
        v-for="category in categories"
        :key="category.key"
        class="tab"
        :class="{ active: activeCategory === category.key }"
        @click="activeCategory = category.key"
      >{{ category.label }}</button>
    </div>

    <!-- 控制面板 -->
    <div class="controls">
      <div class="chart-type">
        <button class="pill" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'">网格视图</button>
        <button class="pill" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">列表视图</button>
      </div>
      <div class="filters">
        <input class="input" type="text" v-model="searchText" placeholder="搜索转换案例…" />
        <select class="select" v-model="sortBy">
          <option value="date">按时间排序</option>
          <option value="popularity">按热度排序</option>
          <option value="difficulty">按难度排序</option>
        </select>
        <select class="select" v-model="difficultyFilter">
          <option value="all">所有难度</option>
          <option value="easy">简单</option>
          <option value="medium">中等</option>
          <option value="hard">困难</option>
        </select>
      </div>
      <div class="export">
        <button class="pill" @click="shareCase">分享案例</button>
        <button class="pill" @click="downloadGuide">下载指南</button>
        <button class="pill" @click="submitCase">提交案例</button>
      </div>
    </div>

    <!-- 环保理念说明 -->
    <div class="card" v-reveal>
      <h3 class="name">旧物新生理念</h3>
      <p class="muted">通过创意改造，让废弃物品重获新生，减少浪费，保护环境。</p>
      <p class="muted">每一次转换都是对地球的贡献，让我们一起创造更美好的未来。</p>
      <p class="muted">想要参与？<router-link to="/community">加入社区</router-link>分享你的创意改造案例。</p>
    </div>

    <div class="layout">
      <div class="left">
        <!-- 热门转换案例 Top 3 -->
        <div class="featured-cases" v-if="topCases.length">
          <h3 class="section-title">🌟 热门转换案例</h3>
          <div class="podium">
            <article v-for="(item, i) in topCases" :key="item.id" class="card case-item featured" :class="'rank-' + (i + 1)" v-reveal>
              <div class="case-image">
                <img :src="item.beforeImage" :alt="item.title" class="before-img" />
                <div class="arrow">→</div>
                <img :src="item.afterImage" :alt="item.title" class="after-img" />
              </div>
              <div class="case-info">
                <h4 class="case-title">{{ item.title }}</h4>
                <p class="case-desc">{{ item.description }}</p>
                <div class="case-meta">
                  <span class="difficulty" :class="item.difficulty">{{ getDifficultyText(item.difficulty) }}</span>
                  <span class="likes">❤️ {{ item.likes }}</span>
                  <span class="category">{{ getCategoryLabel(item.category) }}</span>
                </div>
              </div>
            </article>
          </div>
        </div>

        <!-- 转换案例列表 -->
        <div class="cases-list">
          <h3 class="section-title">💡 转换案例</h3>
          <div :class="['cases-grid', viewMode]">
            <article v-for="item in filteredCases" :key="item.id" class="card case-item" v-reveal>
              <div class="case-image">
                <img :src="item.beforeImage" :alt="item.title" class="before-img" />
                <div class="arrow">→</div>
                <img :src="item.afterImage" :alt="item.title" class="after-img" />
              </div>
              <div class="case-info">
                <h4 class="case-title">{{ item.title }}</h4>
                <p class="case-desc">{{ item.description }}</p>
                <div class="case-meta">
                  <span class="difficulty" :class="item.difficulty">{{ getDifficultyText(item.difficulty) }}</span>
                  <span class="likes">❤️ {{ item.likes }}</span>
                  <span class="time">{{ formatDate(item.date) }}</span>
                </div>
                <div class="case-actions">
                  <button class="action-btn" @click="viewDetails(item)">查看详情</button>
                  <button class="action-btn" @click="likeCase(item)">点赞</button>
                </div>
              </div>
            </article>
          </div>
          <p v-if="!filteredCases.length" class="muted empty">暂无相关案例，<a href="#" @click="submitCase">提交你的创意</a>吧～</p>
        </div>
      </div>

      <!-- 环保数据图表 -->
      <div class="chart-section" v-reveal>
        <div class="chart-header">
          <h3>环保数据统计</h3>
          <div class="chart-controls">
            <button class="chart-btn" :class="{ active: chartType === 'bar' }" @click="chartType = 'bar'">柱状图</button>
            <button class="chart-btn" :class="{ active: chartType === 'doughnut' }" @click="chartType = 'doughnut'">饼图</button>
          </div>
        </div>
        <div class="chart-wrapper">
          <canvas ref="chartRef"></canvas>
        </div>
        
        <!-- 环保成就 -->
        <div class="eco-achievements">
          <h4>环保成就</h4>
          <div class="achievement-list">
            <div v-for="achievement in ecoAchievements" :key="achievement.id" class="achievement-item">
              <span class="achievement-icon">{{ achievement.icon }}</span>
              <div class="achievement-info">
                <div class="achievement-name">{{ achievement.name }}</div>
                <div class="achievement-desc">{{ achievement.description }}</div>
              </div>
              <div class="achievement-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: achievement.progress + '%' }"></div>
                </div>
                <span class="progress-text">{{ achievement.progress }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 行动号召 -->
    <div class="cta-section">
      <h3>🌱 开始你的旧物新生之旅</h3>
      <p>每一次创意改造都是对环境的贡献，让我们一起创造更可持续的未来！</p>
      <div class="cta-buttons">
        <router-link to="/community" class="cta-btn primary">加入社区</router-link>
        <button class="cta-btn secondary" @click="submitCase">提交案例</button>
        <button class="cta-btn secondary" @click="downloadGuide">下载指南</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import { useNotifyStore } from '@/stores/notify'

const notify = useNotifyStore()

// 分类数据
const categories = [
  { key: 'all', label: '全部' },
  { key: 'electronics', label: '电子产品' },
  { key: 'furniture', label: '家具' },
  { key: 'clothing', label: '衣物' },
  { key: 'books', label: '书籍' },
  { key: 'containers', label: '容器' },
  { key: 'decoration', label: '装饰品' },
]

const activeCategory = ref('all')
const viewMode = ref('grid')
const searchText = ref('')
const sortBy = ref('date')
const difficultyFilter = ref('all')
const chartType = ref('bar')

// 模拟数据
const upcyclingCases = ref([
  {
    id: 1,
    title: '废旧手机变身智能相框',
    description: '将淘汰的安卓手机改造成数字相框，循环播放家庭照片',
    category: 'electronics',
    difficulty: 'medium',
    likes: 156,
    date: '2024-01-15',
    beforeImage: '/api/placeholder/200/150',
    afterImage: '/api/placeholder/200/150',
    carbonSaved: 2.5,
    materials: ['废旧手机', '相框', '充电线'],
    steps: 5
  },
  {
    id: 2,
    title: '旧牛仔裤改造收纳袋',
    description: '将不穿的牛仔裤改造成实用的收纳袋，环保又实用',
    category: 'clothing',
    difficulty: 'easy',
    likes: 203,
    date: '2024-01-20',
    beforeImage: '/api/placeholder/200/150',
    afterImage: '/api/placeholder/200/150',
    carbonSaved: 1.2,
    materials: ['旧牛仔裤', '拉链', '针线'],
    steps: 3
  },
  {
    id: 3,
    title: '废纸箱制作书架',
    description: '用快递纸箱制作简易书架，成本低廉效果好',
    category: 'containers',
    difficulty: 'easy',
    likes: 89,
    date: '2024-01-25',
    beforeImage: '/api/placeholder/200/150',
    afterImage: '/api/placeholder/200/150',
    carbonSaved: 0.8,
    materials: ['纸箱', '胶带', '美工刀'],
    steps: 4
  },
  {
    id: 4,
    title: '旧椅子翻新改造',
    description: '给破旧的椅子重新刷漆和换面料，焕然一新',
    category: 'furniture',
    difficulty: 'hard',
    likes: 134,
    date: '2024-02-01',
    beforeImage: '/api/placeholder/200/150',
    afterImage: '/api/placeholder/200/150',
    carbonSaved: 15.6,
    materials: ['旧椅子', '油漆', '布料', '海绵'],
    steps: 8
  },
  {
    id: 5,
    title: '废书制作艺术装饰',
    description: '将损坏的书籍改造成立体艺术装饰品',
    category: 'books',
    difficulty: 'medium',
    likes: 67,
    date: '2024-02-05',
    beforeImage: '/api/placeholder/200/150',
    afterImage: '/api/placeholder/200/150',
    carbonSaved: 0.5,
    materials: ['废旧书籍', '胶水', '颜料'],
    steps: 6
  },
  {
    id: 6,
    title: '塑料瓶变身花盆',
    description: '将饮料瓶改造成可爱的小花盆，种植多肉植物',
    category: 'containers',
    difficulty: 'easy',
    likes: 178,
    date: '2024-02-10',
    beforeImage: '/api/placeholder/200/150',
    afterImage: '/api/placeholder/200/150',
    carbonSaved: 0.3,
    materials: ['塑料瓶', '颜料', '排水石'],
    steps: 3
  }
])

// 环保成就数据
const ecoAchievements = ref([
  {
    id: 1,
    name: '环保新手',
    description: '完成第一个转换案例',
    icon: '🌱',
    progress: 100
  },
  {
    id: 2,
    name: '创意达人',
    description: '提交10个转换案例',
    icon: '💡',
    progress: 60
  },
  {
    id: 3,
    name: '碳减排专家',
    description: '累计减少100kg碳排放',
    icon: '🌍',
    progress: 75
  },
  {
    id: 4,
    name: '社区贡献者',
    description: '获得500个点赞',
    icon: '⭐',
    progress: 40
  }
])

// 计算属性
const totalConverted = computed(() => upcyclingCases.value.length * 12)
const carbonSaved = computed(() => 
  upcyclingCases.value.reduce((sum, item) => sum + item.carbonSaved, 0) * 10
)
const participantCount = computed(() => 1247)
const monthlyNew = computed(() => 23)

const filteredCases = computed(() => {
  let cases = upcyclingCases.value

  // 分类筛选
  if (activeCategory.value !== 'all') {
    cases = cases.filter(item => item.category === activeCategory.value)
  }

  // 难度筛选
  if (difficultyFilter.value !== 'all') {
    cases = cases.filter(item => item.difficulty === difficultyFilter.value)
  }

  // 搜索筛选
  if (searchText.value.trim()) {
    const search = searchText.value.toLowerCase()
    cases = cases.filter(item => 
      item.title.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search)
    )
  }

  // 排序
  cases.sort((a, b) => {
    switch (sortBy.value) {
      case 'popularity':
        return b.likes - a.likes
      case 'difficulty':
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 }
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
      case 'date':
      default:
        return new Date(b.date) - new Date(a.date)
    }
  })

  return cases
})

const topCases = computed(() => 
  [...upcyclingCases.value]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 3)
)

// 工具函数
function getDifficultyText(difficulty) {
  const map = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return map[difficulty] || difficulty
}

function getCategoryLabel(key) {
  const category = categories.find(c => c.key === key)
  return category ? category.label : key
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 交互函数
function viewDetails(item) {
  notify.info(`查看案例：${item.title}`)
}

function likeCase(item) {
  item.likes++
  notify.success('点赞成功！')
}

function shareCase() {
  notify.success('案例分享链接已复制到剪贴板')
}

function downloadGuide() {
  notify.success('旧物改造指南下载中...')
}

function submitCase() {
  notify.info('跳转到案例提交页面')
}

// 图表相关
let Chart
let chartInst
const chartRef = ref(null)

async function ensureChart() {
  if (!Chart) {
    const mod = await import('chart.js/auto')
    Chart = mod.default || mod
  }
}

function renderChart() {
  if (!chartRef.value) return
  
  const categoryData = categories.slice(1).map(cat => ({
    label: cat.label,
    value: upcyclingCases.value.filter(item => item.category === cat.key).length
  }))

  const labels = categoryData.map(item => item.label)
  const data = categoryData.map(item => item.value)
  const colors = ['#66a6ff', '#6fcf97', '#f9a825', '#ab47bc', '#26c6da', '#ef5350']

  if (chartInst) {
    chartInst.destroy()
    chartInst = null
  }

  const ctx = chartRef.value.getContext('2d')
  chartInst = new Chart(ctx, {
    type: chartType.value,
    data: {
      labels,
      datasets: [{
        label: '转换案例数量',
        data,
        backgroundColor: colors.slice(0, data.length)
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: chartType.value === 'doughnut',
          position: 'bottom'
        }
      },
      ...(chartType.value === 'bar' ? {
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 }
          }
        }
      } : {})
    }
  })
}

onMounted(async () => {
  await ensureChart()
  await nextTick()
  renderChart()
})

watch([chartType], async () => {
  await nextTick()
  renderChart()
})
</script>

<style scoped>
.container { max-width: 1200px; margin: 80px auto 40px; padding: 0 20px; }
.section-header { text-align: center; margin-bottom: 30px; }
.section-header h2 { font-size: 2rem; margin: 0 0 10px; color: #2e7d32; }
.muted { color: #666; }

.summary { 
  display: grid; 
  grid-template-columns: repeat(4, 1fr); 
  gap: 15px; 
  padding: 20px; 
  border: 1px solid rgba(46, 125, 50, 0.2); 
  border-radius: 12px; 
  margin: 20px 0; 
  background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%); 
  transition: transform 0.2s ease, box-shadow 0.2s ease; 
}
.summary:hover { 
  transform: translateY(-2px); 
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.15); 
}
.sum-item { text-align: center; }
.sum-item .label { color: #666; font-size: 0.9rem; display: block; margin-bottom: 5px; }
.sum-item .value { font-weight: 600; font-size: 1.2rem; color: #2e7d32; }

.tabs { 
  display: flex; 
  gap: 8px; 
  margin: 20px 0; 
  flex-wrap: wrap; 
  justify-content: center;
}
.tab { 
  padding: 10px 16px; 
  border-radius: 20px; 
  border: 1px solid rgba(46, 125, 50, 0.3); 
  background: transparent; 
  cursor: pointer; 
  transition: all 0.2s ease; 
  font-size: 0.9rem;
}
.tab:hover:not(.active) { 
  transform: translateY(-1px); 
  border-color: #2e7d32; 
  background: rgba(46, 125, 50, 0.05);
}
.tab.active { 
  background: #2e7d32; 
  color: #fff; 
  border-color: #2e7d32; 
}

.controls { 
  display: grid; 
  grid-template-columns: auto 1fr auto; 
  gap: 15px; 
  align-items: center; 
  margin: 20px 0; 
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}
.chart-type, .filters, .export { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.pill { 
  padding: 6px 12px; 
  border: 1px solid #ddd; 
  border-radius: 16px; 
  background: white; 
  cursor: pointer; 
  font-size: 0.85rem; 
  transition: all 0.2s ease; 
}
.pill:hover:not(.active) { 
  transform: translateY(-1px); 
  border-color: #2e7d32; 
}
.pill.active { 
  background: #2e7d32; 
  color: white; 
  border-color: #2e7d32; 
}
.input, .select { 
  padding: 6px 10px; 
  border: 1px solid #ddd; 
  border-radius: 6px; 
  font-size: 0.9rem; 
}

.layout { 
  display: grid; 
  grid-template-columns: 1fr 350px; 
  gap: 30px; 
  align-items: start; 
}

.section-title {
  font-size: 1.3rem;
  margin: 0 0 20px 0;
  color: #2e7d32;
  font-weight: 600;
}

.podium { 
  display: grid; 
  gap: 15px; 
  margin-bottom: 30px;
}

.cases-grid.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.cases-grid.list {
  display: grid;
  gap: 15px;
}

.case-item { 
  border: 1px solid rgba(238, 238, 238, 0.8); 
  border-radius: 12px; 
  padding: 15px; 
  background: white; 
  transition: all 0.2s ease; 
  overflow: hidden;
}
.case-item:hover { 
  transform: translateY(-3px); 
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1); 
  border-color: #2e7d32; 
}

.case-item.featured {
  border-color: #f9a825;
  background: linear-gradient(135deg, #fff8e1 0%, #fffde7 100%);
}

.case-item.featured.rank-1 {
  border-color: #ffd700;
  background: linear-gradient(135deg, #fff9c4 0%, #fff59d 100%);
}

.case-image {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  justify-content: center;
}

.before-img, .after-img {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  border: 2px solid #e0e0e0;
}

.arrow {
  font-size: 1.2rem;
  color: #2e7d32;
  font-weight: bold;
}

.case-title {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  color: #333;
  font-weight: 600;
}

.case-desc {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
}

.case-meta {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.difficulty {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 500;
}

.difficulty.easy { background: #c8e6c9; color: #2e7d32; }
.difficulty.medium { background: #fff3e0; color: #f57c00; }
.difficulty.hard { background: #ffcdd2; color: #d32f2f; }

.likes, .time, .category {
  font-size: 0.8rem;
  color: #666;
}

.case-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  border: 1px solid #2e7d32;
  background: transparent;
  color: #2e7d32;
  border-radius: 16px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #2e7d32;
  color: white;
}

.chart-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.2rem;
}

.chart-controls {
  display: flex;
  gap: 5px;
}

.chart-btn {
  padding: 5px 10px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.chart-btn.active {
  background: #2e7d32;
  color: white;
  border-color: #2e7d32;
}

.chart-wrapper {
  position: relative;
  height: 250px;
  margin-bottom: 20px;
}

.eco-achievements h4 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1.1rem;
}

.achievement-list {
  display: grid;
  gap: 12px;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
}

.achievement-icon {
  font-size: 1.5rem;
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
}

.achievement-desc {
  font-size: 0.8rem;
  color: #666;
  margin-top: 2px;
}

.achievement-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  width: 60px;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #2e7d32;
  transition: width 0.3s;
}

.progress-text {
  font-size: 0.8rem;
  color: #666;
  min-width: 35px;
}

.cta-section {
  text-align: center;
  margin-top: 50px;
  padding: 40px;
  background: linear-gradient(135deg, #2e7d32 0%, #388e3c 100%);
  border-radius: 12px;
  color: white;
}

.cta-section h3 {
  margin: 0 0 15px 0;
  font-size: 1.8rem;
}

.cta-section p {
  margin: 0 0 25px 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.cta-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-btn {
  padding: 12px 25px;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.cta-btn.primary {
  background: white;
  color: #2e7d32;
}

.cta-btn.secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.empty {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.empty a {
  color: #2e7d32;
  text-decoration: none;
  font-weight: 600;
}

@media (max-width: 768px) {
  .container { padding: 0 15px; margin-top: 60px; }
  .summary { grid-template-columns: repeat(2, 1fr); gap: 10px; padding: 15px; }
  .controls { 
    grid-template-columns: 1fr; 
    gap: 12px;
  }
  .chart-type, .filters, .export { justify-content: center; }
  .layout { grid-template-columns: 1fr; }
  .chart-section { position: static; margin-top: 20px; }
  .tabs { justify-content: flex-start; }
  .cases-grid.grid { grid-template-columns: 1fr; }
  .case-image { 
    flex-direction: column; 
    gap: 5px;
  }
  .before-img, .after-img { width: 100px; height: 75px; }
  .cta-buttons { flex-direction: column; align-items: center; }
  .cta-btn { width: 200px; }
}
</style>