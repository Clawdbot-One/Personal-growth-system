import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAssessmentStore } from '@/stores/assessment'

describe('Assessment Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('初始状态应正确', () => {
    const store = useAssessmentStore()
    expect(store.currentTest).toBeNull()
    expect(store.answers).toEqual({})
    expect(store.currentQuestionIndex).toBe(0)
    expect(store.reports).toEqual([])
  })

  it('startTest 应初始化测评状态', () => {
    const store = useAssessmentStore()
    store.startTest('quick')
    expect(store.currentTest).toBe('quick')
    expect(store.answers).toEqual({})
    expect(store.currentQuestionIndex).toBe(0)
  })

  it('saveAnswer 应保存答案', () => {
    const store = useAssessmentStore()
    store.startTest('quick')
    store.saveAnswer(1, 'A')
    store.saveAnswer(2, 'B')
    expect(store.answers[1]).toBe('A')
    expect(store.answers[2]).toBe('B')
  })

  it('nextQuestion 应增加题目索引', () => {
    const store = useAssessmentStore()
    store.startTest('quick')
    store.nextQuestion()
    expect(store.currentQuestionIndex).toBe(1)
    store.nextQuestion()
    expect(store.currentQuestionIndex).toBe(2)
  })

  it('prevQuestion 应减少题目索引', () => {
    const store = useAssessmentStore()
    store.startTest('quick')
    store.currentQuestionIndex = 5
    store.prevQuestion()
    expect(store.currentQuestionIndex).toBe(4)
  })

  it('generateReport 应生成报告并添加到列表', () => {
    const store = useAssessmentStore()
    const report = store.generateReport('quick')
    expect(report).toHaveProperty('id')
    expect(report.type).toBe('quick')
    expect(report.scores).toHaveProperty('talent')
    expect(report.scores).toHaveProperty('skill')
    expect(report.scores).toHaveProperty('character')
    expect(report.scores).toHaveProperty('value')
    expect(report.topStrengths).toHaveLength(5)
    expect(report.blindSpots).toContain('时间管理')
    expect(report.blindSpots).toContain('压力应对')
    expect(report.recommendations).toHaveLength(3)
    expect(store.reports).toHaveLength(1)
  })

  it('多次调用 generateReport 应累积报告', () => {
    const store = useAssessmentStore()
    store.generateReport('quick')
    store.generateReport('full')
    expect(store.reports).toHaveLength(2)
  })

  it('quickQuestions 应包含 20 道题目', () => {
    const store = useAssessmentStore()
    expect(store.quickQuestions).toHaveLength(20)
  })

  it('每道题目应有 id、type、text、options 属性', () => {
    const store = useAssessmentStore()
    store.quickQuestions.forEach(q => {
      expect(q).toHaveProperty('id')
      expect(q).toHaveProperty('type')
      expect(q).toHaveProperty('text')
      expect(q).toHaveProperty('options')
      expect(Array.isArray(q.options)).toBe(true)
      expect(q.options.length).toBe(4)
    })
  })

  it('interviewQuestions 应包含 10 道开放式题目', () => {
    const store = useAssessmentStore()
    expect(store.interviewQuestions).toHaveLength(10)
  })

  it('generateReport 应生成包含 5 个优势维度的报告', () => {
    const store = useAssessmentStore()
    const report = store.generateReport('quick')
    expect(report.topStrengths).toHaveLength(5)
    expect(report.topStrengths[0]).toHaveProperty('name')
    expect(report.topStrengths[0]).toHaveProperty('desc')
    expect(report.topStrengths[0]).toHaveProperty('icon')
    expect(report.topStrengths[0]).toHaveProperty('color')
  })
})