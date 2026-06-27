<template>
  <div class="admin-dashboard">
    <div class="page-header">
      <h2>管理后台</h2>
        <span class="header-date">{{ currentDate }}</span>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card card">
          <div class="stat-icon-wrapper" style="background: rgba(37, 99, 235, 0.1);">
            <el-icon :size="24" color="#2563EB"><UserFilled /></el-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.totalUsers.toLocaleString() }}</span>
            <span class="stat-label">注册用户数</span>
            <span class="stat-change up">
              <el-icon><Top /></el-icon> 12.5%
            </span>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon-wrapper" style="background: rgba(16, 185, 129, 0.1);">
            <el-icon :size="24" color="#10B981"><TrendCharts /></el-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.dailyActive.toLocaleString() }}</span>
            <span class="stat-label">日活跃用户</span>
            <span class="stat-change up">
              <el-icon><Top /></el-icon> 8.3%
            </span>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon-wrapper" style="background: rgba(249, 115, 22, 0.1);">
            <el-icon :size="24" color="#F97316"><EditPen /></el-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.assessmentRate }}%</span>
            <span class="stat-label">测评完成率</span>
            <span class="stat-change up">
              <el-icon><Top /></el-icon> 5.2%
            </span>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon-wrapper" style="background: rgba(245, 158, 11, 0.1);">
            <el-icon :size="24" color="#F59E0B"><Money /></el-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.conversionRate }}%</span>
            <span class="stat-label">付费转化率</span>
            <span class="stat-change down">
              <el-icon><Bottom /></el-icon> 1.8%
            </span>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-row">
        <!-- 用户增长图 -->
        <section class="chart-card card">
          <h3 class="chart-title">用户增长趋势</h3>
          <div class="line-chart">
            <svg viewBox="0 0 400 180" class="chart-svg" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#2563EB" stop-opacity="0.2" />
                  <stop offset="100%" stop-color="#2563EB" stop-opacity="0" />
                </linearGradient>
              </defs>
              <polyline
                :points="userGrowthLine"
                fill="none"
                stroke="#2563EB"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <polygon
                :points="userGrowthArea"
                fill="url(#lineGrad)"
              />
              <circle
                v-for="(pt, idx) in userGrowthDots"
                :key="idx"
                :cx="pt.x"
                :cy="pt.y"
                r="3"
                fill="#2563EB"
                stroke="#fff"
                stroke-width="2"
              />
            </svg>
            <div class="chart-labels">
              <span v-for="m in months" :key="m">{{ m }}</span>
            </div>
          </div>
        </section>

        <!-- 测评分布 -->
        <section class="chart-card card">
          <h3 class="chart-title">测评类型分布</h3>
          <div class="pie-chart-simple">
            <div class="pie-legend">
              <div class="legend-item">
                <span class="legend-dot" style="background: #2563EB;"></span>
                <span class="legend-text">快速版</span>
                <span class="legend-value">45%</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot" style="background: #F97316;"></span>
                <span class="legend-text">完整版</span>
                <span class="legend-value">35%</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot" style="background: #10B981;"></span>
                <span class="legend-text">访谈版</span>
                <span class="legend-value">20%</span>
              </div>
            </div>
            <div class="pie-visual">
              <svg viewBox="0 0 120 120" class="pie-svg">
                <circle cx="60" cy="60" r="45" fill="none" stroke="#E2E8F0" stroke-width="20" />
                <circle cx="60" cy="60" r="45" fill="none" stroke="#2563EB" stroke-width="20"
                  stroke-dasharray="254.47 282.74" stroke-dashoffset="0" transform="rotate(-90 60 60)" />
                <circle cx="60" cy="60" r="45" fill="none" stroke="#F97316" stroke-width="20"
                  stroke-dasharray="197.92 282.74" stroke-dashoffset="-254.47" transform="rotate(-90 60 60)" />
                <circle cx="60" cy="60" r="45" fill="none" stroke="#10B981" stroke-width="20"
                  stroke-dasharray="113.10 282.74" stroke-dashoffset="-452.39" transform="rotate(-90 60 60)" />
              </svg>
            </div>
          </div>
        </section>
      </div>

      <!-- 快捷入口 -->
      <section class="quick-links card">
        <h3 class="chart-title">快捷管理</h3>
        <div class="links-grid">
          <div class="link-card" @click="router.push('/admin/users')">
            <el-icon :size="22" color="#2563EB"><UserFilled /></el-icon>
            <span>用户管理</span>
          </div>
          <div class="link-card" @click="router.push('/admin/content')">
            <el-icon :size="22" color="#F97316"><Document /></el-icon>
            <span>内容管理</span>
          </div>
          <div class="link-card" @click="router.push('/admin/system')">
            <el-icon :size="22" color="#10B981"><Setting /></el-icon>
            <span>系统配置</span>
          </div>
          <div class="link-card" @click="router.push('/admin/users')">
            <el-icon :size="22" color="#8B5CF6"><DataAnalysis /></el-icon>
            <span>数据报表</span>
          </div>
        </div>
      </section>

      <!-- 最近活动 -->
      <section class="activity-section card">
        <h3 class="chart-title">最近用户活动</h3>
        <el-table :data="recentActivities" style="width: 100%" stripe>
          <el-table-column prop="user" label="用户" min-width="140">
            <template #default="{ row }">
              <div class="table-user">
                <el-avatar :size="28" icon="UserFilled" />
                <span>{{ row.user }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="action" label="行为" min-width="120">
            <template #default="{ row }">
              <el-tag :type="row.actionType" size="small" effect="plain">{{ row.action }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="detail" label="详情" min-width="180" show-overflow-tooltip />
          <el-table-column prop="time" label="时间" width="160" />
        </el-table>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
})

const stats = ref({
  totalUsers: 12850,
  dailyActive: 3256,
  assessmentRate: 78,
  conversionRate: 12.5,
})

const months = ['1月', '2月', '3月', '4月', '5月', '6月']

const userGrowthData = [8000, 9200, 9800, 10500, 11500, 12850]
const userGrowthDots = computed(() => {
  const maxVal = Math.max(...userGrowthData)
  const padding = 30
  const w = 400 - padding * 2
  const h = 180 - padding * 2
  return userGrowthData.map((v, i) => ({
    x: padding + (i / (userGrowthData.length - 1)) * w,
    y: h + padding - (v / maxVal) * h,
  }))
})
const userGrowthLine = computed(() => {
  return userGrowthDots.value.map(d => `${d.x},${d.y}`).join(' ')
})
const userGrowthArea = computed(() => {
  const dots = userGrowthDots.value
  const padding = 30
  const h = 180 - padding
  return `${dots[0].x},${h + padding} ${dots.map(d => `${d.x},${d.y}`).join(' ')} ${dots[dots.length - 1].x},${h + padding}`
})

const recentActivities = ref([
  { user: '探索者小明', action: '完成测评', actionType: 'success', detail: '完成专业完整版优势测评', time: '2026-06-27 14:30' },
  { user: '职场达人李', action: '实践打卡', actionType: 'warning', detail: '项目管理实战第3天打卡', time: '2026-06-27 12:15' },
  { user: '学习狂人王', action: '注册', actionType: '', detail: '新用户注册', time: '2026-06-27 10:22' },
  { user: '副业探索者', action: '升级会员', actionType: 'danger', detail: '升级为高级会员', time: '2026-06-27 09:08' },
  { user: '成长青年', action: '对话', actionType: 'info', detail: '与AI助手进行职业规划对话', time: '2026-06-26 22:45' },
])
</script>

<style scoped>
.admin-dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.page-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
}
.header-date {
  font-size: 13px;
  color: var(--text-muted);
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.stat-card {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.stat-icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-content {
  display: flex;
  flex-direction: column;
}
.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}
.stat-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 4px;
}
.stat-change {
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 2px;
}
.stat-change.up {
  color: #10B981;
}
.stat-change.down {
  color: #EF4444;
}

/* 图表 */
.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}
.chart-card {
  padding: 20px;
}
.chart-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}
.line-chart {
  width: 100%;
}
.chart-svg {
  width: 100%;
  height: 180px;
}
.chart-labels {
  display: flex;
  justify-content: space-between;
  padding: 0 30px;
  margin-top: 4px;
}
.chart-labels span {
  font-size: 11px;
  color: var(--text-muted);
}

/* 饼图 */
.pie-chart-simple {
  display: flex;
  align-items: center;
  gap: 24px;
  justify-content: center;
}
.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
}
.legend-text {
  font-size: 13px;
  color: var(--text-secondary);
  min-width: 48px;
}
.legend-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}
.pie-svg {
  width: 120px;
  height: 120px;
}

/* 快捷入口 */
.quick-links {
  padding: 20px;
  margin-bottom: 24px;
}
.links-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.link-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 18px;
  border-radius: var(--radius-sm);
  background: rgba(37, 99, 235, 0.03);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: var(--transition);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}
.link-card:hover {
  border-color: var(--primary);
  background: rgba(37, 99, 235, 0.06);
  color: var(--primary);
}

/* 活动表格 */
.activity-section {
  padding: 20px;
}
.table-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 响应式 */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .charts-row {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .links-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .pie-chart-simple {
    flex-direction: column;
  }
}
</style>