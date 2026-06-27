<template>
  <div class="deep-practice" :class="{ 'is-active': isActive }">
    <!-- 非专注模式 -->
    <div v-if="!isActive" class="prep-screen">
      <div class="page-header">
        <h2>深度练习模式</h2>
        <p class="subtitle">进入全屏沉浸式练习，关闭所有干扰，只专注一件事</p>
      </div>

      <div class="content-grid">
        <div class="main-col">
          <el-card class="section-card" shadow="never">
            <template #header>
              <span class="card-title">开始深度练习</span>
            </template>
            <div class="start-form">
              <div class="form-group">
                <label>练习目标</label>
                <el-input v-model="goal" placeholder="用一句话描述本次练习要达到的具体目标" maxlength="100" show-word-limit />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>定时时长（分钟）</label>
                  <div class="duration-selector">
                    <el-radio-group v-model="duration" size="large">
                      <el-radio-button :value="15">15分钟</el-radio-button>
                      <el-radio-button :value="25">25分钟</el-radio-button>
                      <el-radio-button :value="45">45分钟</el-radio-button>
                      <el-radio-button :value="60">60分钟</el-radio-button>
                    </el-radio-group>
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label>练习模式</label>
                <div class="mode-selector">
                  <div class="mode-card" :class="{ active: mode === 'normal' }" @click="mode = 'normal'">
                    <div class="mode-icon">🟢</div>
                    <div class="mode-name">标准模式</div>
                    <div class="mode-desc">基础计时，温和提醒</div>
                  </div>
                  <div class="mode-card" :class="{ active: mode === 'deep' }" @click="mode = 'deep'">
                    <div class="mode-icon">🔵</div>
                    <div class="mode-name">深度模式</div>
                    <div class="mode-desc">全屏沉浸，专注增强</div>
                  </div>
                  <div class="mode-card" :class="{ active: mode === 'strict' }" @click="mode = 'strict'">
                    <div class="mode-icon">🔴</div>
                    <div class="mode-name">严格模式</div>
                    <div class="mode-desc">强制锁定，零干扰</div>
                  </div>
                </div>
              </div>
              <el-button type="primary" size="large" class="start-btn" @click="startDeepPractice" :disabled="!goal.trim()">
                <el-icon><VideoPlay /></el-icon> 开始深度练习
              </el-button>
            </div>
          </el-card>
        </div>

        <div class="side-col">
          <el-card class="section-card" shadow="never">
            <template #header>
              <span class="card-title">专注力统计</span>
            </template>
            <div v-if="focusData" class="focus-stats">
              <div class="focus-big">
                <span class="fb-num">{{ focusData.analysis?.avgFocusScore || 0 }}</span>
                <span class="fb-label">平均专注评分</span>
              </div>
              <div class="focus-meta">
                <div class="fm-item">
                  <span class="fm-value">{{ focusData.analysis?.totalSessions || 0 }}</span>
                  <span class="fm-label">总训练次数</span>
                </div>
                <div class="fm-item">
                  <span class="fm-value">{{ focusData.analysis?.avgDistractions || 0 }}</span>
                  <span class="fm-label">平均分心次数</span>
                </div>
                <div class="fm-item">
                  <span class="fm-value">{{ focusData.analysis?.bestTimeSlot || '--' }}</span>
                  <span class="fm-label">最佳时段</span>
                </div>
              </div>
            </div>
          </el-card>

          <el-card class="section-card" shadow="never">
            <template #header>
              <span class="card-title">历史记录</span>
            </template>
            <div v-if="focusData?.sessions?.length" class="history-list">
              <div v-for="s in focusData.sessions.slice(0, 8)" :key="s.id" class="history-item">
                <span class="hi-duration">{{ s.durationMinutes }}分钟</span>
                <span class="hi-mode">
                  <el-tag :type="s.mode === 'strict' ? 'danger' : s.mode === 'deep' ? '' : 'info'" size="small">
                    {{ s.mode === 'strict' ? '严格' : s.mode === 'deep' ? '深度' : '标准' }}
                  </el-tag>
                </span>
                <span class="hi-score">专注 {{ s.focusScore }}</span>
                <span class="hi-time">{{ s.createdAt?.slice(0, 10) }}</span>
              </div>
            </div>
            <el-empty v-else description="暂无记录" :image-size="60" />
          </el-card>
        </div>
      </div>
    </div>

    <!-- 深度练习激活状态 -->
    <div v-else class="active-screen" :class="mode">
      <div class="focus-overlay">
        <div class="focus-center">
          <div class="timer-display">
            <span class="timer-minutes">{{ formatTime.timeLeft }}</span>
          </div>
          <div class="timer-goal" v-if="goal">{{ goal }}</div>
          <div class="timer-status">
            <el-tag :type="mode === 'strict' ? 'danger' : 'primary'" size="large">
              {{ mode === 'strict' ? '严格模式' : mode === 'deep' ? '深度模式' : '标准模式' }}
            </el-tag>
          </div>

          <div class="timer-actions">
            <el-button v-if="!isRunning && !isPaused" type="primary" size="large" round @click="startTimer">
              <el-icon><VideoPlay /></el-icon> 开始
            </el-button>
            <el-button v-if="isRunning" type="warning" size="large" round @click="pauseTimer">
              <el-icon><VideoPause /></el-icon> 暂停
            </el-button>
            <el-button v-if="isPaused" type="primary" size="large" round @click="resumeTimer">
              <el-icon><VideoPlay /></el-icon> 继续
            </el-button>
            <el-button size="large" round @click="endSession">
              <el-icon><Close /></el-icon> 结束练习
            </el-button>
          </div>
        </div>

        <div class="focus-footer">
          <div class="distraction-counter" v-if="isRunning">
            <el-button type="danger" plain round size="small" @click="recordDistraction">
              <el-icon><Warning /></el-icon> 记录分心 ({{ distractionCount }})
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 结束弹窗 -->
    <el-dialog v-model="showEndDialog" title="练习完成" width="480px" :close-on-click-modal="false">
      <div class="end-summary">
        <div class="end-score">
          <span class="big-num">{{ endFocusScore }}</span>
          <span class="score-label">专注评分</span>
        </div>
        <div class="end-stats">
          <div class="end-stat">
            <span class="es-label">总时长</span>
            <span class="es-value">{{ actualDuration }}分钟</span>
          </div>
          <div class="end-stat">
            <span class="es-label">分心次数</span>
            <span class="es-value">{{ distractionCount }}</span>
          </div>
          <div class="end-stat">
            <span class="es-label">专注效率</span>
            <span class="es-value">{{ focusEfficiency }}%</span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="saveSession">保存并退出</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { VideoPlay, VideoPause, Close, Warning } from '@element-plus/icons-vue'
import request from '@/api/request.js'

const goal = ref('')
const duration = ref(25)
const mode = ref('deep')
const isActive = ref(false)
const isRunning = ref(false)
const isPaused = ref(false)
const showEndDialog = ref(false)
const focusData = ref(null)

// Timer state
const totalSeconds = ref(0)
const remainingSeconds = ref(0)
const distractionCount = ref(0)
let timerInterval = null
const sessionStartTime = ref(null)
const endFocusScore = ref(0)
const actualDuration = ref(0)

const formatTime = computed(() => {
  const mins = Math.floor(remainingSeconds.value / 60)
  const secs = remainingSeconds.value % 60
  return {
    timeLeft: `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
  }
})

const focusEfficiency = computed(() => {
  if (actualDuration.value === 0) return 0
  const penalty = distractionCount.value * 2
  return Math.max(0, Math.round(100 - penalty))
})

function startDeepPractice() {
  isActive.value = true
  totalSeconds.value = duration.value * 60
  remainingSeconds.value = totalSeconds.value
  isRunning.value = false
  isPaused.value = false
  distractionCount.value = 0
  sessionStartTime.value = new Date()

  if (mode.value === 'strict') {
    document.documentElement.requestFullscreen?.().catch(() => {})
  }
}

function startTimer() {
  isRunning.value = true
  isPaused.value = false
  timerInterval = setInterval(() => {
    remainingSeconds.value--
    if (remainingSeconds.value <= 0) {
      endSession()
    }
  }, 1000)
}

function pauseTimer() {
  isRunning.value = false
  isPaused.value = true
  clearInterval(timerInterval)
}

function resumeTimer() {
  isRunning.value = true
  isPaused.value = false
  timerInterval = setInterval(() => {
    remainingSeconds.value--
    if (remainingSeconds.value <= 0) {
      endSession()
    }
  }, 1000)
}

function recordDistraction() {
  distractionCount.value++
  ElMessage.warning(`已记录第 ${distractionCount.value} 次分心，请尽快回到专注状态`)
}

function endSession() {
  clearInterval(timerInterval)
  isRunning.value = false

  const elapsed = totalSeconds.value - remainingSeconds.value
  actualDuration.value = Math.round(elapsed / 60)

  const baseScore = 70
  const focusPenalty = distractionCount.value * 5
  const durationBonus = actualDuration.value >= duration.value * 0.8 ? 15 : 0
  endFocusScore.value = Math.max(10, Math.min(100, baseScore + durationBonus - focusPenalty))

  if (document.fullscreenElement) {
    document.exitFullscreen?.().catch(() => {})
  }

  showEndDialog.value = true
}

async function saveSession() {
  try {
    await request.post('/dp/focus', {
      durationMinutes: actualDuration.value,
      focusScore: endFocusScore.value,
      distractionCount: distractionCount.value,
      mode: mode.value,
    })
    ElMessage.success('专注训练记录已保存')
  } catch { /* ignore */ }

  showEndDialog.value = false
  isActive.value = false
  goal.value = ''
  fetchFocusData()
}

async function fetchFocusData() {
  try {
    const res = await request.get('/dp/focus')
    if (res.code === 0) focusData.value = res.data
  } catch { /* ignore */ }
}

onMounted(fetchFocusData)
onUnmounted(() => { clearInterval(timerInterval) })
</script>

<style scoped>
.deep-practice { max-width: 1200px; margin: 0 auto; }
.page-header { margin-bottom: 20px; }
.page-header h2 { font-size: 22px; font-weight: 700; color: #303133; margin: 0; }
.subtitle { color: #909399; font-size: 14px; margin-top: 4px; }

.content-grid { display: grid; grid-template-columns: 1fr 360px; gap: 20px; }
.section-card { margin-bottom: 20px; }
.section-card :deep(.el-card__header) { padding: 14px 20px; border-bottom: 1px solid #ebeef5; }
.section-card :deep(.el-card__body) { padding: 20px; }
.card-title { font-size: 15px; font-weight: 600; color: #303133; }

.start-form { max-width: 500px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: 14px; font-weight: 500; color: #303133; margin-bottom: 8px; }
.form-row { display: grid; grid-template-columns: 1fr; gap: 16px; }

.mode-selector { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.mode-card { padding: 16px 12px; border: 2px solid #e4e7ed; border-radius: 10px; text-align: center; cursor: pointer; transition: all 0.2s; }
.mode-card:hover { border-color: #2563EB; }
.mode-card.active { border-color: #2563EB; background: rgba(37,99,235,0.04); }
.mode-icon { font-size: 28px; margin-bottom: 6px; }
.mode-name { font-size: 14px; font-weight: 600; color: #303133; }
.mode-desc { font-size: 12px; color: #909399; margin-top: 2px; }

.start-btn { width: 100%; margin-top: 8px; }

.focus-big { text-align: center; padding: 16px; }
.fb-num { font-size: 48px; font-weight: 800; color: #2563EB; }
.fb-label { display: block; font-size: 13px; color: #909399; margin-top: 4px; }
.focus-meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 12px; }
.fm-item { text-align: center; padding: 10px; background: #f5f7fa; border-radius: 8px; }
.fm-value { font-size: 18px; font-weight: 700; color: #303133; display: block; }
.fm-label { font-size: 11px; color: #909399; }

.history-list { display: flex; flex-direction: column; gap: 6px; }
.history-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: #f5f7fa; border-radius: 6px; font-size: 13px; }
.hi-duration { font-weight: 600; color: #303133; }
.hi-score { color: #2563EB; font-weight: 500; }
.hi-time { margin-left: auto; color: #909399; font-size: 12px; }

/* 活跃状态 */
.active-screen { position: fixed; inset: 0; z-index: 9999; }
.active-screen.deep { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); }
.active-screen.strict { background: #0d0d0d; }
.active-screen.normal { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); }
.focus-overlay { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; }
.focus-center { text-align: center; }
.timer-display { margin-bottom: 24px; }
.timer-minutes { font-size: 120px; font-weight: 300; color: #fff; font-variant-numeric: tabular-nums; letter-spacing: 8px; }
.timer-goal { font-size: 18px; color: rgba(255,255,255,0.7); max-width: 500px; margin: 0 auto 24px; }
.timer-status { margin-bottom: 32px; }
.timer-actions { display: flex; gap: 12px; justify-content: center; }
.focus-footer { position: absolute; bottom: 40px; }

/* 结束弹窗 */
.end-summary { text-align: center; }
.end-score { padding: 20px; }
.big-num { font-size: 64px; font-weight: 800; color: #2563EB; }
.score-label { display: block; font-size: 14px; color: #909399; margin-top: 4px; }
.end-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 16px; }
.end-stat { padding: 12px; background: #f5f7fa; border-radius: 8px; }
.es-label { font-size: 12px; color: #909399; display: block; }
.es-value { font-size: 20px; font-weight: 700; color: #303133; }

@media (max-width: 768px) {
  .content-grid { grid-template-columns: 1fr; }
  .mode-selector { grid-template-columns: 1fr; }
  .timer-minutes { font-size: 72px; }
}
</style>