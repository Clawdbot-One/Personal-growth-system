<template>
  <div class="app-layout" :class="{ 'mobile-view': isMobile }">
    <!-- PC 侧边导航 -->
    <aside class="sidebar hide-mobile" v-if="!isMobile">
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-icon">✨</span>
          <span class="logo-text">优伴AI</span>
        </div>
        <p class="logo-slogan">发现天赋优势，精准高效成长</p>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/home" class="nav-item" active-class="active">
          <el-icon><HomeFilled /></el-icon>
          <span>用户中心</span>
        </router-link>
        <router-link to="/assessment" class="nav-item" active-class="active">
          <el-icon><EditPen /></el-icon>
          <span>优势测评</span>
        </router-link>
        <router-link to="/growth" class="nav-item" active-class="active">
          <el-icon><TrendCharts /></el-icon>
          <span>成长路径</span>
        </router-link>
        <router-link to="/assistant" class="nav-item" active-class="active">
          <el-icon><ChatDotRound /></el-icon>
          <span>AI助手</span>
        </router-link>
        <router-link to="/practice" class="nav-item" active-class="active">
          <el-icon><Collection /></el-icon>
          <span>实践库</span>
        </router-link>
        <router-link to="/profile" class="nav-item" active-class="active">
          <el-icon><UserFilled /></el-icon>
          <span>个人中心</span>
        </router-link>
        <router-link v-if="userStore.user?.memberLevel === 'admin'" to="/admin" class="nav-item admin-nav" active-class="active">
          <el-icon><Setting /></el-icon>
          <span>后台管理</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <div class="user-mini" @click="$router.push('/profile')">
          <el-avatar :size="36" icon="UserFilled" />
          <div class="user-info">
            <span class="user-name">{{ userStore.user?.nickname || '用户' }}</span>
            <span class="user-level">{{ userStore.user?.memberLevel === 'admin' ? '系统管理员' : userStore.user?.memberLevel === 'vip' ? 'VIP会员' : userStore.user?.memberLevel === 'premium' ? '高级版' : '免费版' }}</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content" :class="{ 'full-width': isMobile }">
      <!-- 移动端顶部导航 -->
      <header class="mobile-header hide-desktop" v-if="isMobile">
        <div class="header-left">
          <span class="logo-icon">✨</span>
          <span class="logo-text">优伴AI</span>
        </div>
        <div class="header-right">
          <el-button circle @click="userStore.toggleTheme()">
            <el-icon><Moon v-if="!userStore.isDark" /><Sunny v-else /></el-icon>
          </el-button>
          <el-avatar :size="32" icon="UserFilled" @click="$router.push('/profile')" />
        </div>
      </header>

      <!-- PC 端头部 -->
      <header class="desktop-header hide-mobile" v-if="!isMobile">
        <div class="header-breadcrumb">
          <h2>{{ pageTitle }}</h2>
        </div>
        <div class="header-actions">
          <el-button circle @click="userStore.toggleTheme()">
            <el-icon><Moon v-if="!userStore.isDark" /><Sunny v-else /></el-icon>
          </el-button>
          <el-dropdown trigger="click">
            <el-avatar :size="34" icon="UserFilled" class="cursor-pointer" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="$router.push('/profile')">
                  <el-icon><UserFilled /></el-icon> 个人中心
                </el-dropdown-item>
                <el-dropdown-item @click="handleLogout" divided>
                  <el-icon><SwitchButton /></el-icon> 退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- 页面内容 -->
      <div class="page-content">
        <slot />
      </div>
    </main>

    <!-- 移动端底部导航 -->
    <nav class="mobile-nav hide-desktop" v-if="isMobile">
      <router-link to="/home" class="tab-item" active-class="active">
        <el-icon><HomeFilled /></el-icon>
        <span>首页</span>
      </router-link>
      <router-link to="/assessment" class="tab-item" active-class="active">
        <el-icon><EditPen /></el-icon>
        <span>测评</span>
      </router-link>
      <router-link to="/growth" class="tab-item" active-class="active">
        <el-icon><TrendCharts /></el-icon>
        <span>成长</span>
      </router-link>
      <router-link to="/assistant" class="tab-item" active-class="active">
        <el-icon><ChatDotRound /></el-icon>
        <span>助手</span>
      </router-link>
      <router-link to="/profile" class="tab-item" active-class="active">
        <el-icon><UserFilled /></el-icon>
        <span>我的</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const isMobile = ref(false)

const pageTitle = computed(() => route.meta.title || '优伴AI')

function handleLogout() {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/')
}

function checkMobile() {
  isMobile.value = window.innerWidth < 769
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary);
}

/* 侧边栏 */
.sidebar {
  width: 240px;
  background: var(--bg-card);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
}
.sidebar-header {
  padding: 24px 20px 16px;
  border-bottom: 1px solid var(--border);
}
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}
.logo-icon {
  font-size: 28px;
}
.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
}
.logo-slogan {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 6px;
  padding-left: 2px;
}
.sidebar-nav {
  flex: 1;
  padding: 12px 8px;
  overflow-y: auto;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  transition: var(--transition);
  margin-bottom: 2px;
}
.nav-item:hover {
  background: rgba(37, 99, 235, 0.06);
  color: var(--primary);
}
.nav-item.active {
  background: rgba(37, 99, 235, 0.1);
  color: var(--primary);
  font-weight: 600;
}
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border);
}
.user-mini {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition);
}
.user-mini:hover {
  background: rgba(37, 99, 235, 0.06);
}
.user-name {
  font-size: 14px;
  font-weight: 500;
}
.user-level {
  font-size: 12px;
  color: var(--text-muted);
  display: block;
}

/* 主内容区 */
.main-content {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.main-content.full-width {
  margin-left: 0;
}
.desktop-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 50;
}
.desktop-header h2 {
  font-size: 20px;
  font-weight: 600;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.notice-badge {
  margin-top: 0;
}

/* 移动端头部 */
.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 50;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 页面内容 */
.page-content {
  flex: 1;
  padding: 24px;
  padding-bottom: 80px;
}

/* 移动端底部导航 */
.mobile-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: var(--bg-card);
  border-top: 1px solid var(--border);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 8px 0;
  padding-bottom: max(8px, env(safe-area-inset-bottom));
}
.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 10px;
  min-width: 56px;
  transition: var(--transition);
}
.tab-item.active {
  color: var(--primary);
}
.tab-item .el-icon {
  font-size: 22px;
}

@media (max-width: 768px) {
  .page-content {
    padding: 16px;
    padding-bottom: 90px;
  }
}
</style>