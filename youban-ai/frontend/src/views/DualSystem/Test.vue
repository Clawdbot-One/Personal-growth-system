<template>
  <AppLayout>
    <div class="ds-test">
      <div class="test-header">
        <button class="back-btn" @click="handleBack"><el-icon><ArrowLeft /></el-icon></button>
        <div class="test-title-area">
          <h2>双系统思维训练</h2>
          <span>第 {{ store.currentIndex + 1 }} / {{ store.totalQuestions }} 题</span>
        </div>
        <div class="timer-display" v-if="timerVisible">{{ elapsed }}s</div>
      </div>
      <el-progress :percentage="store.progress" :stroke-width="8" color="#2563EB" :show-text="false" />
      <div class="question-card" v-if="store.currentQuestion">
        <div class="q-type-badge">{{ typeLabel }}</div>
        <p class="q-text">{{ store.currentQuestion.text }}</p>
        <div class="q-options">
          <div class="option-item" v-for="opt in store.currentQuestion.options" :key="opt.value"
               :class="{ selected: selectedAnswer === opt.value }" @click="selectedAnswer = opt.value">
            <div class="option-marker" :class="{ active: selectedAnswer === opt.value }">{{ opt.value }}</div>
            <span>{{ opt.text }}</span>
          </div>
        </div>
      </div>
      <div class="test-actions">
        <el-button @click="store.prevQuestion()" :disabled="store.currentIndex === 0" round>上一题</el-button>
        <el-button v-if="store.currentIndex < store.totalQuestions - 1" type="primary" @click="handleNext" :disabled="!selectedAnswer" round>下一题</el-button>
        <el-button v-else type="primary" @click="handleSubmit" :disabled="!selectedAnswer" :loading="submitting" round>提交答卷</el-button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDualSystemStore } from '@/stores/dualSystem'
import { ElMessageBox } from 'element-plus'
import AppLayout from '@/components/layout/AppLayout.vue'

const router = useRouter()
const store = useDualSystemStore()
const selectedAnswer = ref(null)
const submitting = ref(false)
const elapsed = ref(0)
const timerVisible = ref(true)
let timerInterval = null

const typeLabel = computed(() => {
  const map = { intuition_conflict: '直觉冲突题', framing_switch: '框架切换题', statistical_intuition: '统计直觉题' }
  return map[store.currentQuestion?.type] || '思维训练题'
})

onMounted(() => {
  if (store.totalQuestions === 0) { router.replace('/dual-system'); return }
  selectedAnswer.value = store.answers[store.currentQuestion?.id]?.answer || null
  startTimer()
})

onUnmounted(() => { clearInterval(timerInterval) })

function startTimer() {
  elapsed.value = 0
  store.recordStartTime()
  clearInterval(timerInterval)
  timerInterval = setInterval(() => { elapsed.value++ }, 1000)
}

function handleNext() {
  if (!selectedAnswer.value) return
  store.saveAnswer(store.currentQuestion.id, selectedAnswer.value)
  store.nextQuestion()
  selectedAnswer.value = store.answers[store.questions[store.currentIndex]?.id]?.answer || null
  startTimer()
}

async function handleSubmit() {
  if (!selectedAnswer.value) return
  store.saveAnswer(store.currentQuestion.id, selectedAnswer.value)
  clearInterval(timerInterval)
  submitting.value = true
  try {
    const res = await store.submitTest()
    if (res.code === 0) router.replace(`/dual-system/result/${store.currentSession}`)
  } finally { submitting.value = false }
}

function handleBack() {
  if (Object.keys(store.answers).length > 0) {
    ElMessageBox.confirm('确定要退出吗？当前进度将不会保存。', '退出确认', { confirmButtonText: '确定退出', cancelButtonText: '继续答题', type: 'warning' }).then(() => router.replace('/dual-system')).catch(() => {})
  } else { router.replace('/dual-system') }
}
</script>

<style scoped>
.ds-test { max-width: 720px; margin: 0 auto; }
.test-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
.back-btn { width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--border); background: var(--bg-card); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.test-title-area { flex: 1; }
.test-title-area h2 { font-size: 20px; font-weight: 600; margin: 0; }
.test-title-area span { font-size: 13px; color: var(--text-muted); }
.timer-display { font-size: 14px; font-weight: 600; color: var(--text-muted); background: var(--bg-primary); padding: 4px 12px; border-radius: 20px; }
.question-card { background: var(--bg-card); border-radius: 12px; padding: 32px; margin: 24px 0; border: 1px solid var(--border); }
.q-type-badge { display: inline-block; font-size: 12px; color: #2563EB; background: rgba(37,99,235,0.08); padding: 4px 12px; border-radius: 20px; margin-bottom: 12px; font-weight: 500; }
.q-text { font-size: 17px; font-weight: 500; line-height: 1.7; margin-bottom: 24px; }
.q-options { display: flex; flex-direction: column; gap: 12px; }
.option-item { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border: 2px solid var(--border); border-radius: 10px; cursor: pointer; transition: all 0.2s; }
.option-item:hover { border-color: #2563EB; background: rgba(37,99,235,0.04); }
.option-item.selected { border-color: #2563EB; background: rgba(37,99,235,0.08); }
.option-marker { width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; flex-shrink: 0; }
.option-marker.active { background: #2563EB; border-color: #2563EB; color: white; }
.test-actions { display: flex; justify-content: space-between; gap: 12px; margin-top: 24px; }
</style>