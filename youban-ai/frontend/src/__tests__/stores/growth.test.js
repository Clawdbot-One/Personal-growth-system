import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGrowthStore } from '@/stores/growth'

describe('Growth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('初始状态应包含 3 个预设目标', () => {
    const store = useGrowthStore()
    expect(store.goals).toHaveLength(3)
  })

  it('初始状态应包含 3 个今日任务', () => {
    const store = useGrowthStore()
    expect(store.todayTasks).toHaveLength(3)
  })

  it('addGoal 应添加新目标到列表顶部', () => {
    const store = useGrowthStore()
    const newGoal = {
      name: '测试目标',
      desc: '测试描述',
      category: '测试',
      priority: 'high',
      status: 'active',
      cycle: '1个月',
    }
    store.addGoal(newGoal)
    expect(store.goals).toHaveLength(4)
    expect(store.goals[0].name).toBe('测试目标')
    expect(store.goals[0].progress).toBe(0)
    expect(store.goals[0].milestones).toEqual([])
    expect(store.goals[0].tasks).toEqual([])
  })

  it('updateGoalProgress 应更新目标进度', () => {
    const store = useGrowthStore()
    store.updateGoalProgress(1, 75)
    const goal = store.goals.find(g => g.id === 1)
    expect(goal.progress).toBe(75)
  })

  it('updateGoalProgress 对不存在的 id 不应报错', () => {
    const store = useGrowthStore()
    expect(() => store.updateGoalProgress(999, 50)).not.toThrow()
  })

  it('toggleTask 应切换任务完成状态', () => {
    const store = useGrowthStore()
    const goal = store.goals.find(g => g.id === 1)
    const task = goal.tasks[1]
    const originalDone = task.done

    store.toggleTask(1, task.id)
    expect(task.done).toBe(!originalDone)

    store.toggleTask(1, task.id)
    expect(task.done).toBe(originalDone)
  })

  it('toggleTask 对不存在的 goal 或 task 不应报错', () => {
    const store = useGrowthStore()
    expect(() => store.toggleTask(999, 't1')).not.toThrow()
    expect(() => store.toggleTask(1, 'nonexistent')).not.toThrow()
  })

  it('预设目标应包含必要字段', () => {
    const store = useGrowthStore()
    store.goals.forEach(goal => {
      expect(goal).toHaveProperty('id')
      expect(goal).toHaveProperty('name')
      expect(goal).toHaveProperty('desc')
      expect(goal).toHaveProperty('category')
      expect(goal).toHaveProperty('priority')
      expect(goal).toHaveProperty('status')
      expect(goal).toHaveProperty('progress')
      expect(goal).toHaveProperty('cycle')
      expect(goal).toHaveProperty('milestones')
      expect(goal).toHaveProperty('tasks')
      expect(goal).toHaveProperty('createdAt')
    })
  })

  it('预设目标的状态应为 active', () => {
    const store = useGrowthStore()
    store.goals.forEach(goal => {
      expect(goal.status).toBe('active')
    })
  })
})