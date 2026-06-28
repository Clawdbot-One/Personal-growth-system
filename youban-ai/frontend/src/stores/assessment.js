import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { saveAssessment as saveAssessmentApi, getAssessments as getAssessmentsApi } from '@/api/assessment'
import { useUserStore } from '@/stores/user'

export const useAssessmentStore = defineStore('assessment', () => {
  const currentTest = ref(null)
  const reportsLoading = ref(false)
  const answers = ref({})
  const currentQuestionIndex = ref(0)
  const reports = ref([])

  // Mock 测评问题
  const quickQuestions = [
    { id: 1, type: 'talent', text: '当你面对一个复杂问题时，你通常怎么做？', options: [
      { value: 'A', text: '先分析问题本质，再制定解决策略', score: 5 },
      { value: 'B', text: '立即行动，在实践中逐步摸索', score: 3 },
      { value: 'C', text: '求助他人，听取多方意见', score: 4 },
      { value: 'D', text: '先放一放，等灵感来临时再处理', score: 2 },
    ]},
    { id: 2, type: 'skill', text: '在团队协作中，你最擅长什么角色？', options: [
      { value: 'A', text: '领导者：统筹全局，分配任务', score: 5 },
      { value: 'B', text: '执行者：高效完成任务', score: 4 },
      { value: 'C', text: '协调者：促进团队沟通', score: 4 },
      { value: 'D', text: '创意者：提出新想法', score: 3 },
    ]},
    { id: 3, type: 'character', text: '面对截止日期临近的压力，你的反应是？', options: [
      { value: 'A', text: '更加专注，高效完成任务', score: 5 },
      { value: 'B', text: '感到焦虑但能按时完成', score: 3 },
      { value: 'C', text: '需要他人督促才能完成', score: 2 },
      { value: 'D', text: '提前规划，从不拖延', score: 4 },
    ]},
    { id: 4, type: 'value', text: '你认为工作中最重要的是什么？', options: [
      { value: 'A', text: '个人成长与学习机会', score: 5 },
      { value: 'B', text: '薪酬待遇与物质回报', score: 3 },
      { value: 'C', text: '工作与生活的平衡', score: 4 },
      { value: 'D', text: '社会影响力与价值实现', score: 4 },
    ]},
    { id: 5, type: 'talent', text: '在空闲时间，你最喜欢做什么？', options: [
      { value: 'A', text: '阅读学习新知识', score: 5 },
      { value: 'B', text: '与朋友社交聚会', score: 4 },
      { value: 'C', text: '独自思考与规划', score: 4 },
      { value: 'D', text: '动手做手工或创作', score: 3 },
    ]},
    { id: 6, type: 'skill', text: '你的学习方式偏向于？', options: [
      { value: 'A', text: '通过阅读和听课获取知识', score: 4 },
      { value: 'B', text: '通过实践和实验来学习', score: 5 },
      { value: 'C', text: '通过讨论和分享来加深理解', score: 4 },
      { value: 'D', text: '通过观察和模仿他人', score: 3 },
    ]},
    { id: 7, type: 'character', text: '当计划被打乱时，你会？', options: [
      { value: 'A', text: '灵活调整，快速适应新变化', score: 5 },
      { value: 'B', text: '感到不安，但努力调整心态', score: 3 },
      { value: 'C', text: '坚持原计划，拒绝变化', score: 2 },
      { value: 'D', text: '重新制定更完善的计划', score: 4 },
    ]},
    { id: 8, type: 'value', text: '你更看重哪种类型的成就感？', options: [
      { value: 'A', text: '完成高难度挑战的成就感', score: 5 },
      { value: 'B', text: '获得他人认可和赞赏', score: 3 },
      { value: 'C', text: '帮助他人成长和进步', score: 4 },
      { value: 'D', text: '创造出有价值的作品', score: 4 },
    ]},
    { id: 9, type: 'talent', text: '在信息过载时，你的处理方式？', options: [
      { value: 'A', text: '快速筛选关键信息，建立框架', score: 5 },
      { value: 'B', text: '逐一仔细阅读，不遗漏细节', score: 4 },
      { value: 'C', text: '感到无所适从，容易分心', score: 2 },
      { value: 'D', text: '借助工具和他人帮助整理', score: 3 },
    ]},
    { id: 10, type: 'skill', text: '你如何管理自己的时间？', options: [
      { value: 'A', text: '使用工具精细规划每一天', score: 4 },
      { value: 'B', text: '只设定大方向，灵活安排', score: 5 },
      { value: 'C', text: '根据紧急程度临时决定', score: 3 },
      { value: 'D', text: '经常拖延，需要外部督促', score: 2 },
    ]},
    { id: 11, type: 'character', text: '面对失败时，你的态度是？', options: [
      { value: 'A', text: '分析原因，从中学习成长', score: 5 },
      { value: 'B', text: '短暂沮丧后重新振作', score: 4 },
      { value: 'C', text: '自责很久，难以释怀', score: 2 },
      { value: 'D', text: '寻求外部支持和鼓励', score: 3 },
    ]},
    { id: 12, type: 'value', text: '你理想中的工作状态是？', options: [
      { value: 'A', text: '持续挑战，不断突破自我', score: 5 },
      { value: 'B', text: '稳定发展，逐步积累', score: 3 },
      { value: 'C', text: '自由灵活，不受约束', score: 4 },
      { value: 'D', text: '有意义，能产生社会价值', score: 4 },
    ]},
    { id: 13, type: 'talent', text: '你更擅长处理哪种类型的问题？', options: [
      { value: 'A', text: '逻辑分析类问题', score: 5 },
      { value: 'B', text: '人际沟通类问题', score: 4 },
      { value: 'C', text: '创意设计类问题', score: 4 },
      { value: 'D', text: '执行操作类问题', score: 3 },
    ]},
    { id: 14, type: 'skill', text: '在公开演讲或汇报时，你的表现？', options: [
      { value: 'A', text: '自信从容，表达清晰', score: 5 },
      { value: 'B', text: '有些紧张但能完成任务', score: 3 },
      { value: 'C', text: '非常紧张，需要充分准备', score: 2 },
      { value: 'D', text: '享受舞台，善于互动', score: 4 },
    ]},
    { id: 15, type: 'character', text: '你更偏向哪种决策风格？', options: [
      { value: 'A', text: '基于数据和逻辑分析', score: 5 },
      { value: 'B', text: '基于直觉和感受', score: 4 },
      { value: 'C', text: '听取多数人意见', score: 3 },
      { value: 'D', text: '反复权衡，难以决定', score: 2 },
    ]},
    { id: 16, type: 'value', text: '你认为个人成长最重要的是？', options: [
      { value: 'A', text: '持续学习与自我突破', score: 5 },
      { value: 'B', text: '建立良好的人际关系', score: 4 },
      { value: 'C', text: '找到热爱的事业方向', score: 4 },
      { value: 'D', text: '保持身心健康平衡', score: 3 },
    ]},
    { id: 17, type: 'talent', text: '你如何应对新领域的挑战？', options: [
      { value: 'A', text: '系统学习，逐步深入', score: 5 },
      { value: 'B', text: '边做边学，快速试错', score: 4 },
      { value: 'C', text: '寻找导师指导', score: 3 },
      { value: 'D', text: '从成功案例中学习', score: 4 },
    ]},
    { id: 18, type: 'skill', text: '你的写作/表达能力如何？', options: [
      { value: 'A', text: '善于用文字精准表达', score: 5 },
      { value: 'B', text: '口头表达优于书面', score: 4 },
      { value: 'C', text: '表达简洁但不够丰富', score: 3 },
      { value: 'D', text: '需要提升表达能力', score: 2 },
    ]},
    { id: 19, type: 'character', text: '在团队中，你更倾向于？', options: [
      { value: 'A', text: '主动承担责任，推动进展', score: 5 },
      { value: 'B', text: '做好本职工作，配合团队', score: 4 },
      { value: 'C', text: '观察后再决定参与程度', score: 3 },
      { value: 'D', text: '独立工作，减少协作', score: 2 },
    ]},
    { id: 20, type: 'value', text: '你对未来的态度是？', options: [
      { value: 'A', text: '充满期待，积极规划', score: 5 },
      { value: 'B', text: '随遇而安，顺其自然', score: 3 },
      { value: 'C', text: '有目标但时常迷茫', score: 4 },
      { value: 'D', text: '有些焦虑，不确定方向', score: 2 },
    ]},
  ]

  const fullQuestions = [...quickQuestions]

  const interviewQuestions = [
    { id: 'i1', text: '请描述一个你最近完成的最有成就感的事情，当时你是怎么做的？', type: 'open' },
    { id: 'i2', text: '在这个过程中，你觉得自己哪些能力或特质发挥了关键作用？', type: 'open' },
    { id: 'i3', text: '你平时在什么情况下会感到特别投入，甚至忘记时间？', type: 'open' },
    { id: 'i4', text: '回顾过去一年，你最大的成长是什么？这个成长是如何发生的？', type: 'open' },
    { id: 'i5', text: '在工作和生活中，别人经常向你求助的是哪类问题？', type: 'open' },
    { id: 'i6', text: '你觉得自己与同龄人相比，最与众不同的地方在哪里？', type: 'open' },
    { id: 'i7', text: '面对困难决定时，你通常会如何做决策？请举一个具体例子', type: 'open' },
    { id: 'i8', text: '你对未来3-5年有什么样的期待？你觉得实现这些需要哪些能力？', type: 'open' },
    { id: 'i9', text: '你更享受独立工作还是团队协作？为什么？', type: 'open' },
    { id: 'i10', text: '如果没有任何限制，你最想尝试什么领域？为什么？', type: 'open' },
  ]

  const strengths = [
    { name: '战略思维', desc: '善于从宏观视角分析问题，制定长远规划，预见未来趋势', traits: '分析力强、愿景驱动、系统性思考', icon: '🧠', color: '#2563EB' },
    { name: '学习能力', desc: '快速掌握新知识新技能，享受学习过程，善于知识迁移', traits: '好奇心强、吸收快、学以致用', icon: '📚', color: '#7C3AED' },
    { name: '责任担当', desc: '对自己的承诺和任务高度负责，做事可靠，值得信赖', traits: '可靠、自律、有始有终', icon: '🛡️', color: '#059669' },
    { name: '沟通表达', desc: '善于清晰表达想法，能有效影响他人，建立良好人际关系', traits: '表达清晰、善于倾听、有感染力', icon: '💬', color: '#F97316' },
    { name: '适应力', desc: '面对变化和不确定性时保持灵活，快速调整心态和策略', traits: '灵活、韧性、乐观', icon: '🌊', color: '#0891B2' },
  ]

  function startTest(type) {
    currentTest.value = type
    answers.value = {}
    currentQuestionIndex.value = 0
  }

  function saveAnswer(questionId, value) {
    answers.value[questionId] = value
  }

  function nextQuestion() {
    currentQuestionIndex.value++
  }

  function prevQuestion() {
    currentQuestionIndex.value--
  }

  function calcScoresFromAnswers(answerData, questionList) {
    // 按类型分组统计各维度得分
    const typeScores = { talent: [], skill: [], character: [], value: [] }
    for (const q of questionList) {
      const selected = answerData[q.id]
      if (!selected) continue
      const option = q.options?.find(o => o.value === selected)
      if (option && typeScores[q.type] !== undefined) {
        typeScores[q.type].push(option.score)
      }
    }
    // 计算各维度平均分并转换为百分制
    const scores = {}
    for (const [type, scoreList] of Object.entries(typeScores)) {
      if (scoreList.length > 0) {
        const avg = scoreList.reduce((a, b) => a + b, 0) / scoreList.length
        scores[type] = Math.round((avg / 5) * 100)
      } else {
        scores[type] = 50 + Math.floor(Math.random() * 20)
      }
    }
    return scores
  }

  function determineStrengthsFromScores(scores) {
    // 根据得分排序确定优势项
    const sorted = [...strengths].sort((a, b) => {
      // 使用得分 + 随机因子模拟基于得分的排序
      const seed = (scores.talent + scores.skill + scores.character + scores.value) % strengths.length
      return (Math.sin(seed * (strengths.indexOf(a) + 1)) + 1) * 0.5 - 0.5
    })
    return sorted.slice(0, 5)
  }

  async function generateReport(type) {
    const questionList = type === 'interview' ? [] : (type === 'full' ? fullQuestions : quickQuestions)
    const baseScores = type === 'interview'
      ? { talent: 60 + Math.floor(Math.random() * 35), skill: 55 + Math.floor(Math.random() * 35), character: 65 + Math.floor(Math.random() * 30), value: 60 + Math.floor(Math.random() * 35) }
      : calcScoresFromAnswers(answers.value, questionList)

    const topStrengths = determineStrengthsFromScores(baseScores)
    const report = {
      id: Date.now(),
      type,
      scores: baseScores,
      topStrengths,
      blindSpots: ['时间管理', '压力应对'],
      recommendations: [
        { career: '战略咨询', match: 92 },
        { career: '项目管理', match: 88 },
        { career: '产品经理', match: 85 },
      ],
      createdAt: new Date().toISOString(),
    }

    reports.value.unshift(report)

    // 持久化到后端
    try {
      const res = await saveAssessmentApi({
        testType: type,
        scores: baseScores,
        topStrengths: topStrengths.map(s => ({ name: s.name, category: s.traits, score: 80 })),
        blindSpots: report.blindSpots.map(b => ({ name: b, suggestion: '建议持续练习提升' })),
        recommendations: report.recommendations,
      })
      if (res.code === 0) {
        report.id = res.data.id
        report.saved = true
        // 刷新用户档案中的优势画像数据
        try {
          const userStore = useUserStore()
          await userStore.fetchProfile()
        } catch { /* 档案更新失败不影响报告生成 */ }
      }
    } catch {
      report.saved = false
    }

    return report
  }

  async function fetchReports() {
    reportsLoading.value = true
    try {
      const res = await getAssessmentsApi()
      if (res.code === 0 && res.data) {
        const apiReports = res.data.map(r => ({
          id: r.id,
          type: r.testType,
          scores: r.scores,
          topStrengths: r.topStrengths.map(s => ({
            name: s.name || s,
            desc: '',
            traits: s.category || '',
          })),
          blindSpots: r.blindSpots.map(b => typeof b === 'string' ? b : b.name || b),
          recommendations: r.recommendations,
          createdAt: r.createdAt,
          saved: true,
        }))
        // 合并本地未同步的报告
        const unsaved = reports.value.filter(r => !r.saved)
        reports.value = [...apiReports, ...unsaved]
      }
    } catch {
      // 加载失败时保留本地数据
    } finally {
      reportsLoading.value = false
    }
  }

  return {
    currentTest, answers, currentQuestionIndex, reports, reportsLoading,
    quickQuestions, fullQuestions, interviewQuestions,
    startTest, saveAnswer, nextQuestion, prevQuestion, generateReport, fetchReports,
  }
})