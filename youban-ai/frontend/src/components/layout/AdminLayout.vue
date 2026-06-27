<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-icon">✨</span>
          <span class="logo-text">优伴AI</span>
          <span class="badge">管理</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/admin" class="nav-item" exact-active-class="active">
          <el-icon><DataAnalysis /></el-icon>
          <span>仪表盘</span>
        </router-link>
        <router-link to="/admin/users" class="nav-item" active-class="active">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </router-link>
        <router-link to="/admin/accounts" class="nav-item" active-class="active">
          <el-icon><Avatar /></el-icon>
          <span>管理员账号</span>
        </router-link>
        <router-link to="/admin/content" class="nav-item" active-class="active">
          <el-icon><Document /></el-icon>
          <span>内容管理</span>
        </router-link>
        <router-link to="/admin/system" class="nav-item" active-class="active">
          <el-icon><Setting /></el-icon>
          <span>系统配置</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="admin-info">
          <el-avatar :size="32" icon="UserFilled" />
          <div>
            <span class="admin-name">{{ userStore.user?.nickname || '管理员' }}</span>
            <span class="admin-role">系统管理员</span>
          </div>
        </div>
        <div class="footer-actions">
          <router-link to="/home" class="back-link">
            <el-icon><Back /></el-icon>
            <span>返回用户中心</span>
          </router-link>
          <el-button text type="danger" size="small" @click="handleLogout">
            <el-icon><SwitchButton /></el-icon> 退出
          </el-button>
        </div>
      </div>
    </aside>

    <div class="admin-main">
      <header class="admin-topbar">
        <h2>{{ pageTitle }}</h2>
      </header>
      <div class="admin-content">
        <router-view v-slot="{ Component, route: childRoute }">
          <transition name="admin-fade" mode="out-in">
            <component :is="Component" :key="childRoute.path" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const pageTitle = computed(() => route.meta.title || '管理后台')

function handleLogout() {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/')
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f7fa;
}

.admin-sidebar {
  width: 220px;
  background: #fff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: 100;
}

.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 6px;
}

.logo-icon { font-size: 22px; }
.logo-text { font-size: 18px; font-weight: 700; color: #303133; }
.badge {
  font-size: 11px;
  background: #409eff;
  color: #fff;
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: 4px;
}

.sidebar-nav {
  flex: 1;
  padding: 12px 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  color: #606266;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s;
  margin-bottom: 2px;
}

.nav-item:hover { background: #f0f2f5; color: #303133; }
.nav-item.active { background: #ecf5ff; color: #409eff; font-weight: 600; }

.sidebar-footer {
  padding: 12px 8px;
  border-top: 1px solid #f0f0f0;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
}

.admin-name { font-size: 13px; font-weight: 500; display: block; }
.admin-role { font-size: 11px; color: #909399; }

.footer-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 8px 0;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
  text-decoration: none;
}

.back-link:hover { color: #409eff; }

.admin-main {
  flex: 1;
  margin-left: 220px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.admin-topbar {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  position: sticky;
  top: 0;
  z-index: 50;
}

.admin-topbar h2 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.admin-content {
  flex: 1;
  padding: 24px;
}

/* Admin sub-page transitions */
.admin-fade-enter-active,
.admin-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.admin-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.admin-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>