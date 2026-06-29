import { defineStore } from 'pinia'
import { ref } from 'vue'
import { startBiasTest, submitBiasAnswer, getBiasResult, getBiasHistory } from '@/api/cognitiveBias'

export const useCognitiveBiasStore = defineStore('cognitiveBias', () => {
  const currentSession = ref(null)
  const questions = ref([])
  const answers = ref({})
  const currentIndex = ref(0)
  const results = ref([])
  const history = ref([])
  const loading = ref(false)

  async function startTest() {
    loading.value = true
    try {
      const res = await startBiasTest()
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

  function saveAnswer(qId, answer) {
    answers.value[qId] = answer
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
      const res = await submitBiasAnswer({
        sessionId: currentSession.value,
        answers: answers.value,
      })
      return res
    } finally {
      loading.value = false
    }
  }

  async function loadResult(sessionId) {
    loading.value = true
    try {
      const res = await getBiasResult(sessionId)
      if (res.code === 0) {
        results.value = res.data.results
      }
      return res
    } finally {
      loading.value = false
    }
  }

  async function loadHistory() {
    try {
      const res = await getBiasHistory()
      if (res.code === 0) {
        history.value = res.data
      }
    } catch { /* ignore */ }
  }

  return {
    currentSession, questions, answers, currentIndex, results, history, loading,
    startTest, saveAnswer, nextQuestion, prevQuestion, submitTest, loadResult, loadHistory,
  }
})