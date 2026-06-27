<template>
  <AppLayout>
    <div class="page-header">
      <h2>刻意练习</h2>
      <p class="subtitle">基于《刻意练习》黄金标准，科学训练你的优势能力</p>
    </div>

    <!-- 仪表盘卡片 -->
    <div class="stats-row">
      <div class="stat-card" v-for="stat in stats" :key="stat.label">
        <div class="stat-icon" :style="{ background: stat.bg }">
          <el-icon :size="20"><component :is="stat.icon" /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
      </div>
    </div>

    <div class="content-grid">
      <!-- 左栏：训练计划 -->
      <div class="main-col">
        <el-card class="section-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">我的训练计划</span>
              <el-button type="primary" size="small" @click="showPlanDialog = true">
                <el-icon><Plus /></el-icon> 新建计划
              </el-button>
            </div>
          </template>

          <div v-if="plans.length === 0" class="empty-state">
            <el-empty description="还没有训练计划，点击上方按钮创建" :image-size="80" />
          </div>

          <div v-for="plan in plans" :key="plan.id" class="plan-item">
            <div class="plan-header">
              <div class="plan-info">
                <el-tag :type="plan.status === 'active' ? 'success' : 'info'" size="small">
                  {{ plan.status === 'active' ? '进行中' : plan.status === 'paused' ? '已暂停' : '已完成' }}
                </el-tag>
                <span class="plan-area">{{ plan.area }}</span>
              </div>
              <div class="plan-actions">
                <el-button text size="small" @click="startPractice(plan)">开始练习</el-button>
                <el-button text size="small" type="warning" v-if="plan.status === 'active'" @click="togglePlanStatus(plan, 'paused')">暂停</el-button>
                <el-button text size="small" type="success" v-if="plan.status === 'paused'" @click="togglePlanStatus(plan, 'active')">恢复</el-button>
              </div>
            </div>
            <h4 class="plan-title">{{ plan.title }}</h4>
            <p class="plan-desc">{{ plan.description }}</p>
            <div class="milestones">
              <div v-for="(m, i) in plan.subGoals" :key="i" class="milestone-item">
                <div class="milestone-dot" :class="{ done: i === 0 }"></div>
                <div class="milestone-info">
                  <span class="milestone-name">{{ m.name }}</span>
                  <span class="milestone-desc">{{ m.description }}</span>
                </div>
                <span class="milestone-days">{{ m.days }}天</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 练习历史 -->
        <el-card class="section-card" shadow="never">
          <template #header>
            <span class="card-title">练习记录</span>
          </template>
          <el-table :data="sessions" style="width: 100%" size="small" v-loading="sessionsLoading">
            <el-table-column prop="goal" label="练习目标" min-width="180" show-overflow-tooltip />
            <el-table-column label="时长" width="80">
              <template #default="{ row }">{{ row.durationMinutes }}分钟</template>
            </el-table-column>
            <el-table-column label="训练区" width="80">
              <template #default="{ row }">
                <el-tag :type="row.difficultyLevel === 'learning' ? 'success' : row.difficultyLevel === 'comfort' ? 'info' : 'danger'" size="small">
                  {{ row.difficultyLevel === 'learning' ? '学习区' : row.difficultyLevel === 'comfort' ? '舒适区' : '恐慌区' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="专注度" width="80">
              <template #default="{ row }">{{ row.focusScore }}</template>
            </el-table-column>
            <el-table-column prop="createdAt" label="时间" width="120" />
          </el-table>
        </el-card>
      </div>

      <!-- 右栏 -->
      <div class="side-col">
        <!-- 练习质量概览 -->
        <el-card class="section-card" shadow="never">
          <template #header>
            <span class="card-title">练习质量</span>
          </template>
          <div v-if="qualityData" class="quality-overview">
            <div class="big-score">{{ qualityData.avgScore }}</div>
            <div class="score-label">近30天平均质量分</div>
            <div class="quality-bars">
              <div class="qbar-item" v-for="bar in qualityBars" :key="bar.label">
                <div class="qbar-label">{{ bar.label }}</div>
                <div class="qbar-track">
                  <div class="qbar-fill" :style="{ width: bar.value + '%', background: bar.color }"></div>
                </div>
                <span class="qbar-value">{{ bar.value }}</span>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无数据" :image-size="60" />
        </el-card>

        <!-- 三区分布 -->
        <el-card class="section-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">训练区分布</span>
              <el-button text size="small" @click="refreshZone('战略思维')">刷新</el-button>
            </div>
          </template>
          <div v-if="zoneData" class="zone-distribution">
            <div class="zone-bar">
              <div class="zone-segment comfort" :style="{ width: zoneData.comfortZoneScore + '%' }" title="舒适区"></div>
              <div class="zone-segment learning" :style="{ width: zoneData.learningZoneScore + '%' }" title="学习区"></div>
              <div class="zone-segment panic" :style="{ width: zoneData.panicZoneScore + '%' }" title="恐慌区"></div>
            </div>
            <div class="zone-legend">
              <span><span class="dot comfort-dot"></span> 舒适区 {{ zoneData.comfortZoneScore }}%</span>
              <span><span class="dot learning-dot"></span> 学习区 {{ zoneData.learningZoneScore }}%</span>
              <span><span class="dot panic-dot"></span> 恐慌区 {{ zoneData.panicZoneScore }}%</span>
            </div>
            <div class="zone-advice" :class="zoneData.currentZone">
              <el-icon><InfoFilled /></el-icon>
              {{ zoneData.suggestion }}
            </div>
          </div>
        </el-card>

        <!-- 快捷入口 -->
        <el-card class="section-card" shadow="never">
          <template #header>
            <span class="card-title">快捷工具</span>
          </template>
          <div class="quick-tools">
            <router-link to="/deliberate-practice/quality" class="tool-link">
              <el-icon><DataAnalysis /></el-icon> 质量评分详情
            </router-link>
            <router-link to="/deliberate-practice/zone" class="tool-link">
              <el-icon><DataLine /></el-icon> 三区难度分析
            </router-link>
            <router-link to="/deliberate-practice/deep" class="tool-link">
              <el-icon><Timer /></el-icon> 深度练习模式
            </router-link>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 新建计划弹窗 -->
    <el-dialog v-model="showPlanDialog" title="创建刻意练习计划" width="500px">
      <el-form :model="planForm" :rules="planRules" ref="planFormRef" label-position="top">
        <el-form-item label="训练领域" prop="area">
          <el-select v-model="planForm.area" placeholder="选择你想提升的能力领域" style="width: 100%">
            <el-option label="战略思维" value="战略思维" />
            <el-option label="学习能力" value="学习能力" />
            <el-option label="沟通表达" value="沟通表达" />
            <el-option label="责任担当" value="责任担当" />
            <el-option label="适应力" value="适应力" />
          </el-select>
        </el-form-item>
        <el-form-item label="训练目标（选填）" prop="goal">
          <el-input v-model="planForm.goal" placeholder="例如：在3个月内达到独立解决复杂战略问题的水平" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPlanDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreatePlan" :loading="creating">生成训练计划</el-button>
      </template>
    </el-dialog>

    <!-- 快速练习弹窗 -->
    <el-dialog v-model="showPracticeDialog" title="开始刻意练习" width="520px" @close="resetPracticeForm">
      <el-form :model="practiceForm" :rules="practiceRules" ref="practiceFormRef" label-position="top">
        <el-form-item label="练习目标" prop="goal">
          <el-input v-model="practiceForm.goal" placeholder="用一句话描述本次练习的具体目标" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="练习内容">
          <el-input v-model="practiceForm.content" type="textarea" :rows="3" placeholder="记录练习的具体内容（选填）" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="练习时长（分钟）">
              <el-input-number v-model="practiceForm.durationMinutes" :min="1" :max="180" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="有效专注时长（分钟）">
              <el-input-number v-model="practiceForm.effectiveMinutes" :min="0" :max="180" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="训练感受">
          <el-radio-group v-model="practiceForm.difficultyLevel">
            <el-radio-button value="comfort">太轻松（舒适区）</el-radio-button>
            <el-radio-button value="learning">有挑战（学习区）</el-radio-button>
            <el-radio-button value="panic">太难了（恐慌区）</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="专注度自评">
          <el-slider v-model="practiceForm.focusScore" :step="10" :max="100" show-input />
        </el-form-item>
        <el-form-item label="练习反思">
          <el-input v-model="practiceForm.reflection" type="textarea" :rows="2" placeholder="这次练习的收获和需要改进的地方" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPracticeDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitPractice" :loading="submitting">
          提交练习记录
        </el-button>
      </template>
    </el-dialog>

    <!-- 反馈结果弹窗 -->
    <el-dialog v-model="showFeedbackDialog" title="练习反馈报告" width="600px">
      <div v-if="lastFeedback" class="feedback-report">
        <div class="feedback-score" :class="scoreClass">
          <span class="big-num">{{ lastQualityScores?.overallScore || 0 }}</span>
          <span class="score-unit">/100</span>
        </div>
        <div class="feedback-section">
          <h4>结果反馈</h4>
          <p>{{ lastFeedback.resultFeedback }}</p>
        </div>
        <div class="feedback-section">
          <h4>过程反馈</h4>
          <p>{{ lastFeedback.processFeedback }}</p>
        </div>
        <div class="feedback-section">
          <h4>策略反馈</h4>
          <p>{{ lastFeedback.strategyFeedback }}</p>
        </div>
        <div class="feedback-section">
          <h4>元反馈</h4>
          <p>{{ lastFeedback.metaFeedback }}</p>
        </div>
        <div v-if="lastFeedback.improvementSuggestions?.length" class="feedback-section">
          <h4>改进建议</h4>
          <div v-for="(s, i) in lastFeedback.improvementSuggestions" :key="i" class="suggestion-item">
            <el-tag size="small">{{ s.dimension }}</el-tag>
            <span>{{ s.action }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showFeedbackDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, DataAnalysis, DataLine, Timer, InfoFilled, TrendCharts, TrophyBase, Checked, Calendar } from '@element-plus/icons-vue'
import request from '@/api/request.js'
import AppLayout from '@/components/layout/AppLayout.vue'

const stats = ref([
  { label: '总练习次数', value: 0, icon: TrendCharts, bg: 'rgba(37,99,235,0.1)' },
  { label: '平均质量分', value: 0, icon: TrophyBase, bg: 'rgba(16,185,129,0.1)' },
  { label: '学习区占比', value: '0%', icon: Checked, bg: 'rgba(245,158,11,0.1)' },
  { label: '最佳专注时段', value: '--', icon: Calendar, bg: 'rgba(139,92,246,0.1)' },
])

const plans = ref([])
const sessions = ref([])
const sessionsLoading = ref(false)
const qualityData = ref(null)
const zoneData = ref(null)

const qualityBars = computed(() => {
  if (!qualityData?.scores?.length) return []
  const recent = qualityData.scores.slice(0, 5)
  const avgGoal = Math.round(recent.reduce((s, r) => s + r.goalClarity, 0) / recent.length)
  const avgComfort = Math.round(recent.reduce((s, r) => s + r.comfortZoneBreak, 0) / recent.length)
  const avgFeedback = Math.round(recent.reduce((s, r) => s + r.feedbackQuality, 0) / recent.length)
  const avgFocus = Math.round(recent.reduce((s, r) => s + r.focusIntensity, 0) / recent.length)
  return [
    { label: '目标明确', value: avgGoal || 0, color: '#2563EB' },
    { label: '走出舒适区', value: avgComfort || 0, color: '#F59E0B' },
    { label: '即时反馈', value: avgFeedback || 0, color: '#10B981' },
    { label: '专注强度', value: avgFocus || 0, color: '#8B5CF6' },
  ]
})

const scoreClass = computed(() => {
  const s = lastQualityScores.value?.overallScore || 0
  if (s >= 85) return 'excellent'
  if (s >= 70) return 'good'
  if (s >= 50) return 'average'
  return 'poor'
})

async function fetchDashboard() {
  try {
    const res = await request.get('/dp/dashboard')
    if (res.code === 0) {
      const d = res.data
      stats.value[0].value = d.totalSessions
      stats.value[1].value = d.avgQualityScore
      stats.value[2].value = d.learningZoneRatio + '%'
      stats.value[3].value = d.focusAnalysis?.bestTimeSlot || '--'
    }
  } catch { /* ignore */ }
}

async function fetchPlans() {
  try {
    const res = await request.get('/dp/plans')
    if (res.code === 0) plans.value = res.data
  } catch { /* ignore */ }
}

async function fetchSessions() {
  sessionsLoading.value = true
  try {
    const res = await request.get('/dp/sessions', { params: { limit: 10 } })
    if (res.code === 0) sessions.value = res.data
  } catch { /* ignore */ }
  finally { sessionsLoading.value = false }
}

async function fetchQuality() {
  try {
    const res = await request.get('/dp/quality')
    if (res.code === 0) qualityData.value = res.data
  } catch { /* ignore */ }
}

async function refreshZone(area) {
  try {
    const res = await request.get(`/dp/zone?area=${encodeURIComponent(area || '战略思维')}`)
    if (res.code === 0) zoneData.value = res.data
  } catch { /* ignore */ }
}

onMounted(() => {
  fetchDashboard()
  fetchPlans()
  fetchSessions()
  fetchQuality()
  refreshZone('战略思维')
})

// 新建计划
const showPlanDialog = ref(false)
const creating = ref(false)
const planFormRef = ref(null)
const planForm = reactive({ area: '', goal: '' })
const planRules = {
  area: [{ required: true, message: '请选择训练领域', trigger: 'change' }],
}

async function handleCreatePlan() {
  const valid = await planFormRef.value.validate().catch(() => false)
  if (!valid) return
  creating.value = true
  try {
    const res = await request.post('/dp/plans', planForm)
    if (res.code === 0) {
      ElMessage.success('训练计划已生成')
      showPlanDialog.value = false
      planForm.area = ''
      planForm.goal = ''
      fetchPlans()
    }
  } catch { /* ignore */ }
  finally { creating.value = false }
}

async function togglePlanStatus(plan, status) {
  try {
    const res = await request.put(`/dp/plans/${plan.id}`, { status })
    if (res.code === 0) {
      ElMessage.success(status === 'paused' ? '计划已暂停' : '计划已恢复')
      fetchPlans()
    }
  } catch { /* ignore */ }
}

// 开始练习
const showPracticeDialog = ref(false)
const submitting = ref(false)
const practiceFormRef = ref(null)
const currentPlan = ref(null)
const practiceForm = reactive({
  goal: '',
  content: '',
  durationMinutes: 30,
  effectiveMinutes: 25,
  difficultyLevel: 'learning',
  focusScore: 70,
  reflection: '',
})
const practiceRules = {
  goal: [{ required: true, message: '请输入练习目标', trigger: 'blur' }],
}

function startPractice(plan) {
  currentPlan.value = plan
  practiceForm.goal = ''
  practiceForm.content = ''
  practiceForm.durationMinutes = 30
  practiceForm.effectiveMinutes = 25
  practiceForm.difficultyLevel = 'learning'
  practiceForm.focusScore = 70
  practiceForm.reflection = ''
  showPracticeDialog.value = true
}

function resetPracticeForm() {
  practiceFormRef.value?.resetFields()
}

// 反馈弹窗
const showFeedbackDialog = ref(false)
const lastFeedback = ref(null)
const lastQualityScores = ref(null)

async function handleSubmitPractice() {
  const valid = await practiceFormRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    const res = await request.post('/dp/sessions', {
      planId: currentPlan.value?.id,
      ...practiceForm,
    })
    if (res.code === 0) {
      ElMessage.success('练习记录已保存')
      showPracticeDialog.value = false
      lastFeedback.value = res.data.feedback
      lastQualityScores.value = res.data.qualityScores
      showFeedbackDialog.value = true
      fetchDashboard()
      fetchSessions()
      fetchQuality()
    }
  } catch { /* ignore */ }
  finally { submitting.value = false }
}
</script>

<style scoped>
.page-header { margin-bottom: 20px; }
.page-header h2 { font-size: 22px; font-weight: 700; color: #303133; margin: 0; }
.subtitle { color: #909399; font-size: 14px; margin-top: 4px; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
.stat-card { background: #fff; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 14px; border: 1px solid #e4e7ed; }
.stat-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #2563EB; }
.stat-value { display: block; font-size: 24px; font-weight: 700; color: #303133; line-height: 1.2; }
.stat-label { font-size: 13px; color: #909399; }

.content-grid { display: grid; grid-template-columns: 1fr 360px; gap: 20px; }
.section-card { margin-bottom: 20px; }
.section-card :deep(.el-card__header) { padding: 14px 20px; border-bottom: 1px solid #ebeef5; }
.section-card :deep(.el-card__body) { padding: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.card-title { font-size: 15px; font-weight: 600; color: #303133; }

.plan-item { padding: 16px; background: #f5f7fa; border-radius: 10px; margin-bottom: 12px; }
.plan-item:last-child { margin-bottom: 0; }
.plan-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.plan-info { display: flex; align-items: center; gap: 8px; }
.plan-area { font-size: 13px; color: #606266; }
.plan-actions { display: flex; gap: 4px; }
.plan-title { font-size: 16px; font-weight: 600; color: #303133; margin: 0 0 4px; }
.plan-desc { font-size: 13px; color: #909399; margin: 0 0 12px; }

.milestones { display: flex; flex-direction: column; gap: 8px; }
.milestone-item { display: flex; align-items: center; gap: 10px; }
.milestone-dot { width: 10px; height: 10px; border-radius: 50%; background: #dcdfe6; flex-shrink: 0; }
.milestone-dot.done { background: #10B981; }
.milestone-info { flex: 1; }
.milestone-name { font-size: 13px; font-weight: 500; color: #303133; display: block; }
.milestone-desc { font-size: 12px; color: #909399; }
.milestone-days { font-size: 12px; color: #909399; }

.quality-overview { text-align: center; }
.big-score { font-size: 48px; font-weight: 800; color: #2563EB; line-height: 1; }
.score-label { font-size: 13px; color: #909399; margin: 8px 0 16px; }
.quality-bars { display: flex; flex-direction: column; gap: 10px; }
.qbar-item { display: flex; align-items: center; gap: 8px; }
.qbar-label { width: 72px; font-size: 12px; color: #606266; text-align: right; }
.qbar-track { flex: 1; height: 8px; background: #f0f0f0; border-radius: 4px; overflow: hidden; }
.qbar-fill { height: 100%; border-radius: 4px; transition: width 0.6s; }
.qbar-value { width: 32px; font-size: 12px; font-weight: 600; color: #303133; }

.zone-bar { display: flex; height: 24px; border-radius: 12px; overflow: hidden; margin-bottom: 12px; }
.zone-segment { transition: width 0.5s; }
.zone-segment.comfort { background: #909399; }
.zone-segment.learning { background: #10B981; }
.zone-segment.panic { background: #F56C6C; }
.zone-legend { display: flex; justify-content: space-around; font-size: 12px; color: #606266; margin-bottom: 12px; }
.zone-legend span { display: flex; align-items: center; gap: 4px; }
.dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.comfort-dot { background: #909399; }
.learning-dot { background: #10B981; }
.panic-dot { background: #F56C6C; }
.zone-advice { padding: 10px 12px; border-radius: 8px; font-size: 13px; display: flex; align-items: flex-start; gap: 6px; }
.zone-advice.comfort { background: rgba(144,147,153,0.1); color: #606266; }
.zone-advice.learning { background: rgba(16,185,129,0.1); color: #059669; }
.zone-advice.panic { background: rgba(245,108,108,0.1); color: #DC2626; }

.quick-tools { display: flex; flex-direction: column; gap: 4px; }
.tool-link { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: 8px; color: #606266; text-decoration: none; font-size: 14px; transition: background 0.2s; }
.tool-link:hover { background: #f5f7fa; color: #2563EB; }

.feedback-report { text-align: left; }
.feedback-score { text-align: center; padding: 20px; border-radius: 12px; margin-bottom: 16px; }
.feedback-score.excellent { background: rgba(16,185,129,0.1); }
.feedback-score.good { background: rgba(37,99,235,0.1); }
.feedback-score.average { background: rgba(245,158,11,0.1); }
.feedback-score.poor { background: rgba(245,108,108,0.1); }
.big-num { font-size: 56px; font-weight: 800; color: #303133; }
.score-unit { font-size: 18px; color: #909399; }
.feedback-section { margin-bottom: 16px; }
.feedback-section h4 { font-size: 14px; font-weight: 600; color: #303133; margin: 0 0 6px; }
.feedback-section p { font-size: 14px; color: #606266; line-height: 1.7; margin: 0; white-space: pre-line; }
.suggestion-item { display: flex; align-items: flex-start; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: #606266; }
.suggestion-item:last-child { border-bottom: none; }

@media (max-width: 768px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .content-grid { grid-template-columns: 1fr; }
  .stat-value { font-size: 20px; }
}
</style>