import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createDecision, analyzeDecision, completeDecision, getDecisionHistory } from '@/api/decisionSupport'

export const useDecisionSupportStore = defineStore('decisionSupport', () => {
  const currentDecision = ref(null)
  const analysisResult = ref(null)
  const history = ref([])
  const loading = ref(false)

  async function create(data) {
    loading.value = true
    try {
      const res = await createDecision(data)
      if (res.code === 0) currentDecision.value = res.data
      return res
    } finally { loading.value = false }
  }

  async function analyze(id, probabilities) {
    loading.value = true
    try {
      const res = await analyzeDecision({ id, probabilities })
      if (res.code === 0) analysisResult.value = res.data
      return res
    } finally { loading.value = false }
  }

  async function complete(id, data) {
    const res = await completeDecision({ id, ...data })
    if (res.code === 0) await fetchHistory()
    return res
  }

  async function fetchHistory() {
    try {
      const res = await getDecisionHistory()
      if (res.code === 0) history.value = res.data
    } catch { /* ignore */ }
  }

  return { currentDecision, analysisResult, history, loading, create, analyze, complete, fetchHistory }
})
