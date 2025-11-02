<template>
  <section class="container">
    <h2 v-reveal>注册</h2>
    <form class="form" @submit.prevent="onSubmit" v-reveal>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      <label>
        用户名
        <input v-model="username" type="text" placeholder="请输入用户名" required :disabled="isLoading" />
      </label>
      <label>
        邮箱
        <input v-model="email" type="email" placeholder="请输入邮箱" required :disabled="isLoading" />
      </label>
      <label>
        密码
        <input v-model="password" type="password" placeholder="请输入密码" required :disabled="isLoading" />
      </label>
      <label>
        确认密码
        <input v-model="confirm" type="password" placeholder="再次输入密码" required :disabled="isLoading" />
      </label>
      <button class="btn" type="submit" :disabled="isLoading">
        {{ isLoading ? '注册中...' : '注册' }}
      </button>
      <p class="hint">已有账号？<router-link to="/login">去登录</router-link></p>
    </form>
  </section>
  </template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const email = ref('')
const password = ref('')
const confirm = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

async function onSubmit() {
  if (!username.value || !email.value || !password.value) {
    errorMessage.value = '请填写所有字段'
    return
  }
  
  if (password.value !== confirm.value) {
    errorMessage.value = '两次输入的密码不一致'
    return
  }
  
  if (password.value.length < 6) {
    errorMessage.value = '密码长度至少6位'
    return
  }
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const result = await auth.register({
      username: username.value,
      email: email.value,
      password: password.value
    })
    
    if (result.success) {
      router.push('/profile')
    } else {
      errorMessage.value = result.message || '注册失败'
    }
  } catch (error) {
    errorMessage.value = '注册失败，请稍后重试'
    console.error('Register error:', error)
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