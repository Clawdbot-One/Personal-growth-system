import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { startCalibrationTest, submitCalibrationAnswer, getCalibrationResult, getCalibrationHistory } from '@/api/calibration'

export const useCalibrationStore = defineStore('calibration', () => {
  const currentSession = ref(null)
  const questions = ref([])
  const answers = ref({})
  const currentIndex = ref(0)
  const result = ref(null)
  const history = ref([])
  const loading = ref(false)

  const currentQuestion = computed(() => questions.value[currentIndex.value] || null)
  const totalQuestions = computed(() => questions.value.length)
  const progress = computed(() => totalQuestions.value > 0 ? Math.round(((currentIndex.value + 1) / totalQuestions.value) * 100) : 0)
  const answeredCount = computed(() => Object.keys(answers.value).length)

  async function startTest() {
    loading.value = true
    try {
      const res = await startCalibrationTest()
      if (res.code === 0) {
        currentSession.value = res.data.sessionId
        questions.value = res.data.questions
        answers.value = {}
        currentIndex.value = 0
      }
    } finally {
      loading.value = false
    }
  }

  function saveAnswer(qId, answer, confidence) {
    answers.value[qId] = { answer, confidence }
  }

  function nextQuestion() {
    if (currentIndex.value < questions.value.length - 1) {
      currentIndex.value++
    }
  }

  function prevQuestion() {
    if (currentIndex.value > 0) {
      currentIndex.value--
    }
  }

  async function submitTest() {
    loading.value = true
    try {
      const res = await submitCalibrationAnswer({
        sessionId: currentSession.value,
        answers: answers.value,
      })
      if (res.code === 0) {
        result.value = res.data
      }
      return res
    } finally {
      loading.value = false
    }
  }

  async function loadResult(sessionId) {
    loading.value = true
    try {
      const res = await getCalibrationResult(sessionId)
      if (res.code === 0) {
        result.value = res.data
      }
      return res
    } finally {
      loading.value = false
    }
  }

  async function loadHistory() {
    try {
      const res = await getCalibrationHistory()
      if (res.code === 0) {
        history.value = res.data
      }
    } catch { /* ignore */ }
  }

  return {
    currentSession, questions, answers, currentIndex, result, history, loading,
    currentQuestion, totalQuestions, progress, answeredCount,
    startTest, saveAnswer, nextQuestion, prevQuestion, submitTest, loadResult, loadHistory,
  }
})