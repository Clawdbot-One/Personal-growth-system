<template>
  <AppLayout>
    <div class="dashboard">
      <!-- 激励语 -->
      <div class="motivation-banner">
        <div class="motivation-content">
          <span class="motivation-icon">🌟</span>
          <div class="motivation-text">
            <h3>每一天的坚持，都是未来的基石</h3>
            <p>你已经连续成长 <strong>{{ userStore.user?.stats?.consecutiveDays || 0 }}</strong> 天，继续保持！</p>
          </div>
        </div>
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
            <span class="stat-value">{{ userStore.user?.stats?.totalHours || 0 }}</span>
            <span class="stat-label">累计成长时长(h)</span>
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
          <!-- 今日待办 -->
          <el-card class="section-card" shadow="never">
            <template #header>
              <div class="section-header">
                <div class="section-title">
                  <el-icon :size="18" color="#F97316"><List /></el-icon>
                  <span>今日待办</span>
                </div>
                <el-tag size="small" type="warning" round>
                  {{ todayUndoneCount }} 项待完成
                </el-tag>
              </div>
            </template>
            <div class="today-tasks" v-if="growthStore.todayTasks.length">
              <div
                v-for="task in growthStore.todayTasks"
                :key="task.id"
                class="task-item"
                :class="{ done: task.done }"
              >
                <el-checkbox v-model="task.done" size="large" />
                <div class="task-content">
                  <span class="task-text">{{ task.text }}</span>
                  <span class="task-goal">{{ task.goal }}</span>
                </div>
              </div>
            </div>
            <el-empty v-else description="暂无待办，享受今天吧！" :image-size="80" />
          </el-card>

          <!-- 本周任务 -->
          <el-card class="section-card" shadow="never">
            <template #header>
              <div class="section-header">
                <div class="section-title">
                  <el-icon :size="18" color="#2563EB"><Date /></el-icon>
                  <span>本周任务</span>
                </div>
              </div>
            </template>
            <el-timeline v-if="weeklyTasks.length">
              <el-timeline-item
                v-for="item in weeklyTasks"
                :key="item.id"
                :timestamp="item.due"
                placement="top"
                :color="item.done ? '#10B981' : '#2563EB'"
              >
                <div class="timeline-task">
                  <span :class="{ 'line-through text-muted': item.done }">{{ item.text }}</span>
                  <el-tag size="small" :type="item.done ? 'success' : 'info'" round>
                    {{ item.done ? '已完成' : '待完成' }}
                  </el-tag>
                </div>
              </el-timeline-item>
            </el-timeline>
            <el-empty v-else description="本周暂无任务" :image-size="80" />
          </el-card>
        </div>

        <!-- 右栏 -->
        <div class="dashboard-right">
          <!-- 活跃目标 -->
          <el-card class="section-card" shadow="never">
            <template #header>
              <div class="section-header">
                <div class="section-title">
                  <el-icon :size="18" color="#2563EB"><Flag /></el-icon>
                  <span>活跃目标</span>
                </div>
                <el-button type="primary" size="small" :icon="Plus" @click="goToCreate">
                  创建新目标
                </el-button>
              </div>
            </template>
            <div v-if="growthStore.goals.length" class="goals-list">
              <div
                v-for="goal in growthStore.goals"
                :key="goal.id"
                class="goal-card"
                @click="goToGoal(goal.id)"
              >
                <div class="goal-header">
                  <div class="goal-name-row">
                    <span class="goal-name">{{ goal.name }}</span>
                    <el-tag
                      :type="priorityTagType(goal.priority)"
                      size="small"
                      round
                    >
                      {{ priorityLabel(goal.priority) }}
                    </el-tag>
                  </div>
                  <el-tag size="small" effect="plain">{{ goal.category }}</el-tag>
                </div>
                <div class="goal-progress">
                  <div class="progress-info">
                    <span class="progress-label">完成进度</span>
                    <span class="progress-value">{{ goal.progress }}%</span>
                  </div>
                  <el-progress
                    :percentage="goal.progress"
                    :stroke-width="8"
                    :color="progressColor(goal.progress)"
                    :show-text="false"
                  />
                </div>
                <div class="goal-meta">
                  <span class="meta-item">
                    <el-icon :size="14"><Clock /></el-icon>
                    {{ goal.cycle }}
                  </span>
                  <span class="meta-item">
                    <el-icon :size="14"><Check /></el-icon>
                    {{ goal.tasks?.filter(t => t.done).length || 0 }}/{{ goal.tasks?.length || 0 }} 任务
                  </span>
                </div>
              </div>
            </div>
            <el-empty v-else description="还没有目标，开始创建你的第一个成长目标吧！" :image-size="80" />
          </el-card>

          <!-- 快速统计图表 -->
          <el-card class="section-card" shadow="never">
            <template #header>
              <div class="section-header">
                <div class="section-title">
                  <el-icon :size="18" color="#F97316"><TrendCharts /></el-icon>
                  <span>本周成长概览</span>
                </div>
              </div>
            </template>
            <v-chart class="chart" :option="chartOption" autoresize />
          </el-card>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useGrowthStore } from '@/stores/growth'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import AppLayout from '@/components/layout/AppLayout.vue'

use([BarChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

const router = useRouter()
const userStore = useUserStore()
const growthStore = useGrowthStore()

const todayUndoneCount = computed(() =>
  growthStore.todayTasks.filter(t => !t.done).length
)

const weeklyTasks = computed(() => {
  const all = []
  growthStore.goals.forEach(g => {
    g.tasks?.forEach(t => {
      all.push({ ...t, goal: g.name })
    })
  })
  return all.sort((a, b) => new Date(a.due) - new Date(b.due))
})

const chartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { bottom: 0, textStyle: { color: '#94A3B8', fontSize: 12 } },
  grid: { left: 10, right: 20, top: 10, bottom: 30 },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    axisLine: { lineStyle: { color: '#E2E8F0' } },
    axisLabel: { color: '#94A3B8', fontSize: 11 },
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: '#F1F5F9' } },
    axisLabel: { color: '#94A3B8', fontSize: 11 },
  },
  series: [
    {
      name: '完成任务',
      type: 'bar',
      data: [3, 5, 2, 4, 6, 3, 2],
      itemStyle: {
        color: '#2563EB',
        borderRadius: [4, 4, 0, 0],
      },
      barWidth: 14,
    },
    {
      name: '学习时长(h)',
      type: 'bar',
      data: [2.5, 4.0, 1.5, 3.0, 5.5, 2.0, 1.5],
      itemStyle: {
        color: '#F97316',
        borderRadius: [4, 4, 0, 0],
      },
      barWidth: 14,
    },
  ],
}))

function priorityTagType(priority) {
  const map = { high: 'danger', medium: 'warning', low: 'info' }
  return map[priority] || 'info'
}

function priorityLabel(priority) {
  const map = { high: '高优先级', medium: '中优先级', low: '低优先级' }
  return map[priority] || priority
}

function progressColor(progress) {
  if (progress >= 80) return '#10B981'
  if (progress >= 50) return '#2563EB'
  return '#F97316'
}

function goToCreate() {
  router.push('/growth/goal/create')
}

function goToGoal(id) {
  router.push(`/growth/goal/${id}`)
}
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

/* 激励语横幅 */
.motivation-banner {
  background: linear-gradient(135deg, #2563EB 0%, #3B82F6 50%, #60A5FA 100%);
  border-radius: var(--radius);
  padding: 20px 24px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(37, 99, 235, 0.25);
}
.motivation-content {
  display: flex;
  align-items: center;
  gap: 16px;
}
.motivation-icon {
  font-size: 36px;
  flex-shrink: 0;
}
.motivation-text h3 {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px;
}
.motivation-text p {
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  margin: 0;
}
.motivation-text strong {
  color: #FCD34D;
}

/* 统计卡片行 */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}
.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: var(--transition);
}
.stat-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
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
.stat-icon--blue {
  background: rgba(37, 99, 235, 0.1);
  color: #2563EB;
}
.stat-icon--green {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
}
.stat-icon--orange {
  background: rgba(249, 115, 22, 0.1);
  color: #F97316;
}
.stat-icon--purple {
  background: rgba(139, 92, 246, 0.1);
  color: #8B5CF6;
}
.stat-info {
  display: flex;
  flex-direction: column;
}
.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}
.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

/* 主体网格 */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start;
}

/* 区域卡片 */
.section-card {
  border-radius: var(--radius);
  border: 1px solid var(--border);
  margin-bottom: 20px;
}
.section-card :deep(.el-card__header) {
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
}
.section-card :deep(.el-card__body) {
  padding: 16px 20px;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

/* 今日待办 */
.today-tasks {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.task-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  transition: var(--transition);
  cursor: pointer;
}
.task-item:hover {
  background: rgba(37, 99, 235, 0.04);
}
.task-item.done .task-text {
  text-decoration: line-through;
  color: var(--text-muted);
}
.task-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.task-text {
  font-size: 14px;
  color: var(--text-primary);
}
.task-goal {
  font-size: 12px;
  color: var(--text-muted);
}

/* 时间线任务 */
.timeline-task {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
}
.timeline-task .line-through {
  text-decoration: line-through;
}
.timeline-task .text-muted {
  color: var(--text-muted);
}

/* 目标列表 */
.goals-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.goal-card {
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition);
}
.goal-card:hover {
  border-color: var(--primary);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
  transform: translateY(-1px);
}
.goal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.goal-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.goal-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}
.goal-progress {
  margin-bottom: 10px;
}
.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}
.progress-label {
  font-size: 12px;
  color: var(--text-muted);
}
.progress-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--primary);
}
.goal-meta {
  display: flex;
  gap: 16px;
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

/* 图表 */
.chart {
  height: 220px;
  width: 100%;
}

/* 响应式 */
@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .stats-row {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .stat-card {
    padding: 14px 16px;
    gap: 10px;
  }
  .stat-value {
    font-size: 20px;
  }
  .motivation-banner {
    padding: 16px 18px;
  }
  .motivation-text h3 {
    font-size: 16px;
  }
}
</style>