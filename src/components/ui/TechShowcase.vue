<template>
  <div class="p-6 max-w-4xl mx-auto">
    <!-- Tailwind CSS 示例 -->
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-gradient mb-6">Tailwind CSS 示例</h2>
      
      <!-- 卡片网格 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div class="card hover:shadow-lg transition-shadow duration-300">
          <h3 class="text-xl font-semibold text-gray-800 mb-2">环保行动</h3>
          <p class="text-gray-600 mb-4">参与绿色生活，保护地球环境</p>
          <button class="btn-primary w-full">立即参与</button>
        </div>
        
        <div class="card hover:shadow-lg transition-shadow duration-300">
          <h3 class="text-xl font-semibold text-gray-800 mb-2">碳足迹追踪</h3>
          <p class="text-gray-600 mb-4">监测您的碳排放，制定减排计划</p>
          <button class="btn-secondary w-full">开始追踪</button>
        </div>
        
        <div class="card glass-effect text-white">
          <h3 class="text-xl font-semibold mb-2">AI 建议</h3>
          <p class="text-gray-100 mb-4">获取个性化的环保建议</p>
          <button class="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 w-full">
            获取建议
          </button>
        </div>
      </div>
      
      <!-- 响应式布局示例 -->
      <div class="bg-gradient-to-r from-green-400 to-blue-500 rounded-xl p-6 text-white">
        <h3 class="text-2xl font-bold mb-2">响应式设计</h3>
        <p class="text-green-100">这个组件在不同屏幕尺寸下会自动调整布局</p>
      </div>
    </div>

    <!-- Naive UI 示例 -->
    <div>
      <h2 class="text-3xl font-bold text-gray-800 mb-6">Naive UI 组件示例</h2>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 表单组件 -->
        <div class="space-y-4">
          <h3 class="text-xl font-semibold text-gray-700">表单组件</h3>
          
          <n-input
            v-model:value="inputValue"
            placeholder="请输入您的姓名"
            size="large"
          />
          
          <n-select
            v-model:value="selectValue"
            placeholder="选择您的兴趣"
            :options="selectOptions"
            size="large"
          />
          
          <n-date-picker
            v-model:value="dateValue"
            type="date"
            placeholder="选择日期"
            size="large"
            class="w-full"
          />
          
          <div class="flex gap-2">
            <n-button type="primary" size="large">
              <template #icon>
                <n-icon><CheckIcon /></n-icon>
              </template>
              提交
            </n-button>
            <n-button size="large">取消</n-button>
          </div>
        </div>
        
        <!-- 数据展示组件 -->
        <div class="space-y-4">
          <h3 class="text-xl font-semibold text-gray-700">数据展示</h3>
          
          <n-card title="环保数据统计" size="small">
            <template #header-extra>
              <n-tag type="success">本月</n-tag>
            </template>
            
            <n-statistic label="减少碳排放" :value="1234.5" suffix="kg">
              <template #prefix>
                <n-icon color="#18a058"><TrendingUpIcon /></n-icon>
              </template>
            </n-statistic>
            
            <n-divider />
            
            <n-progress
              type="line"
              :percentage="75"
              :height="8"
              color="#18a058"
              rail-color="#f0f0f0"
            />
            <p class="text-sm text-gray-500 mt-2">环保目标完成度: 75%</p>
          </n-card>
          
          <n-alert title="提示" type="info">
            您今天的环保行为很棒！继续保持绿色生活方式。
          </n-alert>
          
          <n-space>
            <n-tag type="success">环保达人</n-tag>
            <n-tag type="warning">节能专家</n-tag>
            <n-tag type="info">绿色出行</n-tag>
          </n-space>
        </div>
      </div>
      
      <!-- 加载和反馈组件 -->
      <div class="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 class="text-xl font-semibold text-gray-700 mb-4">交互组件</h3>
        
        <n-space>
          <n-button @click="showMessage" type="primary">显示消息</n-button>
          <n-button @click="showNotification" type="info">显示通知</n-button>
          <n-button @click="showModal = true" type="warning">打开对话框</n-button>
          <n-button :loading="loading" @click="simulateLoading">
            {{ loading ? '加载中...' : '模拟加载' }}
          </n-button>
        </n-space>
      </div>
    </div>
    
    <!-- 模态框 -->
    <n-modal v-model:show="showModal">
      <n-card
        style="width: 600px"
        title="环保小贴士"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <template #header-extra>
          <n-button quaternary circle @click="showModal = false">
            <template #icon>
              <n-icon><CloseIcon /></n-icon>
            </template>
          </n-button>
        </template>
        
        <p class="text-gray-600 leading-relaxed">
          每天选择步行或骑自行车代替开车，不仅能减少碳排放，还能保持身体健康。
          一个小小的改变，就能为地球环境做出贡献！
        </p>
        
        <template #footer>
          <n-space justify="end">
            <n-button @click="showModal = false">关闭</n-button>
            <n-button type="primary" @click="showModal = false">知道了</n-button>
          </n-space>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMessage, useNotification } from 'naive-ui'
import { 
  CheckOutlined as CheckIcon,
  ArrowUpOutlined as TrendingUpIcon,
  CloseOutlined as CloseIcon
} from '@vicons/antd'

// 响应式数据
const inputValue = ref('')
const selectValue = ref(null)
const dateValue = ref(null)
const showModal = ref(false)
const loading = ref(false)

// 选择器选项
const selectOptions = [
  { label: '环保科技', value: 'eco-tech' },
  { label: '绿色出行', value: 'green-travel' },
  { label: '节能减排', value: 'energy-saving' },
  { label: '垃圾分类', value: 'waste-sorting' }
]

// Naive UI 消息和通知
const message = useMessage()
const notification = useNotification()

// 方法
const showMessage = () => {
  message.success('这是一个成功消息！')
}

const showNotification = () => {
  notification.create({
    title: '环保提醒',
    content: '记得今天要进行垃圾分类哦！',
    type: 'info',
    duration: 3000
  })
}

const simulateLoading = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    message.success('加载完成！')
  }, 2000)
}
</script>

<style scoped>
/* 自定义样式可以在这里添加 */
</style>