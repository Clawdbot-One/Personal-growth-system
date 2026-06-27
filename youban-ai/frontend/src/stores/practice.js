import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePracticeStore = defineStore('practice', () => {
  const projects = ref([
    {
      id: 1,
      name: '30天写作挑战',
      category: '技能练习',
      tags: ['写作', '表达', '坚持'],
      difficulty: '中等',
      duration: '30天',
      matchStrength: '沟通表达',
      matchScore: 95,
      desc: '通过30天持续写作练习，提升文字表达能力和思维逻辑',
      steps: [
        '第1周：每天写200字日记',
        '第2周：每天写500字主题文章',
        '第3周：尝试不同文体写作',
        '第4周：完成一篇1500字长文',
      ],
      benefit: '提升书面表达能力、逻辑思维、知识沉淀能力',
      status: 'published',
    },
    {
      id: 2,
      name: '项目管理实战',
      category: '职场应用',
      tags: ['管理', '协作', '执行'],
      difficulty: '困难',
      duration: '45天',
      matchStrength: '战略思维',
      matchScore: 88,
      desc: '以真实项目为载体，实践项目管理全流程',
      steps: [
        '项目启动：明确目标、范围、干系人',
        '项目规划：制定WBS、甘特图、风险预案',
        '项目执行：团队协作、进度跟踪',
        '项目收尾：复盘总结、经验沉淀',
      ],
      benefit: '提升项目管理能力、团队协作能力、风险预判能力',
      status: 'published',
    },
    {
      id: 3,
      name: '副业探索实验室',
      category: '副业探索',
      tags: ['创业', '创意', '商业'],
      difficulty: '中等',
      duration: '60天',
      matchStrength: '适应力',
      matchScore: 82,
      desc: '从0到1探索一个副业方向，验证商业模式',
      steps: [
        '市场调研：发现需求与机会',
        '最小可行产品：快速搭建MVP',
        '获取前10个用户',
        '迭代优化与推广',
      ],
      benefit: '培养商业思维、执行力、用户洞察能力',
      status: 'published',
    },
    {
      id: 4,
      name: '学习力飞轮',
      category: '技能练习',
      tags: ['学习', '效率', '方法'],
      difficulty: '简单',
      duration: '21天',
      matchStrength: '学习能力',
      matchScore: 96,
      desc: '建立高效学习系统，掌握费曼学习法、间隔重复等核心方法',
      steps: [
        '学习费曼学习法并实践',
        '建立个人知识管理系统',
        '实践间隔重复记忆法',
        '形成每日学习SOP',
      ],
      benefit: '提升学习效率、知识吸收率、长期记忆能力',
      status: 'published',
    },
    {
      id: 5,
      name: '领导力训练营',
      category: '职场应用',
      tags: ['领导力', '团队', '影响力'],
      difficulty: '困难',
      duration: '60天',
      matchStrength: '责任担当',
      matchScore: 90,
      desc: '通过实际带领小团队完成项目，锻炼领导力',
      steps: [
        '组建3-5人小团队',
        '制定团队目标与分工',
        '定期团队沟通与反馈',
        '完成项目并复盘',
      ],
      benefit: '提升领导力、团队管理、决策能力',
      status: 'published',
    },
    {
      id: 6,
      name: '深度阅读计划',
      category: '习惯养成',
      tags: ['阅读', '思考', '沉淀'],
      difficulty: '简单',
      duration: '30天',
      matchStrength: '学习能力',
      matchScore: 85,
      desc: '每天深度阅读30分钟，并输出读书笔记',
      steps: [
        '选择3本成长类书籍',
        '每天阅读30分钟并做笔记',
        '每周输出一篇读书心得',
        '月末完成书籍思维导图',
      ],
      benefit: '提升阅读理解力、思考深度、知识体系构建能力',
      status: 'published',
    },
  ])

  const practices = ref([])

  function getProject(id) {
    return projects.value.find(p => p.id === Number(id))
  }

  function addPractice(projectId, content) {
    practices.value.unshift({
      id: Date.now(),
      projectId,
      content,
      createdAt: new Date().toISOString(),
    })
  }

  return { projects, practices, getProject, addPractice }
})