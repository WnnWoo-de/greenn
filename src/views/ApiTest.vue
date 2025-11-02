<template>
  <div class="container">
    <h2>API 测试页面</h2>
    
    <div class="test-section">
      <h3>健康检查</h3>
      <button @click="testHealth" :disabled="loading.health" class="btn">
        {{ loading.health ? '测试中...' : '测试健康检查' }}
      </button>
      <div v-if="results.health" class="result">
        <pre>{{ JSON.stringify(results.health, null, 2) }}</pre>
      </div>
    </div>

    <div class="test-section">
      <h3>成就列表</h3>
      <button @click="testAchievements" :disabled="loading.achievements" class="btn">
        {{ loading.achievements ? '测试中...' : '测试成就API' }}
      </button>
      <div v-if="results.achievements" class="result">
        <pre>{{ JSON.stringify(results.achievements, null, 2) }}</pre>
      </div>
    </div>

    <div class="test-section">
      <h3>碳足迹计算</h3>
      <button @click="testFootprint" :disabled="loading.footprint" class="btn">
        {{ loading.footprint ? '测试中...' : '测试碳足迹API' }}
      </button>
      <div v-if="results.footprint" class="result">
        <pre>{{ JSON.stringify(results.footprint, null, 2) }}</pre>
      </div>
    </div>

    <div class="test-section">
      <h3>用户注册测试</h3>
      <div class="form-group">
        <input v-model="testUser.username" placeholder="测试用户名" />
        <input v-model="testUser.email" placeholder="测试邮箱" type="email" />
        <input v-model="testUser.password" placeholder="测试密码" type="password" />
      </div>
      <button @click="testRegister" :disabled="loading.register" class="btn">
        {{ loading.register ? '注册中...' : '测试注册' }}
      </button>
      <div v-if="results.register" class="result">
        <pre>{{ JSON.stringify(results.register, null, 2) }}</pre>
      </div>
    </div>

    <div class="test-section">
      <h3>用户登录测试</h3>
      <div class="form-group">
        <input v-model="loginUser.email" placeholder="登录邮箱" type="email" />
        <input v-model="loginUser.password" placeholder="登录密码" type="password" />
      </div>
      <button @click="testLogin" :disabled="loading.login" class="btn">
        {{ loading.login ? '登录中...' : '测试登录' }}
      </button>
      <div v-if="results.login" class="result">
        <pre>{{ JSON.stringify(results.login, null, 2) }}</pre>
      </div>
    </div>

    <div v-if="error" class="error">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/api'

const auth = useAuthStore()

const loading = reactive({
  health: false,
  achievements: false,
  footprint: false,
  register: false,
  login: false
})

const results = reactive({
  health: null,
  achievements: null,
  footprint: null,
  register: null,
  login: null
})

const testUser = reactive({
  username: 'testuser' + Date.now(),
  email: 'test' + Date.now() + '@example.com',
  password: 'Test123456'
})

const loginUser = reactive({
  email: 'test123@example.com',
  password: 'Test123456'
})

const error = ref('')

async function testHealth() {
  loading.health = true
  error.value = ''
  try {
    const response = await fetch('http://localhost:3001/health')
    const data = await response.json()
    results.health = data
  } catch (err) {
    error.value = '健康检查失败: ' + err.message
  } finally {
    loading.health = false
  }
}

async function testAchievements() {
  loading.achievements = true
  error.value = ''
  try {
    const response = await fetch('http://localhost:3001/api/achievements')
    const data = await response.json()
    results.achievements = data
  } catch (err) {
    error.value = '成就API测试失败: ' + err.message
  } finally {
    loading.achievements = false
  }
}

async function testFootprint() {
  loading.footprint = true
  error.value = ''
  try {
    const response = await fetch('http://localhost:3001/api/footprint/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        transport: { car: 0, bus: 0, train: 0, plane: 0 },
        energy: { electricity: 100, gas: 0, heating: 0 },
        food: { meat: 2, dairy: 1, vegetables: 3 },
        waste: { recycling: true, composting: false }
      })
    })
    const data = await response.json()
    results.footprint = data
  } catch (err) {
    error.value = '碳足迹API测试失败: ' + err.message
  } finally {
    loading.footprint = false
  }
}

async function testRegister() {
  loading.register = true
  error.value = ''
  try {
    const result = await auth.register(testUser)
    results.register = result
    // 生成新的测试用户数据
    testUser.username = 'testuser' + Date.now()
    testUser.email = 'test' + Date.now() + '@example.com'
  } catch (err) {
    error.value = '注册测试失败: ' + err.message
  } finally {
    loading.register = false
  }
}

async function testLogin() {
  loading.login = true
  error.value = ''
  try {
    const result = await auth.login(loginUser.email, loginUser.password)
    results.login = result
  } catch (err) {
    error.value = '登录测试失败: ' + err.message
  } finally {
    loading.login = false
  }
}
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
}

h2 {
  color: #333;
  margin-bottom: 30px;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

h3 {
  color: #555;
  margin-bottom: 15px;
}

.btn {
  padding: 10px 20px;
  background: #6fcf97;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 15px;
}

.btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.form-group {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.form-group input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.result {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 15px;
  margin-top: 15px;
}

.result pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 12px;
  color: #495057;
}

.error {
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
  padding: 15px;
  color: #c33;
  margin-top: 20px;
}
</style>