<template>
  <section class="container">
    <h2 v-reveal>登录</h2>
    <form class="form" @submit.prevent="onSubmit" v-reveal>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      <label>
        用户名
        <input v-model="username" type="text" placeholder="请输入用户名" required :disabled="isLoading" />
      </label>
      <label>
        密码
        <input v-model="password" type="password" placeholder="请输入密码" required :disabled="isLoading" />
      </label>
      <button class="btn" type="submit" :disabled="isLoading">
        {{ isLoading ? '登录中...' : '登录' }}
      </button>
      <p class="hint">没有账号？<router-link to="/register">去注册</router-link></p>
    </form>
  </section>
  </template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

async function onSubmit() {
  if (!username.value || !password.value) return
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const result = await auth.login({
      username: username.value,
      password: password.value
    })
    
    if (result.success) {
      const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/profile'
      router.push(redirect)
    } else {
      errorMessage.value = result.message || '登录失败'
    }
  } catch (error) {
    errorMessage.value = '登录失败，请稍后重试'
    console.error('Login error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.container { max-width: 480px; margin: 80px auto 40px; padding: 0 20px; }
h2 { font-size: 1.6rem; margin-bottom: 16px; }
.form { display: grid; gap: 12px; }
.error-message { 
  padding: 10px; 
  background: #fee; 
  border: 1px solid #fcc; 
  border-radius: 6px; 
  color: #c33; 
  font-size: 0.9rem; 
}
label { display: grid; gap: 6px; }
input { padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; }
input:disabled { background: #f5f5f5; cursor: not-allowed; }
.btn { padding: 10px 14px; border: none; border-radius: 6px; background: #6fcf97; color: #fff; cursor: pointer; }
.btn:disabled { background: #ccc; cursor: not-allowed; }
.hint { color: #666; }
.hint a { color: #66a6ff; text-decoration: none; }
</style>