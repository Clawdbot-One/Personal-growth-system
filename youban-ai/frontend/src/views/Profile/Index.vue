<template>
  <AppLayout>
    <div class="profile-page">
      <!-- 用户信息卡片 -->
      <section class="user-card card">
        <div class="user-header">
          <el-avatar :size="72" icon="UserFilled" class="user-avatar" />
          <div class="user-info">
            <div class="user-name-row">
              <h2>{{ userStore.user?.nickname || '用户' }}</h2>
              <el-tag :type="memberTagType" size="small" effect="dark">
                {{ memberLabel }}
              </el-tag>
            </div>
            <p class="user-join">加入于 {{ userStore.user?.joinDate || '--' }}</p>
            <div class="user-strengths">
              <el-tag
                v-for="s in userStore.user?.strengths?.top5 || []"
                :key="s"
                size="small"
                effect="plain"
                type="warning"
              >{{ s }}</el-tag>
            </div>
          </div>
        </div>
      </section>

      <!-- 数据统计 -->
      <section class="stats-row">
        <div class="stat-card card">
          <div class="stat-icon" style="background: rgba(249, 115, 22, 0.1);">
            <el-icon :size="22" color="#F97316"><Timer /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ userStore.user?.stats?.consecutiveDays || 0 }}</span>
            <span class="stat-label">连续成长天数</span>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon" style="background: rgba(37, 99, 235, 0.1);">
            <el-icon :size="22" color="#2563EB"><Clock /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ userStore.user?.stats?.totalHours || 0 }}</span>
            <span class="stat-label">累计时长(h)</span>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon" style="background: rgba(16, 185, 129, 0.1);">
            <el-icon :size="22" color="#10B981"><CircleCheckFilled /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ userStore.user?.stats?.completedTasks || 0 }}</span>
            <span class="stat-label">完成任务</span>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon" style="background: rgba(245, 158, 11, 0.1);">
            <el-icon :size="22" color="#F59E0B"><TrophyBase /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ userStore.user?.stats?.achievements || 0 }}</span>
            <span class="stat-label">获得成就</span>
          </div>
        </div>
      </section>

      <!-- 菜单列表 -->
      <section class="menu-section card">
        <div class="menu-item" @click="router.push('/profile/archive')">
          <div class="menu-left">
            <div class="menu-icon" style="background: rgba(37, 99, 235, 0.1);">
              <el-icon :size="18" color="#2563EB"><Document /></el-icon>
            </div>
            <span class="menu-label">成长档案</span>
          </div>
          <el-icon class="menu-arrow" color="var(--text-muted)"><ArrowRight /></el-icon>
        </div>
        <div class="menu-item" @click="router.push('/assessment')">
          <div class="menu-left">
            <div class="menu-icon" style="background: rgba(16, 185, 129, 0.1);">
              <el-icon :size="18" color="#10B981"><EditPen /></el-icon>
            </div>
            <span class="menu-label">我的测评</span>
          </div>
          <el-icon class="menu-arrow" color="var(--text-muted)"><ArrowRight /></el-icon>
        </div>
        <div class="menu-item" @click="router.push('/growth')">
          <div class="menu-left">
            <div class="menu-icon" style="background: rgba(249, 115, 22, 0.1);">
              <el-icon :size="18" color="#F97316"><Flag /></el-icon>
            </div>
            <span class="menu-label">我的目标</span>
          </div>
          <el-icon class="menu-arrow" color="var(--text-muted)"><ArrowRight /></el-icon>
        </div>
        <div class="menu-item" @click="router.push('/assistant')">
          <div class="menu-left">
            <div class="menu-icon" style="background: rgba(139, 92, 246, 0.1);">
              <el-icon :size="18" color="#8B5CF6"><ChatDotRound /></el-icon>
            </div>
            <span class="menu-label">对话历史</span>
          </div>
          <el-icon class="menu-arrow" color="var(--text-muted)"><ArrowRight /></el-icon>
        </div>
        <div class="menu-item" @click="router.push('/practice')">
          <div class="menu-left">
            <div class="menu-icon" style="background: rgba(245, 158, 11, 0.1);">
              <el-icon :size="18" color="#F59E0B"><Collection /></el-icon>
            </div>
            <span class="menu-label">实践成果</span>
          </div>
          <el-icon class="menu-arrow" color="var(--text-muted)"><ArrowRight /></el-icon>
        </div>
        <div class="menu-item" @click="router.push('/profile/settings')">
          <div class="menu-left">
            <div class="menu-icon" style="background: rgba(100, 116, 139, 0.1);">
              <el-icon :size="18" color="#64748B"><Setting /></el-icon>
            </div>
            <span class="menu-label">设置</span>
          </div>
          <el-icon class="menu-arrow" color="var(--text-muted)"><ArrowRight /></el-icon>
        </div>
      </section>

      <!-- 升级会员卡片 -->
      <section class="upgrade-card card">
        <div class="upgrade-bg">
          <div class="upgrade-content">
            <div class="upgrade-left">
              <span class="upgrade-icon">👑</span>
              <div>
                <h3>升级为高级会员</h3>
                <p>解锁更多专属功能与AI辅导</p>
              </div>
            </div>
            <el-button type="warning" round size="large">
              立即升级
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>
      </section>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import AppLayout from '@/components/layout/AppLayout.vue'

const router = useRouter()
const userStore = useUserStore()

const memberLabel = computed(() => {
  const map = { free: '免费版', pro: '高级版', vip: 'VIP会员' }
  return map[userStore.user?.memberLevel] || '免费版'
})

const memberTagType = computed(() => {
  const map = { free: 'info', pro: 'warning', vip: 'danger' }
  return map[userStore.user?.memberLevel] || 'info'
})
</script>

<style scoped>
.profile-page {
  max-width: 720px;
  margin: 0 auto;
}

/* 用户卡片 */
.user-card {
  padding: 28px;
  margin-bottom: 20px;
}
.user-header {
  display: flex;
  align-items: center;
  gap: 20px;
}
.user-avatar {
  flex-shrink: 0;
}
.user-info {
  flex: 1;
  min-width: 0;
}
.user-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.user-name-row h2 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
}
.user-join {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 10px;
}
.user-strengths {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

/* 统计行 */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
.stat-card {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-info {
  display: flex;
  flex-direction: column;
}
.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}
.stat-label {
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
}

/* 菜单 */
.menu-section {
  padding: 4px 0;
  margin-bottom: 20px;
  overflow: hidden;
}
.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  cursor: pointer;
  transition: var(--transition);
  border-bottom: 1px solid var(--border);
}
.menu-item:last-child {
  border-bottom: none;
}
.menu-item:hover {
  background: rgba(37, 99, 235, 0.03);
}
.menu-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.menu-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.menu-label {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
}

/* 升级卡片 */
.upgrade-card {
  padding: 0;
  overflow: hidden;
  background: linear-gradient(135deg, #1E293B 0%, #334155 100%);
  border: none;
}
.upgrade-bg {
  padding: 24px;
}
.upgrade-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.upgrade-left {
  display: flex;
  align-items: center;
  gap: 14px;
  color: #fff;
}
.upgrade-icon {
  font-size: 32px;
}
.upgrade-left h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}
.upgrade-left p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

/* 响应式 */
@media (max-width: 768px) {
  .user-card {
    padding: 20px;
  }
  .user-header {
    gap: 14px;
  }
  .user-avatar {
    --size: 56px;
    width: 56px;
    height: 56px;
  }
  .user-name-row h2 {
    font-size: 18px;
  }
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .upgrade-content {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>