import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '@/api/request.js'

export const useMembershipStore = defineStore('membership', () => {
  const limits = ref(null)
  const loading = ref(false)

  const level = computed(() => limits.value?.level || 'free')
  const levelLabel = computed(() => limits.value?.levelLabel || '免费版')
  const isFree = computed(() => level.value === 'free')
  const isPremium = computed(() => level.value === 'premium')
  const isVip = computed(() => level.value === 'vip')
  const isAdmin = computed(() => level.value === 'admin')

  function getFeatureLimit(feature) {
    if (!limits.value?.limits) return { usage: 0, limit: 0, remaining: 0 }
    return limits.value.limits[feature] || { usage: 0, limit: Infinity, remaining: Infinity }
  }

  function canAccess(feature) {
    const f = getFeatureLimit(feature)
    if (f.limit === Infinity) return true
    return f.remaining > 0
  }

  async function fetchLimits() {
    loading.value = true
    try {
      const res = await request.get('/member/limits')
      if (res.code === 0) {
        limits.value = res.data
      }
    } catch {
      // Ignore error
    } finally {
      loading.value = false
    }
  }

  return {
    limits, loading, level, levelLabel, isFree, isPremium, isVip, isAdmin,
    getFeatureLimit, canAccess, fetchLimits,
  }
})