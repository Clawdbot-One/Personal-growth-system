<template>
  <div class="user-center">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="welcome-content">
        <span class="welcome-icon">👋</span>
        <div class="welcome-text">
          <h3>你好，{{ userStore.user?.nickname || '用户' }}</h3>
          <p>继续你的成长之旅，今天又进步了一点</p>
        </div>
      </div>
      <el-button text class="logout-btn" @click="handleLogout">
        <el-icon><SwitchButton /></el-icon> 退出登录
      </el-button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon stat-icon--blue">
          <el-icon :size="22"><Calendar /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ userStore.user?.stats?.consecutiveDays || 0 }}</span>
          <span class="stat-label">连续成长天数</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon--green">
          <el-icon :size="22"><Timer /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ userStore.user?.stats?.totalHours || 0 }}h</span>
          <span class="stat-label">累计学习时长</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon--orange">
          <el-icon :size="22"><Checked /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ userStore.user?.stats?.completedTasks || 0 }}</span>
          <span class="stat-label">完成任务数</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon--purple">
          <el-icon :size="22"><TrophyBase /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ userStore.user?.stats?.achievements || 0 }}</span>
          <span class="stat-label">获得成就数</span>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- 左栏 -->
      <div class="dashboard-left">
        <!-- 优势画像 -->
        <el-card class="section-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">优势画像</span>
              <router-link to="/assessment" class="card-link">查看详情 →</router-link>
            </div>
          </template>
          <div class="strength-list">
            <div
              v-for="(s, i) in (userStore.user?.strengths?.top5 || [])"
              :key="s"
              class="strength-item"
              :style="{ borderLeftColor: ['#2563EB','#10B981','#F59E0B','#8B5CF6','#EC4899'][i] }"
            >
              <span class="strength-rank">#{{ i + 1 }}</span>
              <span class="strength-name">{{ s }}</span>
            </div>
          </div>
        </el-card>

        <!-- 测评记录 -->
        <el-card class="section-card" shadow="never" v-if="assessmentStore.reports.length > 0">
          <template #header>
            <div class="card-header">
              <span class="card-title">测评记录</span>
              <router-link to="/assessment" class="card-link">查看全部 →</router-link>
            </div>
          </template>
          <div class="assessment-mini-list">
            <div
              v-for="r in assessmentStore.reports.slice(0, 3)"
              :key="r.id"
              class="assessment-mini-item"
              @click="$router.push(`/assessment/report/${r.id}`)"
            >
              <div class="am-left">
                <span class="am-type" :style="{ background: getTypeColor(r.type) }">
                  {{ getTypeLabel(r.type) }}
                </span>
                <span class="am-date">{{ formatDate(r.createdAt) }}</span>
              </div>
              <div class="am-scores">
                <span class="am-score">天赋 {{ r.scores?.talent || 0 }}</span>
                <span class="am-score">技能 {{ r.scores?.skill || 0 }}</span>
                <span class="am-score">性格 {{ r.scores?.character || 0 }}</span>
                <span class="am-score">价值观 {{ r.scores?.value || 0 }}</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 今日推荐 -->
        <el-card class="section-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">今日推荐</span>
            </div>
          </template>
          <div class="recommend-list">
            <div v-for="rec in recommendations" :key="rec.id" class="recommend-item">
              <div class="rec-info">
                <el-tag :type="rec.type === 'practice' ? 'success' : rec.type === 'goal' ? 'warning' : 'info'" size="small">
                  {{ rec.type === 'practice' ? '实践' : rec.type === 'goal' ? '目标' : rec.type === 'topic' ? '议题' : '职业' }}
                </el-tag>
                <div class="rec-title">{{ rec.title }}</div>
                <div class="rec-desc" v-if="rec.description">{{ rec.description }}</div>
              </div>
              <div class="rec-actions">
                <span class="rec-match">匹配 {{ rec.matchScore }}%</span>
                <el-button text type="primary" size="small" @click="acceptRec(rec.id)">采纳</el-button>
              </div>
            </div>
            <el-empty v-if="recommendations.length === 0" description="暂无推荐" :image-size="60" />
          </div>
        </el-card>
      </div>

      <!-- 右栏 -->
      <div class="dashboard-right">
        <!-- 快捷入口 -->
        <el-card class="section-card" shadow="never">
          <template #header>
            <span class="card-title">快捷入口</span>
          </template>
          <div class="quick-links">
            <router-link to="/assessment" class="quick-link">
              <div class="ql-icon" style="background: rgba(37,99,235,0.1);">
                <el-icon :size="20" color="#2563EB"><EditPen /></el-icon>
              </div>
              <div class="ql-text">
                <span class="ql-title">优势测评</span>
                <span class="ql-desc">发现天赋</span>
              </div>
            </router-link>
            <router-link to="/growth" class="quick-link">
              <div class="ql-icon" style="background: rgba(16,185,129,0.1);">
                <el-icon :size="20" color="#10B981"><TrendCharts /></el-icon>
              </div>
              <div class="ql-text">
                <span class="ql-title">成长路径</span>
                <span class="ql-desc">追踪进度</span>
              </div>
            </router-link>
            <router-link to="/assistant" class="quick-link">
              <div class="ql-icon" style="background: rgba(245,158,11,0.1);">
                <el-icon :size="20" color="#F59E0B"><ChatDotRound /></el-icon>
              </div>
              <div class="ql-text">
                <span class="ql-title">AI 助手</span>
                <span class="ql-desc">智能咨询</span>
              </div>
            </router-link>
            <router-link to="/practice" class="quick-link">
              <div class="ql-icon" style="background: rgba(139,92,246,0.1);">
                <el-icon :size="20" color="#8B5CF6"><Collection /></el-icon>
              </div>
              <div class="ql-text">
                <span class="ql-title">实践库</span>
                <span class="ql-desc">优势落地</span>
              </div>
            </router-link>
            <router-link to="/deliberate-practice" class="quick-link">
              <div class="ql-icon" style="background: rgba(14,165,233,0.1);">
                <el-icon :size="20" color="#0EA5E9"><Aim /></el-icon>
              </div>
              <div class="ql-text">
                <span class="ql-title">刻意练习</span>
                <span class="ql-desc">科学训练</span>
              </div>
            </router-link>
            <router-link to="/profile" class="quick-link">
              <div class="ql-icon" style="background: rgba(236,72,153,0.1);">
                <el-icon :size="20" color="#EC4899"><UserFilled /></el-icon>
              </div>
              <div class="ql-text">
                <span class="ql-title">个人中心</span>
                <span class="ql-desc">管理信息</span>
              </div>
            </router-link>
            <router-link to="/profile/settings" class="quick-link">
              <div class="ql-icon" style="background: rgba(107,114,128,0.1);">
                <el-icon :size="20" color="#6B7280"><Setting /></el-icon>
              </div>
              <div class="ql-text">
                <span class="ql-title">账号设置</span>
                <span class="ql-desc">安全隐私</span>
              </div>
            </router-link>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useAssessmentStore } from '@/stores/assessment'
import { useRouter } from 'vue-router'
import request from '@/api/request.js'

const userStore = useUserStore()
const assessmentStore = useAssessmentStore()
const router = useRouter()
const recommendations = ref([])

onMounted(async () => {
  await userStore.fetchProfile()
  assessmentStore.fetchReports()
  try {
    const res = await request.get('/recommendations')
    if (res.code === 0) recommendations.value = res.data.slice(0, 4)
  } catch { /* ignore */ }
})

async function acceptRec(id) {
  try {
    await request.post(`/recommendations/${id}/accept`)
    ElMessage.success('已采纳')
    recommendations.value = recommendations.value.filter(r => r.id !== id)
  } catch { /* ignore */ }
}

function handleLogout() {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/')
}

function getTypeLabel(type) {
  const map = { quick: '快速版', full: '完整版', interview: '访谈版' }
  return map[type] || type
}

function getTypeColor(type) {
  const map = { quick: '#2563EB', full: '#7C3AED', interview: '#F97316' }
  return map[type] || '#2563EB'
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<style scoped>
.user-center {
  max-width: 1200px;
  margin: 0 auto;
}

/* 欢迎横幅 */
.welcome-banner {
  background: linear-gradient(135deg, rgba(37,99,235,0.06), rgba(124,58,237,0.06));
  border: 1px solid rgba(37,99,235,0.1);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.welcome-content {
  display: flex;
  align-items: center;
  gap: 16px;
}
.welcome-icon {
  font-size: 36px;
}
.welcome-text h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary, #303133);
  margin: 0 0 4px;
}
.welcome-text p {
  font-size: 14px;
  color: var(--text-muted, #909399);
  margin: 0;
}
.logout-btn {
  color: #909399;
  flex-shrink: 0;
}
.logout-btn:hover {
  color: #f56c6c;
}

/* 统计卡片 */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}
.stat-card {
  background: var(--bg-card, #fff);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1px solid var(--border, #e4e7ed);
}
.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-icon--blue { background: rgba(37,99,235,0.1); color: #2563EB; }
.stat-icon--green { background: rgba(16,185,129,0.1); color: #10B981; }
.stat-icon--orange { background: rgba(245,158,11,0.1); color: #F59E0B; }
.stat-icon--purple { background: rgba(139,92,246,0.1); color: #8B5CF6; }
.stat-info { flex: 1; }
.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary, #303133);
  line-height: 1.2;
}
.stat-label {
  font-size: 13px;
  color: var(--text-muted, #909399);
}

/* 仪表盘网格 */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 20px;
}
.section-card {
  margin-bottom: 20px;
}
.section-card :deep(.el-card__header) {
  padding: 14px 20px;
  border-bottom: 1px solid var(--border, #ebeef5);
}
.section-card :deep(.el-card__body) {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #303133);
}
.card-link {
  font-size: 13px;
  color: #409eff;
  text-decoration: none;
}
.card-link:hover { color: #2563EB; }

/* 优势画像 */
.strength-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.strength-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--bg-primary, #f5f7fa);
  border-radius: 8px;
  border-left: 3px solid;
}
.strength-rank {
  font-size: 12px;
  color: var(--text-muted, #909399);
  min-width: 24px;
}
.strength-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #303133);
}

/* 推荐 */
.recommend-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.recommend-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  background: var(--bg-primary, #f5f7fa);
  border-radius: 8px;
}
.rec-info { flex: 1; min-width: 0; }
.rec-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #303133);
  margin-top: 6px;
}
.rec-desc {
  font-size: 12px;
  color: var(--text-muted, #909399);
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rec-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  margin-left: 12px;
  flex-shrink: 0;
}
.rec-match {
  font-size: 12px;
  color: #10B981;
  font-weight: 600;
}

/* 快捷入口 */
.quick-links {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.quick-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.2s;
}
.quick-link:hover {
  background: var(--bg-primary, #f5f7fa);
}
.ql-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ql-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #303133);
  display: block;
}
.ql-desc {
  font-size: 12px;
  color: var(--text-muted, #909399);
}

/* 测评记录迷你列表 */
.assessment-mini-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.assessment-mini-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  background: var(--bg-primary, #f5f7fa);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.assessment-mini-item:hover {
  background: rgba(37, 99, 235, 0.06);
}
.am-left {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.am-type {
  color: white;
  font-size: 12px;
  font-weight: 500;
  padding: 2px 10px;
  border-radius: 12px;
}
.am-date {
  font-size: 12px;
  color: var(--text-muted, #909399);
}
.am-scores {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.am-score {
  font-size: 12px;
  color: var(--text-secondary, #606266);
  background: rgba(255, 255, 255, 0.6);
  padding: 2px 8px;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .stat-card { padding: 14px; }
  .stat-value { font-size: 20px; }
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  .welcome-banner {
    padding: 16px;
  }
  .welcome-icon { font-size: 28px; }
  .welcome-text h3 { font-size: 17px; }
}
</style>