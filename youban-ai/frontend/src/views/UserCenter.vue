<template>
  <div class="user-center">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="welcome-text">
        <h2>你好，{{ userStore.user?.nickname || '用户' }} 👋</h2>
        <p>继续你的成长之旅，今天又进步了一点</p>
      </div>
      <div class="welcome-stats">
        <div class="mini-stat">
          <span class="mini-value">{{ userStore.user?.stats?.consecutiveDays || 0 }}</span>
          <span class="mini-label">连续天数</span>
        </div>
        <div class="mini-stat">
          <span class="mini-value">{{ userStore.user?.stats?.totalHours || 0 }}h</span>
          <span class="mini-label">学习时长</span>
        </div>
        <div class="mini-stat">
          <span class="mini-value">{{ userStore.user?.stats?.completedTasks || 0 }}</span>
          <span class="mini-label">完成任务</span>
        </div>
      </div>
    </div>

    <!-- 优势画像 -->
    <div class="section-header">
      <h3>优势画像</h3>
      <router-link to="/assessment" class="section-link">查看详情 →</router-link>
    </div>
    <div class="strength-grid">
      <div
        v-for="(s, i) in (userStore.user?.strengths?.top5 || [])"
        :key="s"
        class="strength-card"
        :style="{ borderTopColor: ['#2563EB','#10B981','#F59E0B','#8B5CF6','#EC4899'][i] }"
      >
        <div class="strength-rank">#{{ i + 1 }}</div>
        <div class="strength-name">{{ s }}</div>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="section-header">
      <h3>快捷入口</h3>
    </div>
    <div class="quick-actions">
      <router-link to="/assessment" class="action-card">
        <el-icon :size="28" color="#2563EB"><EditPen /></el-icon>
        <span class="action-title">优势测评</span>
        <span class="action-desc">发现你的天赋</span>
      </router-link>
      <router-link to="/growth" class="action-card">
        <el-icon :size="28" color="#10B981"><TrendCharts /></el-icon>
        <span class="action-title">成长路径</span>
        <span class="action-desc">追踪成长进度</span>
      </router-link>
      <router-link to="/assistant" class="action-card">
        <el-icon :size="28" color="#F59E0B"><ChatDotRound /></el-icon>
        <span class="action-title">AI 助手</span>
        <span class="action-desc">智能咨询建议</span>
      </router-link>
      <router-link to="/practice" class="action-card">
        <el-icon :size="28" color="#8B5CF6"><Collection /></el-icon>
        <span class="action-title">实践库</span>
        <span class="action-desc">巩固优势落地</span>
      </router-link>
      <router-link to="/profile/archive" class="action-card">
        <el-icon :size="28" color="#EC4899"><Clock /></el-icon>
        <span class="action-title">成长档案</span>
        <span class="action-desc">全周期记录</span>
      </router-link>
      <router-link to="/profile/settings" class="action-card">
        <el-icon :size="28" color="#6B7280"><Setting /></el-icon>
        <span class="action-title">账号设置</span>
        <span class="action-desc">管理个人信息</span>
      </router-link>
    </div>

    <!-- 今日推荐 -->
    <div class="section-header">
      <h3>今日推荐</h3>
    </div>
    <div class="recommend-grid">
      <div v-for="rec in recommendations" :key="rec.id" class="recommend-card">
        <div class="rec-type">
          <el-tag :type="rec.type === 'practice' ? 'success' : rec.type === 'goal' ? 'warning' : 'info'" size="small">
            {{ rec.type === 'practice' ? '实践' : rec.type === 'goal' ? '目标' : rec.type === 'topic' ? '议题' : '职业' }}
          </el-tag>
        </div>
        <h4>{{ rec.title }}</h4>
        <p v-if="rec.description">{{ rec.description }}</p>
        <div class="rec-footer">
          <span class="rec-match">匹配度 {{ rec.matchScore }}%</span>
          <el-button text type="primary" size="small" @click="acceptRec(rec.id)">采纳</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import request from '@/api/request.js'

const userStore = useUserStore()
const recommendations = ref([])

onMounted(async () => {
  await userStore.fetchProfile()
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
</script>

<style scoped>
.user-center {
  max-width: 960px;
  margin: 0 auto;
}

.welcome-banner {
  background: linear-gradient(135deg, #2563EB, #7C3AED);
  border-radius: 16px;
  padding: 32px;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.welcome-text h2 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px;
}

.welcome-text p {
  margin: 0;
  opacity: 0.85;
  font-size: 14px;
}

.welcome-stats {
  display: flex;
  gap: 24px;
}

.mini-stat {
  text-align: center;
  background: rgba(255,255,255,0.15);
  border-radius: 12px;
  padding: 12px 20px;
  backdrop-filter: blur(10px);
}

.mini-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
}

.mini-label {
  font-size: 12px;
  opacity: 0.8;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  margin-top: 28px;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.section-link {
  font-size: 13px;
  color: #409eff;
  text-decoration: none;
}

.strength-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.strength-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  border-top: 3px solid;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.strength-rank {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.strength-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 20px 12px;
  background: #fff;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.action-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.action-desc {
  font-size: 12px;
  color: #909399;
}

.recommend-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.recommend-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.recommend-card h4 {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin: 10px 0 6px;
}

.recommend-card p {
  font-size: 13px;
  color: #909399;
  margin: 0;
}

.rec-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.rec-match {
  font-size: 12px;
  color: #10B981;
  font-weight: 600;
}

@media (max-width: 768px) {
  .welcome-banner { flex-direction: column; gap: 16px; }
  .welcome-stats { gap: 12px; }
  .mini-stat { padding: 8px 14px; }
  .mini-value { font-size: 20px; }
  .strength-grid { grid-template-columns: repeat(3, 1fr); }
  .quick-actions { grid-template-columns: repeat(2, 1fr); }
  .recommend-grid { grid-template-columns: 1fr; }
}
</style>