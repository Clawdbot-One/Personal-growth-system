import { defineStore } from 'pinia'
import { ref } from 'vue'
import { analyzeValue, getValueHistory } from '@/api/valueAnalysis'

export const useValueAnalysisStore = defineStore('valueAnalysis', () => {
  const result = ref(null)
  const history = ref([])
  const loading = ref(false)

  async function runAnalysis(data) {
    loading.value = true
    try {
      const res = await analyzeValue(data)
      if (res.code === 0) result.value = res.data
      return res
    } finally { loading.value = false }
  }

  async function loadHistory() {
    try {
      const res = await getValueHistory()
      if (res.code === 0) history.value = res.data
    } catch { /* ignore */ }
  }

  return { result, history, loading, runAnalysis, loadHistory }
})
