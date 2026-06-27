import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '@/api/request.js'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref('')
  const isDark = ref(false)
  const isLoggedIn = computed(() => !!token.value)

  function initFromStorage() {
    const savedToken = localStorage.getItem('youban_token')
    const savedUser = localStorage.getItem('youban_user')
    if (savedToken && savedUser) {
      token.value = savedToken
      try {
        user.value = JSON.parse(savedUser)
      } catch {
        user.value = null
      }
    }
  }

  function saveToStorage() {
    localStorage.setItem('youban_token', token.value)
    localStorage.setItem('youban_user', JSON.stringify(user.value))
  }

  async function fetchProfile() {
    try {
      const res = await request.get('/auth/profile')
      if (res.code === 0) {
        user.value = res.data
        saveToStorage()
      }
    } catch {
      // Ignore error
    }
  }

  async function login(username, password) {
    const res = await request.post('/auth/login', { username, password })
    if (res.code === 0) {
      token.value = res.data.token
      user.value = res.data.user
      saveToStorage()
      return true
    }
    return false
  }

  async function register(username, password, nickname) {
    const res = await request.post('/auth/register', { username, password, nickname })
    if (res.code === 0) {
      token.value = res.data.token
      user.value = res.data.user
      saveToStorage()
      return true
    }
    return false
  }

  function logout() {
    user.value = null
    token.value = ''
    localStorage.removeItem('youban_token')
    localStorage.removeItem('youban_user')
  }

  function toggleTheme() {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  async function updateProfile(data) {
    try {
      const res = await request.put('/auth/profile', data)
      if (res.code === 0 && user.value) {
        user.value = { ...user.value, ...data }
        saveToStorage()
      }
    } catch {
      // Ignore error
    }
  }

  return {
    user, token, isDark, isLoggedIn,
    login, register, logout, toggleTheme, updateProfile, initFromStorage, fetchProfile,
  }
})