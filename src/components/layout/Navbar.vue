<template>
  <nav class="navbar" :class="{ scrolled: isScrolled }">
    <div class="container">
      <router-link to="/" class="logo">
        <img src="@/assets/images/logo.svg" alt="绿我同行 GreenSight" />
        <span class="brand-shimmer">绿我同行 GreenSight AI</span>
      </router-link>
      <!-- 汉堡按钮（移动端显示） -->
      <button
        class="menu-toggle"
        :class="{ open: isOpen }"
        @click="toggleMenu"
        aria-label="切换导航菜单"
        :aria-expanded="isOpen.toString()"
      >
        <span></span><span></span><span></span>
      </button>
      
      <div class="nav-links" :class="{ open: isOpen }">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/activity" class="nav-link">公益活动</router-link>
        <router-link to="/store" class="nav-link">积分商城</router-link>
        <router-link to="/community" class="nav-link">社区</router-link>
        <router-link to="/ai-recognition" class="nav-link">AI 识别</router-link>
        <router-link to="/upcycling" class="nav-link">旧物新生</router-link>

        <router-link to="/achievements" class="nav-link">成就</router-link>
      </div>
      <div class="user-actions">
        <!-- 主题切换（一直显示） -->
        <ThemeToggle mode="simple" />

        <!-- 登录后显示用户名与登出 -->
        <template v-if="authStore.isLoggedIn">
          <router-link to="/profile" class="user-info" aria-label="个人中心">
            <span class="user-icon">👤</span>
            <span class="user-name">{{ authStore.username || authStore.user?.username || '用户' }}</span>
          </router-link>
          <button @click="handleLogout" class="icon-btn logout-btn" title="退出" aria-label="退出">
            <svg class="logout-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 17l5-5-5-5" />
              <path d="M15 12H3" />
              <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
            </svg>
            <span class="logout-text">退出</span>
          </button>
        </template>

        <!-- 未登录显示登录/注册 -->
        <template v-else>
          <router-link to="/login" class="btn btn-outline glow">登录</router-link>
          <router-link to="/register" class="btn btn-primary glow">注册</router-link>
        </template>
      </div>
    </div>
    <!-- 折叠遮罩层（移动端） -->
    <div v-if="isOpen" class="nav-overlay" @click="closeMenu" />
  </nav>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useCheckinStore } from '@/stores/checkin';
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import ThemeToggle from '@/components/ui/ThemeToggle.vue'

const authStore = useAuthStore();
const router = useRouter();
const checkin = useCheckinStore();
const checkedToday = computed(() => checkin.isChecked(authStore.user?.username ?? ''));

// 滚动状态：用于收缩与加深导航栏背景
const isScrolled = ref(false);
const handleScroll = () => {
  try {
    isScrolled.value = (window.scrollY || document.documentElement.scrollTop || 0) > 8;
  } catch (_) {
    isScrolled.value = false;
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});

// 折叠状态与事件
const isOpen = ref(false);
const toggleMenu = () => {
  isOpen.value = !isOpen.value;
  try { document.body.style.overflow = isOpen.value ? 'hidden' : ''; } catch (_) {}
};
const closeMenu = () => {
  isOpen.value = false;
  try { document.body.style.overflow = ''; } catch (_) {}
};

onMounted(() => {
  const onKey = (e) => { if (e.key === 'Escape') closeMenu(); };
  window.addEventListener('keydown', onKey);
  // 路由切换时自动关闭
  try { router.afterEach(() => closeMenu()); } catch (_) {}
  // 视口变更时关闭
  const onResize = () => { if (window.innerWidth > 768) closeMenu(); };
  window.addEventListener('resize', onResize);
  onResize();
  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', onResize);
  });
});

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style lang="scss" scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  z-index: 1000;
  color: #eafff8;
  background: rgba(20, 26, 34, 0.35);
  backdrop-filter: blur(12px) saturate(1.2);
  -webkit-backdrop-filter: blur(12px) saturate(1.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.18),
    inset 0 0 0 0.5px rgba(255, 255, 255, 0.08);
  transition: height .35s ease, background .35s ease, box-shadow .35s ease, backdrop-filter .35s ease;

  // 底部流动渐变强调线
  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 2px;
    background: linear-gradient(90deg, var(--ray-accent-1), var(--ray-accent-2), var(--ray-accent-3));
    background-size: 200% 200%;
    filter: blur(0.3px);
    opacity: 0.65;
    animation: gradientShift 10s linear infinite;
  }
}

.navbar.scrolled {
  height: 56px;
  background: rgba(20, 26, 34, 0.55);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.28), inset 0 0 0 0.6px rgba(255, 255, 255, 0.08);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #ffffff;
  font-weight: bold;
  font-size: 1.2rem;
  
  img {
    height: 30px;
    margin-right: 10px;
    filter: drop-shadow(0 2px 6px var(--ray-shadow));
    transition: transform .25s ease, filter .25s ease;
  }

  &:hover img {
    transform: translateY(-1px) scale(1.03);
    filter: drop-shadow(0 4px 12px var(--ray-shadow));
  }
}

.brand-shimmer {
  position: relative;
  background: linear-gradient(90deg, var(--ray-accent-1), var(--ray-accent-2), var(--ray-accent-3));
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 6s linear infinite;
}

.nav-links {
  display: flex;
  gap: 20px;
  
  .nav-link {
    color: #eafff8;
    text-decoration: none;
    padding: 8px 12px;
    border-radius: 10px;
    transition: color .25s ease, transform .25s ease, text-shadow .25s ease;
    position: relative;
    will-change: transform, text-shadow;
    
    &::after {
      content: '';
      position: absolute;
      left: 12px;
      right: 12px;
      bottom: -4px;
      height: 2px;
      border-radius: 2px;
      background: linear-gradient(90deg, var(--ray-accent-1), var(--ray-accent-2), var(--ray-accent-3));
      background-size: 200% 200%;
      transform: scaleX(0);
      transform-origin: left;
      transition: transform .35s ease, opacity .35s ease;
      opacity: 0;
    }

    &:hover {
      color: #ffffff;
      transform: translateY(-1px);
      text-shadow: 0 0 12px var(--ray-shadow), 0 0 24px var(--ray-shadow);
    }

    &:hover::after {
      transform: scaleX(1);
      opacity: 0.9;
      animation: gradientShift 6s linear infinite;
    }

    &.router-link-active {
      color: #ffffff;
      text-shadow: 0 0 10px var(--ray-shadow);
    }

    &.router-link-active::after {
      transform: scaleX(1);
      opacity: 1;
      animation: gradientShift 12s linear infinite;
    }
  }
}

// 移动端折叠菜单
@media (max-width: 768px) {
  .menu-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px; height: 40px;
    margin-left: auto;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.28);
    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: 0 8px 22px var(--ray-shadow, rgba(102,166,255,0.35));
    transition: box-shadow .25s ease, transform .25s ease, border-color .25s ease;
  }
  .menu-toggle:hover { transform: translateY(-1px); border-color: var(--ray-accent-2); }
  .menu-toggle span {
    display: block;
    width: 20px; height: 2px;
    margin: 2px 0;
    border-radius: 2px;
    background: linear-gradient(90deg, var(--ray-accent-1), var(--ray-accent-2), var(--ray-accent-3));
    transition: transform .3s ease, opacity .3s ease;
  }
  .menu-toggle.open span:nth-child(1) { transform: translateY(4px) rotate(45deg); }
  .menu-toggle.open span:nth-child(2) { opacity: 0; }
  .menu-toggle.open span:nth-child(3) { transform: translateY(-4px) rotate(-45deg); }

  .nav-links {
    position: fixed;
    top: 60px; left: 12px; right: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 14px;
    border-radius: 14px;
    background: rgba(20, 26, 34, 0.72);
    backdrop-filter: blur(14px) saturate(1.2);
    -webkit-backdrop-filter: blur(14px) saturate(1.2);
    border: 1px solid rgba(255, 255, 255, 0.18);
    box-shadow: 0 30px 60px var(--ray-shadow, rgba(102,166,255,0.45)), inset 0 0 0 0.6px rgba(255,255,255,0.12);
    transform: translateY(-12px) scale(0.98);
    opacity: 0;
    pointer-events: none;
    transition: transform .35s ease, opacity .35s ease, box-shadow .35s ease;
    z-index: 1001;
  }
  .nav-links.open {
    transform: translateY(0) scale(1);
    opacity: 1;
    pointer-events: auto;
  }
  .nav-links .nav-link {
    padding: 10px 12px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.04);
  }

  .nav-overlay {
    position: fixed;
    top: 60px; left: 0; right: 0; bottom: 0;
    background: radial-gradient(1200px 600px at 80% -20%, rgba(255,255,255,0.08), transparent),
                linear-gradient(90deg, rgba(20,26,34,0.2), rgba(20,26,34,0.35));
    animation: overlayFade .35s ease;
    z-index: 1000;
  }
}

@keyframes overlayFade { from { opacity: 0; } to { opacity: 1; } }

.user-actions {
  display: flex;
  align-items: center;
  gap: 15px;

  .theme-toggle {
    margin-right: 5px;
  }

  .user-info {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border: 1px solid rgba(255, 255, 255, 0.28);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.06);
    color: #eafff8;
    text-decoration: none;
    transition: box-shadow .25s ease, transform .25s ease, border-color .25s ease, color .25s ease;
  }

  .user-info:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 22px var(--ray-shadow), inset 0 0 0 0.8px rgba(255, 255, 255, 0.25);
    border-color: var(--ray-accent-2);
    color: #ffffff;
  }

  .user-icon {
    font-size: 16px;
    line-height: 1;
  }

  .user-name {
    font-weight: 500;
  }

  .icon-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border: 1px solid rgba(255, 255, 255, 0.28);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.06);
    color: #eafff8;
    cursor: pointer;
    transition: box-shadow .25s ease, transform .25s ease, border-color .25s ease, color .25s ease;
  }

  .icon-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 22px var(--ray-shadow), inset 0 0 0 0.8px rgba(255, 255, 255, 0.25);
    border-color: var(--ray-accent-2);
    color: #ffffff;
  }

  .logout-icon { opacity: 0.9; }
  .logout-text { display: inline-block; }

  @media (max-width: 640px) {
    .logout-text { display: none; }
    .user-name { display: none; }
  }

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: transform 0.3s, box-shadow .25s ease;
    box-shadow: 0 0 0 0 var(--ray-shadow);
    
    &:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 16px var(--ray-shadow);
    }
  }

  .points {
    color: #fff;
    opacity: 0.9;
    .dot { margin-left: 6px; font-size: 0.9em; opacity: 0.9; }
  }
}

.btn {
  border: 1px solid rgba(255, 255, 255, 0.28);
  color: #eafff8;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 10px;
  padding: 8px 14px;
  transition: box-shadow .25s ease, transform .25s ease, border-color .25s ease, color .25s ease;
}

.btn.glow:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 22px var(--ray-shadow), inset 0 0 0 0.8px rgba(255, 255, 255, 0.25);
  border-color: var(--ray-accent-2);
  color: #ffffff;
}

.btn-primary {
  background: linear-gradient(135deg, var(--ray-accent-2), var(--ray-accent-1));
  border-color: var(--ray-accent-2);
  color: var(--text);
}

.btn-primary.glow:hover {
  color: var(--text);
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes shimmer {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style>