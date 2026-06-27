import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useChatStore } from '@/stores/chat'

describe('Chat Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  it('初始状态应包含 2 个预设会话', () => {
    const store = useChatStore()
    expect(store.sessions).toHaveLength(2)
  })

  it('初始当前会话 ID 应为 s1', () => {
    const store = useChatStore()
    expect(store.currentSessionId).toBe('s1')
  })

  it('currentSession 应返回当前会话', () => {
    const store = useChatStore()
    const session = store.currentSession()
    expect(session.id).toBe('s1')
    expect(session.title).toBe('优势解读咨询')
  })

  it('switchSession 应切换当前会话', () => {
    const store = useChatStore()
    store.switchSession('s2')
    expect(store.currentSessionId).toBe('s2')
    expect(store.currentSession().title).toBe('目标拆解咨询')
  })

  it('sendMessage 应添加用户消息', () => {
    const store = useChatStore()
    const session = store.currentSession()
    const initialLength = session.messages.length
    store.sendMessage('测试消息')
    expect(session.messages.length).toBe(initialLength + 1)
    expect(session.messages[initialLength].role).toBe('user')
    expect(session.messages[initialLength].content).toBe('测试消息')
    expect(session.messages[initialLength]).toHaveProperty('time')
  })

  it('sendMessage 应在延迟后添加 AI 回复', () => {
    const store = useChatStore()
    const session = store.currentSession()
    const initialLength = session.messages.length
    store.sendMessage('测试消息')
    vi.advanceTimersByTime(1500)
    expect(session.messages.length).toBe(initialLength + 2)
    expect(session.messages[initialLength + 1].role).toBe('assistant')
  })

  it('sendMessage 对不存在的会话不应报错', () => {
    const store = useChatStore()
    store.currentSessionId = 'nonexistent'
    expect(() => store.sendMessage('test')).not.toThrow()
  })

  it('newSession 应创建新会话并设为当前', () => {
    const store = useChatStore()
    const prevCount = store.sessions.length
    store.newSession()
    expect(store.sessions.length).toBe(prevCount + 1)
    expect(store.sessions[0].title).toBe('新对话')
    expect(store.sessions[0].messages).toHaveLength(1)
    expect(store.sessions[0].messages[0].role).toBe('assistant')
    expect(store.currentSessionId).toBe(store.sessions[0].id)
  })

  it('预设会话应包含消息', () => {
    const store = useChatStore()
    store.sessions.forEach(session => {
      expect(session.messages.length).toBeGreaterThan(0)
      session.messages.forEach(msg => {
        expect(msg).toHaveProperty('role')
        expect(msg).toHaveProperty('content')
        expect(msg).toHaveProperty('time')
        expect(['user', 'assistant']).toContain(msg.role)
      })
    })
  })
})