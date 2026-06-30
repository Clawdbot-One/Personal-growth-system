import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getCompoundGrowth, getMicroHabits, toggleMicroHabit, getStreakStats } from '@/api/compoundGrowth'

export const useCompoundGrowthStore = defineStore('compoundGrowth', () => {
  const growthData = ref([])
  const habits = ref([])
  const streakStats = ref(null)
  const loading = ref(false)

  async function fetchGrowthData() {
    loading.value = true
    try {
      const res = await getCompoundGrowth()
      if (res.code === 0) growthData.value = res.data
    } finally { loading.value = false }
  }

  async function fetchHabits() {
    try {
      const res = await getMicroHabits()
      if (res.code === 0) habits.value = res.data
    } catch { /* ignore */ }
  }

  async function toggleHabit(dimension, habitName) {
    const res = await toggleMicroHabit({ dimension, habitName })
    if (res.code === 0) await fetchHabits()
    return res
  }

  async function fetchStreakStats() {
    try {
      const res = await getStreakStats()
      if (res.code === 0) streakStats.value = res.data
    } catch { /* ignore */ }
  }

  return { growthData, habits, streakStats, loading, fetchGrowthData, fetchHabits, toggleHabit, fetchStreakStats }
})
