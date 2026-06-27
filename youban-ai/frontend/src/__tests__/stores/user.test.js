import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('初始状态应正确', () => {
    const store = useUserStore()
    expect(store.user).toBeNull()
    expect(store.token).toBe('')
    expect(store.isDark).toBe(false)
    expect(store.isLoggedIn).toBe(false)
  })

  it('login 应设置用户和 token 并持久化', () => {
    const store = useUserStore()
    const result = store.login('13800000000', 'password')
    expect(result).toBe(true)
    expect(store.token).toBe('demo_token_xxx')
    expect(store.user.nickname).toBe('探索者小明')
    expect(store.isLoggedIn).toBe(true)

    const saved = JSON.parse(localStorage.getItem('youban_user'))
    expect(saved.user.nickname).toBe('探索者小明')
    expect(saved.token).toBe('demo_token_xxx')
  })

  it('logout 应清除用户和 token', () => {
    const store = useUserStore()
    store.login('13800000000', 'password')
    store.logout()
    expect(store.user).toBeNull()
    expect(store.token).toBe('')
    expect(store.isLoggedIn).toBe(false)
    expect(localStorage.getItem('youban_user')).toBeNull()
  })

  it('initFromStorage 在无存储时应使用默认 mock 用户登录', () => {
    const store = useUserStore()
    store.initFromStorage()
    expect(store.user.nickname).toBe('探索者小明')
    expect(store.token).toBe('demo_token_xxx')
    expect(store.isLoggedIn).toBe(true)
  })

  it('initFromStorage 应从 localStorage 恢复数据', () => {
    const savedData = {
      user: { id: 99, nickname: '测试用户' },
      token: 'saved_token',
    }
    localStorage.setItem('youban_user', JSON.stringify(savedData))
    const store = useUserStore()
    store.initFromStorage()
    expect(store.user.nickname).toBe('测试用户')
    expect(store.token).toBe('saved_token')
  })

  it('toggleTheme 应切换暗色模式', () => {
    const store = useUserStore()
    expect(store.isDark).toBe(false)
    store.toggleTheme()
    expect(store.isDark).toBe(true)
    store.toggleTheme()
    expect(store.isDark).toBe(false)
  })

  it('updateProfile 应更新用户信息并持久化', () => {
    const store = useUserStore()
    store.login('13800000000', 'password')
    store.updateProfile({ nickname: '新昵称', avatar: 'new_avatar.png' })
    expect(store.user.nickname).toBe('新昵称')
    expect(store.user.avatar).toBe('new_avatar.png')
    expect(store.user.phone).toBe('138****8888')

    const saved = JSON.parse(localStorage.getItem('youban_user'))
    expect(saved.user.nickname).toBe('新昵称')
  })

  it('updateProfile 在 user 为 null 时不应报错', () => {
    const store = useUserStore()
    expect(() => store.updateProfile({ nickname: 'test' })).not.toThrow()
  })

  it('mock 用户应有完整的优势数据', () => {
    const store = useUserStore()
    store.login('13800000000', 'password')
    expect(store.user.strengths.top5).toHaveLength(5)
    expect(store.user.strengths.scores).toHaveProperty('talent')
    expect(store.user.strengths.scores).toHaveProperty('skill')
    expect(store.user.strengths.scores).toHaveProperty('character')
    expect(store.user.strengths.scores).toHaveProperty('value')
    expect(store.user.stats).toHaveProperty('consecutiveDays')
    expect(store.user.stats).toHaveProperty('totalHours')
    expect(store.user.stats).toHaveProperty('completedTasks')
    expect(store.user.stats).toHaveProperty('achievements')
  })
})