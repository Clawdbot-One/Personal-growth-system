<template>
  <AppLayout>
    <div class="goal-detail" v-if="goal">
      <!-- 返回按钮 -->
      <div class="back-row">
        <el-button :icon="ArrowLeft" text @click="goBack">返回成长总看板</el-button>
      </div>

      <!-- 目标头部 -->
      <div class="goal-header-card">
        <div class="goal-header-top">
          <div class="goal-title-row">
            <h2>{{ goal.name }}</h2>
            <el-tag
              :type="statusTagType(goal.status)"
              size="large"
              round
              effect="plain"
            >
              {{ statusLabel(goal.status) }}
            </el-tag>
          </div>
          <div class="goal-category-row">
            <el-tag type="primary" effect="plain" round size="small">{{ goal.category }}</el-tag>
            <el-tag
              :type="priorityTagType(goal.priority)"
              round
              size="small"
            >
              {{ priorityLabel(goal.priority) }}
            </el-tag>
            <span class="goal-cycle">
              <el-icon :size="14"><Clock /></el-icon>
              {{ goal.cycle }}
            </span>
          </div>
        </div>

        <div class="goal-progress-section">
          <div class="progress-header">
            <span class="progress-label">完成进度</span>
            <span class="progress-percent">{{ goal.progress }}%</span>
          </div>
          <el-progress
            :percentage="goal.progress"
            :stroke-width="10"
            :color="progressColor(goal.progress)"
          />
        </div>

        <p class="goal-desc">{{ goal.desc }}</p>
      </div>

      <div class="detail-grid">
        <!-- 左栏 -->
        <div class="detail-left">
          <!-- 里程碑 -->
          <el-card class="section-card" shadow="never">
            <template #header>
              <div class="section-title">
                <el-icon :size="18" color="#2563EB"><Flag /></el-icon>
                <span>里程碑</span>
              </div>
            </template>
            <el-steps
              v-if="goal.milestones?.length"
              direction="vertical"
              :active="completedMilestoneCount"
              process-status="finish"
              finish-status="success"
            >
              <el-step
                v-for="(m, i) in goal.milestones"
                :key="m.id"
                :title="m.name"
                :description="m.desc"
                :status="m.done ? 'success' : (i === completedMilestoneCount ? 'process' : 'wait')"
              />
            </el-steps>
            <el-empty v-else description="暂无里程碑，去创建吧" :image-size="60" />
          </el-card>

          <!-- AI 推荐路径 -->
          <el-card class="section-card ai-card" shadow="never">
            <template #header>
              <div class="section-title">
                <el-icon :size="18" color="#F97316"><MagicStick /></el-icon>
                <span>AI 推荐路径</span>
              </div>
            </template>
            <div class="ai-path">
              <div class="ai-path-item" v-for="(item, i) in aiRecommendations" :key="i">
                <div class="ai-path-step">{{ i + 1 }}</div>
                <div class="ai-path-content">
                  <strong>{{ item.title }}</strong>
                  <p>{{ item.desc }}</p>
                </div>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 右栏 -->
        <div class="detail-right">
          <!-- 任务列表 -->
          <el-card class="section-card" shadow="never">
            <template #header>
              <div class="section-title">
                <el-icon :size="18" color="#10B981"><List /></el-icon>
                <span>任务列表</span>
                <el-tag size="small" round>
                  {{ goal.tasks?.filter(t => t.done).length || 0 }}/{{ goal.tasks?.length || 0 }}
                </el-tag>
              </div>
            </template>
            <div v-if="goal.tasks?.length" class="task-list">
              <div
                v-for="task in goal.tasks"
                :key="task.id"
                class="task-row"
                :class="{ done: task.done }"
              >
                <el-checkbox
                  :model-value="task.done"
                  @change="toggleTask(task.id)"
                  size="large"
                />
                <div class="task-info">
                  <span class="task-text">{{ task.text }}</span>
                  <span class="task-due">
                    <el-icon :size="12"><Calendar /></el-icon>
                    {{ task.due }}
                  </span>
                </div>
              </div>
            </div>
            <el-empty v-else description="暂无任务" :image-size="60" />
          </el-card>

          <!-- 成果沉淀 -->
          <el-card class="section-card" shadow="never">
            <template #header>
              <div class="section-title">
                <el-icon :size="18" color="#8B5CF6"><TrophyBase /></el-icon>
                <span>成果沉淀</span>
              </div>
            </template>
            <div class="outcome-area">
              <div class="outcome-intro">
                <el-icon :size="28" color="#8B5CF6"><FolderOpened /></el-icon>
                <p>将学习过程中的笔记、项目、证书等成果记录于此，见证成长足迹。</p>
              </div>
              <el-collapse v-if="outcomeEntries.length" class="outcome-collapse">
                <el-collapse-item
                  v-for="entry in outcomeEntries"
                  :key="entry.id"
                  :title="entry.title"
                >
                  <div class="outcome-entry">
                    <p>{{ entry.content }}</p>
                    <span class="outcome-date">{{ entry.date }}</span>
                  </div>
                </el-collapse-item>
              </el-collapse>
              <div v-else class="outcome-empty">
                <el-empty description="还没有成果记录" :image-size="50" />
                <el-button type="primary" plain size="small" :icon="Plus">
                  记录成果
                </el-button>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 未找到目标 -->
    <div v-else class="not-found">
      <el-empty description="目标不存在或已被删除" :image-size="120" />
      <el-button type="primary" :icon="ArrowLeft" @click="goBack">返回成长总看板</el-button>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGrowthStore } from '@/stores/growth'
import AppLayout from '@/components/layout/AppLayout.vue'

const route = useRoute()
const router = useRouter()
const growthStore = useGrowthStore()

const goal = computed(() => {
  const id = Number(route.params.id)
  return growthStore.goals.find(g => g.id === id) || null
})

const completedMilestoneCount = computed(() => {
  if (!goal.value?.milestones) return 0
  return goal.value.milestones.filter(m => m.done).length
})

const outcomeEntries = ref([
  {
    id: 1,
    title: '学习笔记 - 演讲结构设计',
    content: '整理了演讲的黄金结构：开场（引发兴趣）→ 主体（3个要点）→ 结尾（行动号召）。掌握了SCQA、PREP等经典框架。',
    date: '2026-06-25',
  },
])

const aiRecommendations = computed(() => {
  if (!goal.value) return []
  return [
    {
      title: '阶段一：夯实基础',
      desc: `根据你的优势画像，建议先从${goal.value.category === '习惯养成' ? '建立微习惯' : '系统学习理论知识'}入手，每天投入30分钟。`,
    },
    {
      title: '阶段二：刻意练习',
      desc: '采用"费曼学习法"，将所学内容用自己的话讲给别人听，检验理解深度。',
    },
    {
      title: '阶段三：实战应用',
      desc: '在真实场景中运用所学，记录遇到的问题和解决方案，形成自己的方法论。',
    },
    {
      title: '阶段四：复盘沉淀',
      desc: '定期回顾成长历程，总结经验教训，产出可复用的知识资产。',
    },
  ]
})

function statusTagType(status) {
  const map = { active: 'success', completed: 'info', paused: 'warning' }
  return map[status] || 'info'
}

function statusLabel(status) {
  const map = { active: '进行中', completed: '已完成', paused: '已暂停' }
  return map[status] || status
}

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

function toggleTask(taskId) {
  if (goal.value) {
    growthStore.toggleTask(goal.value.id, taskId)
  }
}

function goBack() {
  router.push('/growth')
}
</script>

<style scoped>
.goal-detail {
  max-width: 1100px;
  margin: 0 auto;
}

.back-row {
  margin-bottom: 16px;
}

/* 目标头部卡片 */
.goal-header-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: var(--shadow);
}
.goal-header-top {
  margin-bottom: 20px;
}
.goal-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.goal-title-row h2 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}
.goal-category-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.goal-cycle {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-secondary);
}
.goal-progress-section {
  margin-bottom: 16px;
}
.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
.progress-label {
  font-size: 13px;
  color: var(--text-secondary);
}
.progress-percent {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary);
}
.goal-desc {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

/* 主体网格 */
.detail-grid {
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
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

/* AI 推荐卡片 */
.ai-card {
  border-color: rgba(249, 115, 22, 0.15);
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.02) 0%, rgba(37, 99, 235, 0.02) 100%);
}
.ai-path {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.ai-path-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.ai-path-step {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}
.ai-path-content strong {
  font-size: 14px;
  color: var(--text-primary);
  display: block;
  margin-bottom: 2px;
}
.ai-path-content p {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

/* 任务列表 */
.task-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.task-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  transition: var(--transition);
}
.task-row:hover {
  background: rgba(37, 99, 235, 0.04);
}
.task-row.done .task-text {
  text-decoration: line-through;
  color: var(--text-muted);
}
.task-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.task-text {
  font-size: 14px;
  color: var(--text-primary);
}
.task-due {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-muted);
}

/* 成果沉淀 */
.outcome-area {
  text-align: center;
}
.outcome-intro {
  padding: 10px 0 16px;
}
.outcome-intro p {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 10px 0 0;
}
.outcome-collapse {
  text-align: left;
}
.outcome-entry p {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 8px;
}
.outcome-date {
  font-size: 12px;
  color: var(--text-muted);
}
.outcome-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

/* 未找到 */
.not-found {
  text-align: center;
  padding: 80px 20px;
}
.not-found .el-button {
  margin-top: 16px;
}

/* 响应式 */
@media (max-width: 900px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .goal-header-card {
    padding: 18px;
  }
  .goal-title-row h2 {
    font-size: 18px;
  }
}
</style>