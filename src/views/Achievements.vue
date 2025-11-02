<template>
  <section class="container">
    <!-- 成就部分 -->
    <div class="section-header">
      <h2 v-reveal>成就与排行榜</h2>
      <p class="desc" v-reveal>参与环保行动、积累积分，解锁你的绿色成就，查看你在社区中的排名。</p>
    </div>

    <!-- 成就网格 -->
    <div class="achievements-section">
      <h3 class="section-title" v-reveal>我的成就</h3>
      <div class="grid">
        <article v-for="a in achievements.all" :key="a.id" class="card achievement-card" v-reveal>
          <h3 class="title">{{ a.name }}</h3>
          <p class="muted">{{ a.desc }}</p>
          <p v-if="has(a.id)" class="ok">已解锁｜{{ awardTime(a.id) }}</p>
          <p v-else class="muted">未解锁</p>
        </article>
      </div>

      <div class="card info-card" v-reveal>
        <h3 class="title">成就体系说明</h3>
        <p class="desc">参与打卡、报名活动与兑换商品将逐步解锁成就，激励持续的绿色行动。</p>
        <p class="desc">提示：达成里程碑积分后会自动授予对应成就，并在个人中心展示解锁时间。</p>
      </div>
    </div>

    <!-- 排行榜部分 -->
    <div class="leaderboard-section">
      <h3 class="section-title" v-reveal>社区排行榜</h3>
      <p class="muted" v-reveal>数据基于本地参与记录，默认展示打卡排行。</p>

      <!-- 概览与图表类型切换 -->
      <div class="summary card" v-reveal>
        <div class="sum-item">
          <span class="label">我的排名</span>
          <span class="value">{{ myRank ? '#' + myRank : '—' }}</span>
        </div>
        <div class="sum-item">
          <span class="label">{{ metricLabel }}</span>
          <span class="value">{{ myValue }}</span>
        </div>
        <div class="sum-item">
          <span class="label">参与用户</span>
          <span class="value">{{ participantCount }}</span>
        </div>
        <div class="sum-item">
          <span class="label">Top 1</span>
          <span class="value">{{ top1?.username || '—' }}<span v-if="top1">｜{{ top1.value }}</span></span>
        </div>
      </div>

      <div class="tabs" v-reveal>
        <button
          v-for="t in tabs"
          :key="t.key"
          class="tab"
          :class="{ active: activeTab === t.key }"
          @click="activeTab = t.key"
        >{{ t.label }}</button>
      </div>

      <div class="controls" v-reveal>
        <div class="chart-type">
          <button class="pill" :class="{ active: chartType === 'bar' }" @click="chartType = 'bar'">柱状图</button>
          <button class="pill" :class="{ active: chartType === 'doughnut' }" @click="chartType = 'doughnut'">饼图</button>
        </div>
        <div class="filters">
          <input class="input" type="text" v-model="filterText" placeholder="搜索用户…" />
          <label class="switch">
            <input type="checkbox" v-model="ascending" />
            <span>升序</span>
          </label>
          <label class="switch">
            <input type="checkbox" v-model="anonymize" />
            <span>匿名显示</span>
          </label>
          <select class="select" v-model.number="topN">
            <option :value="10">前 10</option>
            <option :value="15">前 15</option>
            <option :value="20">前 20</option>
          </select>
        </div>
        <div class="export">
          <button class="pill" @click="exportExcel">导出 Excel</button>
          <button class="pill" @click="exportJSON">导出 JSON</button>
          <button class="pill" @click="downloadChartPNG">下载图表 PNG</button>
          <button class="pill" @click="copyRanking">复制榜单</button>
        </div>
      </div>

      <div class="card info-card" v-reveal>
        <h3 class="name">排行规则说明</h3>
        <p class="muted">打卡、活动、成就、兑换四项分别统计，切换上方标签查看不同维度。</p>
        <p class="muted">排行榜数据基于本地记录，若清理浏览器数据将导致重置。</p>
        <p class="muted">想提升排名？去<router-link :to="ctaLink">{{ ctaText }}</router-link>参与以积累。</p>
      </div>

      <div class="layout" v-reveal>
        <div class="left">
          <!-- 领奖台 Top 3 -->
          <div class="podium" v-if="topThree.length">
            <article v-for="(u, i) in topThree" :key="u.username" class="card podium-item" :class="'pos-' + (i + 1)" v-reveal>
              <div class="medal">{{ i === 0 ? '🥇' : (i === 1 ? '🥈' : '🥉') }}</div>
              <div class="info">
                <h3 class="name" :class="{ me: u.username === auth.user?.username }">{{ displayName(u) }}</h3>
                <p class="muted">{{ metricLabel }}：<strong>{{ u.value }}</strong></p>
              </div>
            </article>
          </div>

          <!-- 其他选手 4~ -->
          <div class="list others">
            <article v-for="(u, idx) in others" :key="u.username" class="card item" :class="{ me: u.username === auth.user?.username }" v-reveal>
              <div class="rank">#{{ idx + 4 }}</div>
              <div class="info">
                <h3 class="name">{{ displayName(u) }}</h3>
                <p class="muted">{{ metricLabel }}：<strong>{{ u.value }}</strong></p>
              </div>
            </article>
            <p v-if="!activeRanks.length" class="muted empty">暂无数据，去<router-link :to="ctaLink">{{ ctaText }}</router-link>试试吧～</p>
          </div>
        </div>

        <div class="chart" v-reveal>
          <canvas ref="chartRef"></canvas>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import { useAchievementsStore } from '@/stores/achievements'
import { useAuthStore } from '@/stores/auth'
import { useCheckinStore } from '@/stores/checkin'
import { useActivityStore } from '@/stores/activity'
import { useShopStore } from '@/stores/shop'
import { useNotifyStore } from '@/stores/notify'

const achievements = useAchievementsStore()
const auth = useAuthStore()
const checkin = useCheckinStore()
const activity = useActivityStore()
const shop = useShopStore()
const notify = useNotifyStore()

// 成就相关
const username = computed(() => auth.user?.username ?? '')
const myAwards = computed(() => achievements.userAwards(username.value))

function has(id) {
  return myAwards.value.some(a => a.id === id)
}

function awardTime(id) {
  const item = myAwards.value.find(a => a.id === id)
  return item ? formatTime(item.at) : ''
}

function formatTime(ts) {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm}`
}

// 排行榜相关
const tabs = [
  { key: 'checkins', label: '打卡排行' },
  { key: 'activities', label: '活动排行' },
  { key: 'achievements', label: '成就排行' },
  { key: 'redeems', label: '兑换排行' },
]
const activeTab = ref('checkins')

const knownUsers = computed(() => {
  const set = new Set()
  const keys = [
    Object.keys(checkin.checkinsByUser ?? {}),
    Object.keys(activity.registrationsByUser ?? {}),
    Object.keys(shop.redemptionsByUser ?? {}),
    Object.keys(achievements.awardsByUser ?? {}),
  ]
  keys.forEach(arr => arr.forEach(u => set.add(u)))
  if (auth.user?.username) set.add(auth.user.username)
  return Array.from(set)
})

function sortRanks(arr, asc = false) {
  const items = [...arr]
  items.sort((a, b) => asc ? (a.value - b.value) : (b.value - a.value))
  return items
}

const checkinRanks = computed(() => {
  return sortRanks(knownUsers.value.map(u => ({
    username: u,
    value: (checkin.checkinsByUser?.[u]?.length ?? 0)
  })).filter(x => x.value > 0), ascending.value)
})

const activityRanks = computed(() => {
  return sortRanks(knownUsers.value.map(u => ({
    username: u,
    value: (activity.registrationsByUser?.[u]?.length ?? 0)
  })).filter(x => x.value > 0), ascending.value)
})

const achievementRanks = computed(() => {
  return sortRanks(knownUsers.value.map(u => ({
    username: u,
    value: (achievements.awardsByUser?.[u]?.length ?? 0)
  })).filter(x => x.value > 0), ascending.value)
})

const redeemRanks = computed(() => {
  return sortRanks(knownUsers.value.map(u => ({
    username: u,
    value: (shop.redemptionsByUser?.[u]?.length ?? 0)
  })).filter(x => x.value > 0), ascending.value)
})

const metricLabel = computed(() => {
  switch (activeTab.value) {
    case 'checkins': return '打卡次数'
    case 'activities': return '报名次数'
    case 'achievements': return '成就数量'
    case 'redeems': return '兑换次数'
  }
  return '数量'
})

const activeRanks = computed(() => {
  switch (activeTab.value) {
    case 'checkins': return checkinRanks.value
    case 'activities': return activityRanks.value
    case 'achievements': return achievementRanks.value
    case 'redeems': return redeemRanks.value
  }
  return []
})

const filterText = ref('')
const ascending = ref(false)
const anonymize = ref(false)
const topN = ref(15)

const filteredRanks = computed(() => {
  const ft = filterText.value.trim().toLowerCase()
  if (!ft) return activeRanks.value
  return activeRanks.value.filter(x => (x.username || '').toLowerCase().includes(ft))
})

const topThree = computed(() => filteredRanks.value.slice(0, 3))
const others = computed(() => filteredRanks.value.slice(3, topN.value))
const participantCount = computed(() => filteredRanks.value.length)
const top1 = computed(() => topThree.value[0])
const myRank = computed(() => {
  const me = auth.user?.username
  if (!me) return 0
  const idx = activeRanks.value.findIndex(r => r.username === me)
  return idx >= 0 ? (idx + 1) : 0
})
const myValue = computed(() => {
  const me = auth.user?.username
  if (!me) return 0
  const item = activeRanks.value.find(r => r.username === me)
  return item?.value ?? 0
})

const chartType = ref('bar')
const accentColor = computed(() => {
  switch (activeTab.value) {
    case 'checkins': return '#66a6ff'
    case 'activities': return '#6fcf97'
    case 'achievements': return '#f9a825'
    case 'redeems': return '#ab47bc'
  }
  return '#66a6ff'
})

const ctaLink = computed(() => {
  switch (activeTab.value) {
    case 'checkins': return '/checkin'
    case 'activities': return '/activity'
    case 'achievements': return '/achievements'
    case 'redeems': return '/store'
  }
  return '/'
})
const ctaText = computed(() => {
  switch (activeTab.value) {
    case 'checkins': return '打卡'
    case 'activities': return '报名活动'
    case 'achievements': return '解锁成就'
    case 'redeems': return '兑换商品'
  }
  return '参与'
})

const anonNameMap = computed(() => {
  const map = new Map()
  activeRanks.value.forEach((x, i) => {
    if (x.username) map.set(x.username, `用户${i + 1}`)
  })
  return map
})

function displayName(u) {
  if (anonymize.value) return anonNameMap.value.get(u.username) || '匿名用户'
  return u.username || '匿名用户'
}

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
  const top = filteredRanks.value.slice(0, 6)
  const labels = top.map(x => anonymize.value ? (anonNameMap.value.get(x.username) || '匿名') : (x.username || '匿名'))
  const data = top.map(x => x.value)
  const colors = {
    checkins: '#66a6ff',
    activities: '#6fcf97',
    achievements: '#f9a825',
    redeems: '#ab47bc',
  }
  const color = colors[activeTab.value] || '#66a6ff'

  if (chartInst) {
    chartInst.destroy()
    chartInst = null
  }
  const ctx = chartRef.value.getContext('2d')
  const isBar = chartType.value === 'bar'
  chartInst = new Chart(ctx, {
    type: chartType.value,
    data: {
      labels,
      datasets: [{ label: metricLabel.value, data, backgroundColor: color }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      ...(isBar ? { scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } } : {})
    }
  })
}

onMounted(async () => {
  await ensureChart()
  await nextTick()
  renderChart()
})

watch([activeTab, activeRanks, chartType], async () => {
  await nextTick()
  renderChart()
})

// 当筛选、匿名、TopN变化时，更新图表以反映当前列表
watch([filterText, anonymize, topN], async () => {
  await nextTick()
  renderChart()
})

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function exportExcel() {
  const rows = filteredRanks.value.map((x, i) => ({ 
    排名: i + 1, 
    用户名: anonymize.value ? (anonNameMap.value.get(x.username) || '匿名') : (x.username || '匿名'), 
    [metricLabel.value]: x.value 
  }))
  
  import('xlsx').then(XLSX => {
    // 创建工作簿
    const wb = XLSX.utils.book_new()
    // 创建工作表
    const ws = XLSX.utils.json_to_sheet(rows)
    // 将工作表添加到工作簿
    XLSX.utils.book_append_sheet(wb, ws, tabs.find(t => t.key === activeTab.value)?.label || '排行榜')
    // 生成xlsx文件并下载
    XLSX.writeFile(wb, `leaderboard-${activeTab.value}.xlsx`)
    notify.success('已导出 Excel')
  }).catch(err => {
    console.error('导出Excel失败:', err)
    notify.error('导出失败，请重试')
  })
}

function exportJSON() {
  const rows = filteredRanks.value.map((x, i) => ({ rank: i + 1, username: anonymize.value ? (anonNameMap.value.get(x.username) || '匿名') : (x.username || '匿名'), value: x.value, metric: metricLabel.value, tab: activeTab.value }))
  const json = JSON.stringify(rows, null, 2)
  downloadBlob(new Blob([json], { type: 'application/json' }), `leaderboard-${activeTab.value}.json`)
  notify.success('已导出 JSON')
}

function downloadChartPNG() {
  if (!chartInst) { notify.info('图表尚未生成'); return }
  const url = chartInst.toBase64Image()
  const a = document.createElement('a')
  a.href = url
  a.download = `chart-${activeTab.value}-${chartType.value}.png`
  a.click()
  notify.success('已下载图表 PNG')
}

async function copyRanking() {
  try {
    const lines = filteredRanks.value.slice(0, topN.value).map((x, i) => `${i + 1}. ${(anonymize.value ? (anonNameMap.value.get(x.username) || '匿名') : (x.username || '匿名'))} - ${x.value}`)
    const title = `【${metricLabel.value}】排行榜（${tabs.find(t => t.key === activeTab.value)?.label || ''}）`
    const text = [title, ...lines].join('\n')
    await navigator.clipboard.writeText(text)
    notify.success('榜单已复制到剪贴板')
  } catch {
    notify.error('复制失败，请手动选择文本复制')
  }
}
</script>

<style lang="scss" scoped>
.container { 
  max-width: 1200px; 
  margin: 80px auto 40px; 
  padding: 0 20px; 
  color: var(--text-primary);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
}

.section-header {
  text-align: center;
  margin-bottom: 48px;
  
  h2 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 16px;
    color: var(--text-primary);
    background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .desc {
    font-size: 1.1rem;
    color: var(--text-secondary);
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }
}

.achievements-section {
  margin-bottom: 60px;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 24px;
  color: var(--text-primary);
}

.grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
  gap: 20px; 
  margin-bottom: 24px;
}

.card { 
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px; 
  padding: 24px; 
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px var(--shadow);
  backdrop-filter: blur(10px);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px var(--shadow);
  border-color: var(--accent-1);
}

.achievement-card {
  .title { 
    font-size: 1.2rem; 
    font-weight: 600;
    margin-bottom: 8px; 
    color: var(--text-primary);
  }
  
  .muted { 
    color: var(--text-muted); 
    margin-bottom: 12px;
    line-height: 1.5;
  }
  
  .ok { 
    color: var(--accent-1); 
    font-weight: 500;
    font-size: 0.9rem;
  }
}

.info-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(20px);
  
  .title { 
    font-size: 1.1rem; 
    font-weight: 600;
    margin-bottom: 12px; 
    color: var(--text-primary);
  }
  
  .desc { 
    color: var(--text-secondary); 
    margin-bottom: 8px;
    line-height: 1.6;
  }
}

.leaderboard-section {
  .section-title {
    margin-bottom: 16px;
  }
  
  .muted {
    color: var(--text-muted);
    margin-bottom: 24px;
    font-size: 0.95rem;
  }
}

.summary { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
  gap: 16px; 
  margin-bottom: 24px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
}

.sum-item { 
  text-align: center; 
  padding: 16px;
  
  .label { 
    display: block; 
    font-size: 0.9rem; 
    color: var(--text-muted); 
    margin-bottom: 8px;
    font-weight: 500;
  }
  
  .value { 
    font-size: 1.4rem; 
    font-weight: 700; 
    color: var(--text-primary);
  }
}

.tabs { 
  display: flex; 
  gap: 4px; 
  margin-bottom: 20px; 
  background: var(--bg-tertiary); 
  padding: 4px; 
  border-radius: 8px;
  border: 1px solid var(--border-primary);
}

.tab { 
  padding: 10px 18px; 
  border: none; 
  background: transparent; 
  border-radius: 6px; 
  cursor: pointer; 
  transition: all 0.2s ease;
  white-space: nowrap;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.95rem;
}

.tab.active { 
  background: var(--bg-primary); 
  box-shadow: 0 2px 8px var(--shadow); 
  color: var(--text-primary);
  font-weight: 600;
}

.tab:hover:not(.active) {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.controls { 
  display: grid; 
  grid-template-columns: auto 1fr auto; 
  gap: 16px; 
  align-items: center; 
  margin-bottom: 20px;
  padding: 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
}

.chart-type { 
  display: flex; 
  gap: 6px; 
}

.filters { 
  display: flex; 
  gap: 12px; 
  align-items: center; 
  flex-wrap: wrap; 
}

.export { 
  display: flex; 
  gap: 8px; 
  flex-wrap: wrap; 
}

.pill { 
  padding: 8px 16px; 
  border: 1px solid var(--border-primary); 
  background: var(--bg-primary); 
  color: var(--text-primary);
  border-radius: 20px; 
  cursor: pointer; 
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.pill.active { 
  background: var(--accent-1); 
  color: white; 
  border-color: var(--accent-1); 
}

.pill:hover:not(.active) { 
  background: var(--bg-tertiary); 
  border-color: var(--accent-1);
}

.input, .select { 
  padding: 8px 12px; 
  border: 1px solid var(--border-primary); 
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 6px; 
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.input:focus, .select:focus {
  outline: none;
  border-color: var(--accent-1);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.switch { 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.switch input { 
  margin: 0; 
  accent-color: var(--accent-1);
}

.layout { 
  display: grid; 
  grid-template-columns: 1fr 320px; 
  gap: 24px; 
  align-items: start;
}

.left { 
  display: grid; 
  gap: 20px; 
}

.podium { 
  display: grid; 
  gap: 12px; 
}

.podium-item { 
  display: flex; 
  align-items: center; 
  gap: 16px;
  padding: 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.podium-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow);
}

.podium-item.pos-1 { 
  background: linear-gradient(135deg, var(--bg-secondary) 0%, rgba(255, 193, 7, 0.1) 100%);
  border-color: #ffc107;
}

.podium-item.pos-2 { 
  background: linear-gradient(135deg, var(--bg-secondary) 0%, rgba(108, 117, 125, 0.1) 100%);
  border-color: #6c757d;
}

.podium-item.pos-3 { 
  background: linear-gradient(135deg, var(--bg-secondary) 0%, rgba(220, 53, 69, 0.1) 100%);
  border-color: #dc3545;
}

.medal { 
  font-size: 1.8rem; 
  line-height: 1;
}

.info .name { 
  margin: 0; 
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.info .name.me { 
  color: var(--accent-1); 
  font-weight: 700; 
}

.info .muted { 
  margin: 6px 0 0 0; 
  color: var(--text-muted);
  font-size: 0.9rem;
}

.list.others { 
  display: grid; 
  gap: 8px; 
}

.item { 
  display: flex; 
  align-items: center; 
  gap: 16px;
  padding: 16px 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.item:hover {
  background: var(--bg-tertiary);
}

.item.me { 
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%); 
  border-left: 4px solid var(--accent-1);
  border-color: var(--accent-1);
}

.rank { 
  font-size: 1.2rem; 
  font-weight: 700; 
  color: var(--text-secondary); 
  min-width: 40px;
}

.item .info .name { 
  margin: 0; 
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.item .info .muted { 
  margin: 4px 0 0 0; 
  font-size: 0.85rem;
  color: var(--text-muted);
}

.chart { 
  position: sticky; 
  top: 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px var(--shadow);
}

.chart canvas { 
  max-height: 320px; 
}

// 响应式设计
@media (max-width: 768px) {
  .container { 
    padding: 0 16px; 
    margin-top: 60px; 
  }
  
  .section-header h2 {
    font-size: 2rem;
  }
  
  .grid {
    grid-template-columns: 1fr;
  }
  
  .summary { 
    grid-template-columns: repeat(2, 1fr);
  }
  
  .controls { 
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px;
  }
  
  .chart-type, .filters, .export {
    justify-content: center;
  }
  
  .layout {
    grid-template-columns: 1fr;
  }
  
  .chart {
    position: static;
  }
  
  .tabs {
    flex-wrap: wrap;
  }
  
  .podium-item {
    padding: 16px;
    gap: 12px;
  }
  
  .medal {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .section-header h2 {
    font-size: 1.8rem;
  }
  
  .summary {
    grid-template-columns: 1fr;
  }
  
  .sum-item {
    padding: 12px;
  }
  
  .controls {
    padding: 12px;
  }
  
  .pill {
    padding: 6px 12px;
    font-size: 0.85rem;
  }
}
</style>