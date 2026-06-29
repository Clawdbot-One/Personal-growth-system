<template>
  <AppLayout>
    <div class="cal-test">
      <div class="test-header">
        <button class="back-btn" @click="handleBack"><el-icon><ArrowLeft /></el-icon></button>
        <div class="test-title-area">
          <h2>过度自信校准测试</h2>
          <span>第 {{ store.currentIndex + 1 }} / {{ store.totalQuestions }} 题</span>
        </div>
      </div>
      <el-progress :percentage="store.progress" :stroke-width="8" color="#059669" :show-text="false" />
      <div class="question-card" v-if="store.currentQuestion">
        <div class="q-category">{{ categoryLabel }}</div>
        <p class="q-text">{{ store.currentQuestion.text }}</p>
        <div class="q-answer">
          <span class="answer-label">请判断：</span>
          <el-radio-group v-model="selectedAnswer" size="large">
            <el-radio-button value="yes">是（正确）</el-radio-button>
            <el-radio-button value="no">否（错误）</el-radio-button>
          </el-radio-group>
        </div>
        <div class="q-confidence">
          <span class="confidence-label">你的把握程度：<strong>{{ confidence }}%</strong></span>
          <el-slider v-model="confidence" :min="50" :max="100" :step="5" show-stops :marks="confidenceMarks" />
        </div>
      </div>
      <div class="test-actions">
        <el-button @click="store.prevQuestion()" :disabled="store.currentIndex === 0" round>上一题</el-button>
        <el-button v-if="store.currentIndex < store.totalQuestions - 1" type="primary" @click="handleNext" :disabled="!selectedAnswer" round>下一题</el-button>
        <el-button v-else type="primary" @click="handleSubmit" :disabled="!selectedAnswer" :loading="submitting" round>提交校准</el-button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCalibrationStore } from '@/stores/calibration'
import { ElMessageBox } from 'element-plus'
import AppLayout from '@/components/layout/AppLayout.vue'

const router = useRouter()
const store = useCalibrationStore()
const selectedAnswer = ref(null)
const confidence = ref(70)
const submitting = ref(false)

const confidenceMarks = { 50: '50%', 60: '', 70: '70%', 80: '', 90: '90%', 100: '100%' }

const categoryLabels = { geography: '地理', science: '科学', history: '历史', arts: '艺术', technology: '科技', sports: '体育' }
const categoryLabel = computed(() => categoryLabels[store.currentQuestion?.category] || '常识')

onMounted(() => {
  if (store.totalQuestions === 0) { router.replace('/calibration'); return }
  const saved = store.answers[store.currentQuestion?.id]
  if (saved) { selectedAnswer.value = saved.answer; confidence.value = saved.confidence }
})

function handleNext() {
  if (!selectedAnswer.value) return
  store.saveAnswer(store.currentQuestion.id, selectedAnswer.value, confidence.value)
  store.nextQuestion()
  const saved = store.answers[store.questions[store.currentIndex]?.id]
  selectedAnswer.value = saved?.answer || null
  confidence.value = saved?.confidence || 70
}

async function handleSubmit() {
  if (!selectedAnswer.value) return
  store.saveAnswer(store.currentQuestion.id, selectedAnswer.value, confidence.value)
  submitting.value = true
  try {
    const res = await store.submitTest()
    if (res.code === 0) router.replace(`/calibration/result/${store.currentSession}`)
  } finally { submitting.value = false }
}

function handleBack() {
  if (Object.keys(store.answers).length > 0) {
    ElMessageBox.confirm('确定要退出吗？', '退出确认', { confirmButtonText: '确定退出', cancelButtonText: '继续', type: 'warning' }).then(() => router.replace('/calibration')).catch(() => {})
  } else { router.replace('/calibration') }
}
</script>

<style scoped>
.cal-test { max-width: 720px; margin: 0 auto; }
.test-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
.back-btn { width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--border); background: var(--bg-card); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.test-title-area h2 { font-size: 20px; font-weight: 600; margin: 0; }
.test-title-area span { font-size: 13px; color: var(--text-muted); }
.question-card { background: var(--bg-card); border-radius: 12px; padding: 32px; margin: 24px 0; border: 1px solid var(--border); }
.q-category { display: inline-block; font-size: 12px; color: #059669; background: rgba(5,150,105,0.08); padding: 4px 12px; border-radius: 20px; margin-bottom: 12px; }
.q-text { font-size: 17px; font-weight: 500; line-height: 1.7; margin-bottom: 24px; }
.q-answer { margin-bottom: 24px; }
.answer-label { font-size: 14px; font-weight: 500; color: var(--text-secondary); display: block; margin-bottom: 10px; }
.q-confidence { margin-top: 8px; }
.confidence-label { font-size: 14px; color: var(--text-secondary); display: block; margin-bottom: 12px; }
.confidence-label strong { color: #059669; font-size: 18px; }
.test-actions { display: flex; justify-content: space-between; gap: 12px; margin-top: 24px; }
</style>