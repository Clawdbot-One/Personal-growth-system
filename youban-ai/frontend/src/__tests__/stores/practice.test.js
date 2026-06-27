import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePracticeStore } from '@/stores/practice'

describe('Practice Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('初始状态应包含 6 个预设项目', () => {
    const store = usePracticeStore()
    expect(store.projects).toHaveLength(6)
  })

  it('初始 practices 应为空数组', () => {
    const store = usePracticeStore()
    expect(store.practices).toEqual([])
  })

  it('getProject 应返回对应 id 的项目', () => {
    const store = usePracticeStore()
    const project = store.getProject(1)
    expect(project.name).toBe('30天写作挑战')
    expect(project.category).toBe('技能练习')
    expect(project.matchStrength).toBe('沟通表达')
  })

  it('getProject 对不存在的 id 应返回 undefined', () => {
    const store = usePracticeStore()
    expect(store.getProject(999)).toBeUndefined()
  })

  it('addPractice 应添加实践记录到列表顶部', () => {
    const store = usePracticeStore()
    store.addPractice(1, '今天完成了200字写作')
    expect(store.practices).toHaveLength(1)
    expect(store.practices[0].projectId).toBe(1)
    expect(store.practices[0].content).toBe('今天完成了200字写作')
    expect(store.practices[0]).toHaveProperty('id')
    expect(store.practices[0]).toHaveProperty('createdAt')
  })

  it('多次 addPractice 应按时间倒序排列', () => {
    const store = usePracticeStore()
    store.addPractice(1, '第一次')
    store.addPractice(2, '第二次')
    store.addPractice(3, '第三次')
    expect(store.practices).toHaveLength(3)
    expect(store.practices[0].content).toBe('第三次')
    expect(store.practices[1].content).toBe('第二次')
    expect(store.practices[2].content).toBe('第一次')
  })

  it('预设项目应包含必要字段', () => {
    const store = usePracticeStore()
    store.projects.forEach(project => {
      expect(project).toHaveProperty('id')
      expect(project).toHaveProperty('name')
      expect(project).toHaveProperty('category')
      expect(project).toHaveProperty('tags')
      expect(project).toHaveProperty('difficulty')
      expect(project).toHaveProperty('duration')
      expect(project).toHaveProperty('matchStrength')
      expect(project).toHaveProperty('matchScore')
      expect(project).toHaveProperty('desc')
      expect(project).toHaveProperty('steps')
      expect(project).toHaveProperty('benefit')
      expect(project).toHaveProperty('status')
    })
  })

  it('所有预设项目状态应为 published', () => {
    const store = usePracticeStore()
    store.projects.forEach(project => {
      expect(project.status).toBe('published')
    })
  })

  it('项目应包含合理的难度级别', () => {
    const store = usePracticeStore()
    const difficulties = store.projects.map(p => p.difficulty)
    expect(difficulties).toContain('简单')
    expect(difficulties).toContain('中等')
    expect(difficulties).toContain('困难')
  })
})