<template>
  <AppLayout>
    <div class="quick-test">
      <!-- 顶部进度区域 -->
      <div class="test-header">
        <div class="test-header-top">
          <button class="back-btn" @click="handleBack">
            <el-icon><ArrowLeft /></el-icon>
          </button>
          <div class="test-title-area">
            <h2 class="test-title">快速精简版测评</h2>
            <span class="test-progress-text">
              第 {{ current + 1 }} / {{ total }} 题
            </span>
          </div>
          <div class="auto-save" v-if="autoSaveVisible">
            <el-icon><CircleCheck /></el-icon>
            <span>已自动保存</span>
          </div>
        </div>
        <el-progress
          :percentage="progressPercent"
          :stroke-width="8"
          :color="'#2563EB'"
          :show-text="false"
        />
        <div class="progress-labels">
          <span class="progress-start">开始</span>
          <span class="progress-end">{{ progressPercent }}%</span>
        </div>
      </div>

      <!-- 题目区域 -->
      <div class="question-area" v-if="currentQuestion">
        <transition name="slide-fade" mode="out-in">
          <div class="question-card" :key="currentQuestion.id">
            <div class="question-meta">
              <el-tag
                :type="dimensionTypeMap[currentQuestion.type]"
                effect="light"
                size="small"
                round
              >
                {{ dimensionLabelMap[currentQuestion.type] }}
              </el-tag>
              <span class="question-number">Q{{ currentQuestion.id }}</span>
            </div>
            <h3 class="question-text">{{ currentQuestion.text }}</h3>
            <div class="options-list">
              <div
                v-for="option in currentQuestion.options"
                :key="option.value"
                class="option-item"
                :class="{
                  selected: selectedAnswer === option.value,
                  disabled: isSubmitting,
                }"
                @click="selectOption(option.value)"
              >
                <div class="option-marker" :class="{ active: selectedAnswer === option.value }">
                  {{ option.value }}
                </div>
                <span class="option-text">{{ option.text }}</span>
                <div class="option-check" v-if="selectedAnswer === option.value">
                  <el-icon><CircleCheckFilled /></el-icon>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-else>
        <el-icon :size="48"><Warning /></el-icon>
        <p>题目加载失败，请返回重试</p>
        <el-button type="primary" @click="$router.back()">返回</el-button>
      </div>

      <!-- 底部导航 -->
      <div class="test-nav">
        <el-button
          :disabled="current === 0"
          size="large"
          round
          class="nav-btn"
          @click="handlePrev"
        >
          <el-icon><ArrowLeft /></el-icon>
          上一题
        </el-button>

        <div class="nav-dots">
          <span
            v-for="i in total"
            :key="i"
            class="nav-dot"
            :class="{
              active: i - 1 === current,
              answered: answers[questions[i - 1]?.id],
            }"
            @click="goToQuestion(i - 1)"
          ></span>
        </div>

        <el-button
          v-if="current < total - 1"
          type="primary"
          size="large"
          round
          class="nav-btn"
          :disabled="!selectedAnswer"
          @click="handleNext"
        >
          下一题
          <el-icon><ArrowRight /></el-icon>
        </el-button>

        <el-button
          v-else
          type="primary"
          size="large"
          round
          class="nav-btn submit-btn"
          :disabled="!selectedAnswer"
          :loading="isSubmitting"
          @click="handleSubmit"
        >
          完成测评
          <el-icon><Check /></el-icon>
        </el-button>
      </div>

      <!-- 未完成确认弹窗 -->
      <el-dialog
        v-model="showExitDialog"
        title="确认退出？"
        width="380px"
        :close-on-click-modal="false"
        center
      >
        <div class="exit-dialog-body">
          <p>你的测评进度已自动保存，下次可以继续完成。</p>
          <p class="exit-dialog-answered">
            已答 {{ answeredCount }} / {{ total }} 题
          </p>
        </div>
        <template #footer>
          <el-button @click="showExitDialog = false">继续测评</el-button>
          <el-button type="primary" @click="confirmExit">确认退出</el-button>
        </template>
      </el-dialog>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAssessmentStore } from '@/stores/assessment'
import AppLayout from '@/components/layout/AppLayout.vue'

const router = useRouter()
const store = useAssessmentStore()

const questions = computed(() => store.quickQuestions)
const total = computed(() => questions.value.length)
const current = ref(0)
const selectedAnswer = ref(null)
const isSubmitting = ref(false)
const showExitDialog = ref(false)
const autoSaveVisible = ref(false)
let autoSaveTimer = null

const currentQuestion = computed(() => questions.value[current.value] || null)
const answers = computed(() => store.answers)

const answeredCount = computed(() => Object.keys(store.answers).length)
const progressPercent = computed(() => {
  return Math.round((answeredCount.value / total.value) * 100)
})

const dimensionLabelMap = {
  talent: '天赋',
  skill: '技能',
  character: '性格',
  value: '价值观',
}
const dimensionTypeMap = {
  talent: '',
  skill: 'success',
  character: 'warning',
  value: 'danger',
}

onMounted(() => {
  store.startTest('quick')
  // 恢复之前保存的进度
  if (Object.keys(store.answers).length > 0) {
    current.value = store.currentQuestionIndex
  }
  syncSelectedAnswer()
})

onBeforeUnmount(() => {
  if (autoSaveTimer) clearInterval(autoSaveTimer)
})

function syncSelectedAnswer() {
  const q = currentQuestion.value
  if (q) {
    selectedAnswer.value = store.answers[q.id] || null
  }
}

function selectOption(value) {
  if (isSubmitting.value) return
  selectedAnswer.value = value
  const q = currentQuestion.value
  if (q) {
    store.saveAnswer(q.id, value)
  }
  simulateAutoSave()
}

function simulateAutoSave() {
  autoSaveVisible.value = true
  if (autoSaveTimer) clearTimeout(autoSaveTimer)
  autoSaveTimer = setTimeout(() => {
    autoSaveVisible.value = false
  }, 1500)
}

function handleNext() {
  if (!selectedAnswer.value) return
  store.saveAnswer(currentQuestion.value.id, selectedAnswer.value)
  current.value++
  store.currentQuestionIndex = current.value
  syncSelectedAnswer()
}

function handlePrev() {
  if (current.value > 0) {
    current.value--
    store.currentQuestionIndex = current.value
    syncSelectedAnswer()
  }
}

function goToQuestion(index) {
  current.value = index
  store.currentQuestionIndex = index
  syncSelectedAnswer()
}

function handleBack() {
  if (answeredCount.value > 0) {
    showExitDialog.value = true
  } else {
    router.back()
  }
}

function confirmExit() {
  showExitDialog.value = false
  router.back()
}

function handleSubmit() {
  if (!selectedAnswer.value) return
  store.saveAnswer(currentQuestion.value.id, selectedAnswer.value)
  isSubmitting.value = true

  // 模拟提交延迟
  setTimeout(() => {
    const report = store.generateReport('quick')
    isSubmitting.value = false
    router.push(`/assessment/report/${report.id}`)
  }, 800)
}
</script>

<style scoped>
.quick-test {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 200px);
}

/* 顶部进度 */
.test-header {
  margin-bottom: 32px;
}
.test-header-top {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}
.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
  flex-shrink: 0;
}
.back-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}
.test-title-area {
  flex: 1;
}
.test-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}
.test-progress-text {
  font-size: 13px;
  color: var(--text-muted);
}
.auto-save {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--success);
  flex-shrink: 0;
  animation: fadeInOut 0.3s ease;
}
.progress-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-muted);
}

/* 题目卡片 */
.question-area {
  flex: 1;
}
.question-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 32px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
}
.question-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.question-number {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
}
.question-text {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.6;
  margin-bottom: 28px;
}
.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.option-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border-radius: var(--radius-sm);
  border: 2px solid var(--border);
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
}
.option-item:hover {
  border-color: var(--primary);
  background: rgba(37, 99, 235, 0.03);
}
.option-item.selected {
  border-color: var(--primary);
  background: rgba(37, 99, 235, 0.06);
}
.option-item.disabled {
  pointer-events: none;
  opacity: 0.7;
}
.option-marker {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-secondary);
  transition: all 0.25s ease;
  flex-shrink: 0;
}
.option-marker.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}
.option-text {
  font-size: 15px;
  color: var(--text-primary);
  line-height: 1.5;
  flex: 1;
}
.option-check {
  color: var(--primary);
  font-size: 20px;
  flex-shrink: 0;
}

/* 底部导航 */
.test-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 0;
  gap: 16px;
}
.nav-btn {
  min-width: 120px;
}
.submit-btn {
  background: var(--success);
  border-color: var(--success);
}
.submit-btn:hover {
  background: #059669;
  border-color: #059669;
}
.nav-dots {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}
.nav-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--border);
  cursor: pointer;
  transition: all 0.2s;
}
.nav-dot.answered {
  background: var(--primary-light);
}
.nav-dot.active {
  background: var(--primary);
  transform: scale(1.3);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}

/* 退出弹窗 */
.exit-dialog-body {
  text-align: center;
  color: var(--text-secondary);
  line-height: 1.6;
}
.exit-dialog-answered {
  margin-top: 8px;
  font-weight: 600;
  color: var(--primary);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-muted);
}
.empty-state p {
  margin: 16px 0;
}

/* 动画 */
.slide-fade-enter-active {
  transition: all 0.35s ease;
}
.slide-fade-leave-active {
  transition: all 0.2s ease;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(40px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-40px);
}
@keyframes fadeInOut {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Responsive */
@media (max-width: 768px) {
  .question-card {
    padding: 24px 20px;
  }
  .question-text {
    font-size: 18px;
  }
  .option-item {
    padding: 14px 16px;
  }
  .option-text {
    font-size: 14px;
  }
  .test-nav {
    flex-wrap: wrap;
  }
  .nav-dots {
    order: 3;
    width: 100%;
    justify-content: center;
    padding-top: 8px;
  }
}
@media (max-width: 480px) {
  .test-title {
    font-size: 17px;
  }
  .nav-btn {
    min-width: 100px;
    font-size: 13px;
  }
}
</style>