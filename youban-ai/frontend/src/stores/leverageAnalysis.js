import { defineStore } from 'pinia'
import { ref } from 'vue'
import { analyzeLeverage, getLeverageHistory } from '@/api/leverageAnalysis'

export const useLeverageAnalysisStore = defineStore('leverageAnalysis', () => {
  const result = ref(null)
  const history = ref([])
  const loading = ref(false)

  async function runAnalysis(data) {
    loading.value = true
    try {
      const res = await analyzeLeverage(data)
      if (res.code === 0) result.value = res.data
      return res
    } finally { loading.value = false }
  }

  async function loadHistory() {
    try {
      const res = await getLeverageHistory()
      if (res.code === 0) history.value = res.data
    } catch { /* ignore */ }
  }

  return { result, history, loading, runAnalysis, loadHistory }
})
