<template>
  <AppLayout>
    <div class="cb-test">
      <div class="test-header">
        <button class="back-btn" @click="handleBack"><el-icon><ArrowLeft /></el-icon></button>
        <div class="test-title-area">
          <h2>认知偏差扫描</h2>
          <span>第 {{ store.currentIndex + 1 }} / {{ store.questions.length }} 题</span>
        </div>
      </div>
      <el-progress :percentage="progressPercent" :stroke-width="8" color="#7C3AED" :show-text="false" />
      <div class="question-card" v-if="currentQ">
        <div class="q-number">Q{{ store.currentIndex + 1 }}</div>
        <p class="q-text">{{ currentQ.text }}</p>
        <div class="q-options">
          <div class="option-item" v-for="opt in currentQ.options" :key="opt.value"
               :class="{ selected: selectedAnswer === opt.value }" @click="selectedAnswer = opt.value">
            <div class="option-marker" :class="{ active: selectedAnswer === opt.value }">{{ opt.value }}</div>
            <span>{{ opt.text }}</span>
          </div>
        </div>
      </div>
      <div class="test-actions">
        <el-button @click="store.prevQuestion()" :disabled="store.currentIndex === 0" round>上一题</el-button>
        <el-button v-if="store.currentIndex < store.questions.length - 1" type="primary" @click="handleNext" :disabled="!selectedAnswer" round>下一题</el-button>
        <el-button v-else type="primary" @click="handleSubmit" :disabled="!selectedAnswer" :loading="submitting" round>提交扫描</el-button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCognitiveBiasStore } from '@/stores/cognitiveBias'
import { ElMessageBox } from 'element-plus'
import AppLayout from '@/components/layout/AppLayout.vue'

const router = useRouter()
const store = useCognitiveBiasStore()
const selectedAnswer = ref(null)
const submitting = ref(false)

const currentQ = computed(() => store.questions[store.currentIndex] || null)
const progressPercent = computed(() => store.questions.length > 0 ? Math.round((store.currentIndex / store.questions.length) * 100) : 0)

onMounted(() => {
  if (store.questions.length === 0) { router.replace('/cognitive-bias'); return }
  selectedAnswer.value = store.answers[currentQ.value?.id] || null
})

function handleNext() {
  if (!selectedAnswer.value) return
  store.saveAnswer(currentQ.value.id, selectedAnswer.value)
  store.nextQuestion()
  selectedAnswer.value = store.answers[store.questions[store.currentIndex]?.id] || null
}

async function handleSubmit() {
  if (!selectedAnswer.value) return
  store.saveAnswer(currentQ.value.id, selectedAnswer.value)
  submitting.value = true
  try {
    const res = await store.submitTest()
    if (res.code === 0) {
      router.replace(`/cognitive-bias/result/${store.currentSession}`)
    }
  } finally {
    submitting.value = false
  }
}

function handleBack() {
  if (Object.keys(store.answers).length > 0) {
    ElMessageBox.confirm('确定要退出吗？当前进度将不会保存。', '退出确认', { confirmButtonText: '确定退出', cancelButtonText: '继续答题', type: 'warning' })
      .then(() => router.replace('/cognitive-bias'))
      .catch(() => {})
  } else {
    router.replace('/cognitive-bias')
  }
}
</script>

<style scoped>
.cb-test { max-width: 720px; margin: 0 auto; }
.test-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
.back-btn { width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--border); background: var(--bg-card); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-secondary); }
.test-title-area h2 { font-size: 20px; font-weight: 600; margin: 0; }
.test-title-area span { font-size: 13px; color: var(--text-muted); }
.question-card { background: var(--bg-card); border-radius: 12px; padding: 32px; margin: 24px 0; border: 1px solid var(--border); }
.q-number { font-size: 13px; color: #7C3AED; font-weight: 600; margin-bottom: 12px; }
.q-text { font-size: 17px; font-weight: 500; color: var(--text-primary); line-height: 1.7; margin-bottom: 24px; }
.q-options { display: flex; flex-direction: column; gap: 12px; }
.option-item { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border: 2px solid var(--border); border-radius: 10px; cursor: pointer; transition: all 0.2s; }
.option-item:hover { border-color: #7C3AED; background: rgba(124,58,237,0.04); }
.option-item.selected { border-color: #7C3AED; background: rgba(124,58,237,0.08); }
.option-marker { width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; transition: all 0.2s; flex-shrink: 0; }
.option-marker.active { background: #7C3AED; border-color: #7C3AED; color: white; }
.option-item span { font-size: 15px; color: var(--text-primary); }
.test-actions { display: flex; justify-content: space-between; gap: 12px; margin-top: 24px; }
</style>