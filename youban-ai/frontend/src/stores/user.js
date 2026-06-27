import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref('')
  const isDark = ref(false)
  const isLoggedIn = computed(() => !!token.value)

  // Mock 用户数据
  const mockUser = {
    id: 1,
    nickname: '探索者小明',
    phone: '138****8888',
    avatar: '',
    memberLevel: 'free',
    joinDate: '2026-01-15',
    strengths: {
      top5: ['战略思维', '学习能力', '责任担当', '沟通表达', '适应力'],
      scores: { talent: 85, skill: 72, character: 88, value: 79 },
    },
    stats: {
      consecutiveDays: 23,
      totalHours: 156,
      completedTasks: 48,
      achievements: 12,
    },
    goals: [],
  }

  function initFromStorage() {
    const saved = localStorage.getItem('youban_user')
    if (saved) {
      const data = JSON.parse(saved)
      user.value = data.user
      token.value = data.token
    } else {
      // 默认登录状态用于演示
      user.value = mockUser
      token.value = 'demo_token_xxx'
      saveToStorage()
    }
  }

  function saveToStorage() {
    localStorage.setItem('youban_user', JSON.stringify({
      user: user.value,
      token: token.value,
    }))
  }

  function login(phone, password) {
    // Mock login
    user.value = mockUser
    token.value = 'demo_token_xxx'
    saveToStorage()
    return true
  }

  function logout() {
    user.value = null
    token.value = ''
    localStorage.removeItem('youban_user')
  }

  function toggleTheme() {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  function updateProfile(data) {
    if (user.value) {
      user.value = { ...user.value, ...data }
      saveToStorage()
    }
  }

  return {
    user, token, isDark, isLoggedIn,
    login, logout, toggleTheme, updateProfile, initFromStorage,
  }
})