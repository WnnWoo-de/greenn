<template>
  <div v-if="visible" class="welcome-dialog">
    <div class="dialog-content">
      <button class="close-btn" @click="close">×</button>
      <h2 class="dialog-title">欢迎使用绿我同行 GreenSight AI</h2>
      <p class="dialog-desc">感谢您访问我们的项目</p>
      <ul class="dialog-list">
        <li><span class="dialog-icon">📢</span> <b>项目声明</b><br>本项目自由wnnw 开发，仅用于参加“传智杯”AI-Web网页开发挑战赛</li>
        <li><span class="dialog-icon">💚</span> <b>项目愿景</b><br>致力于为用户提供全面的健康管理解决方案，关注身心健康</li>
        <li><span class="dialog-icon">🔗</span> <b>参与贡献</b><br>欢迎通过参与项目改进，共同成长</li>
      </ul>
      <div class="dialog-actions">
        <button class="license-btn" @click="viewLicense">查看许可协议</button>
        <button class="continue-btn" @click="close">了解并继续</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const visible = ref(true)

function close() {
  visible.value = false
  localStorage.setItem('welcomeDialogClosed', '1')
}

onMounted(() => {
  if (localStorage.getItem('welcomeDialogClosed')) {
    visible.value = false
  }
})
</script>

<style scoped>
.welcome-dialog {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}
.dialog-content {
  background: #ffffff;
  color: #333333;
  border-radius: 18px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.12);
  padding: 32px 24px 24px 24px;
  max-width: 340px;
  width: 100%;
  position: relative;
  font-size: 1rem;
}
.dialog-title {
  font-size: 1.35rem;
  font-weight: bold;
  margin-bottom: 8px;
  color: #222222;
}
.dialog-desc {
  color: #666666;
  margin-bottom: 18px;
}
.dialog-list {
  list-style: none;
  padding: 0;
  margin: 0 0 18px 0;
}
.dialog-list li {
  margin-bottom: 12px;
  line-height: 1.6;
  word-break: break-all;
  color: #444444;
}
.dialog-icon {
  margin-right: 6px;
  font-size: 1.1em;
}
.dialog-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}
.license-btn {
  background: none;
  border: 1px solid var(--accent-1, #22c55e);
  color: var(--accent-1, #22c55e);
  border-radius: 8px;
  padding: 6px 16px;
  cursor: pointer;
  font-size: 1em;
  transition: background .2s;
}
.license-btn:hover {
  background: var(--accent-1, #22c55e);
  color: #ffffff;
}
.continue-btn {
  background: var(--accent-1, #22c55e);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 6px 16px;
  cursor: pointer;
  font-size: 1em;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
  transition: background .2s;
}
.continue-btn:hover {
  background: var(--accent-2, #16a34a);
}
.close-btn {
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  color: #888888;
  font-size: 1.3em;
  cursor: pointer;
  transition: color .2s;
}
.close-btn:hover {
  color: #333333;
}
</style>