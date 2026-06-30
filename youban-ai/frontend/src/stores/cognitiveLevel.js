import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { startCognitiveLevelTest, submitCognitiveLevelAnswers, getCognitiveLevelResult, getCognitiveLevelHistory } from '@/api/cognitiveLevel'

export const useCognitiveLevelStore = defineStore('cognitiveLevel', () => {
  const currentSession = ref(null)
  const questions = ref([])
  const answers = ref({})
  const currentIndex = ref(0)
  const results = ref([])
  const history = ref([])
  const loading = ref(false)

  const currentQuestion = computed(() => questions.value[currentIndex.value] || null)
  const progress = computed(() => questions.value.length > 0 ? Math.round((currentIndex.value / questions.value.length) * 100) : 0)

  async function startTest() {
    loading.value = true
    try {
      const res = await startCognitiveLevelTest()
      if (res.code === 0) {
        currentSession.value = res.data.sessionId
        questions.value = res.data.questions
        answers.value = {}
        currentIndex.value = 0
      }
    } finally { loading.value = false }
  }

  function saveAnswer(qId, answer) { answers.value[qId] = answer }
  function nextQuestion() { if (currentIndex.value < questions.value.length - 1) currentIndex.value++ }
  function prevQuestion() { if (currentIndex.value > 0) currentIndex.value-- }

  async function submitTest() {
    loading.value = true
    try { return await submitCognitiveLevelAnswers({ sessionId: currentSession.value, answers: answers.value }) }
    finally { loading.value = false }
  }

  async function loadResult(sessionId) {
    loading.value = true
    try {
      const res = await getCognitiveLevelResult(sessionId)
      if (res.code === 0) results.value = res.data.results
      return res
    } finally { loading.value = false }
  }

  async function loadHistory() {
    try {
      const res = await getCognitiveLevelHistory()
      if (res.code === 0) history.value = res.data
    } catch { /* ignore */ }
  }

  return { currentSession, questions, answers, currentIndex, results, history, loading, currentQuestion, progress, startTest, saveAnswer, nextQuestion, prevQuestion, submitTest, loadResult, loadHistory }
})