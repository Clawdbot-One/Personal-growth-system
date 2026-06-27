import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGrowthStore = defineStore('growth', () => {
  const goals = ref([
    {
      id: 1,
      name: '提升公众演讲能力',
      desc: '能够在百人场合自信演讲，表达清晰有逻辑',
      category: '技能提升',
      priority: 'high',
      status: 'active',
      progress: 65,
      cycle: '3个月',
      milestones: [
        { id: 'm1', name: '基础学习', desc: '完成演讲技巧课程学习', done: true },
        { id: 'm2', name: '小范围练习', desc: '完成10次小组演讲练习', done: false },
        { id: 'm3', name: '实战演练', desc: '完成3次公开场合演讲', done: false },
        { id: 'm4', name: '能力认证', desc: '获得演讲相关认证或比赛名次', done: false },
      ],
      tasks: [
        { id: 't1', text: '完成《演讲的力量》阅读', due: '2026-06-28', done: true },
        { id: 't2', text: '录制3分钟自我介绍视频', due: '2026-07-01', done: false },
        { id: 't3', text: '参加Toastmasters俱乐部活动', due: '2026-07-05', done: false },
        { id: 't4', text: '准备5分钟主题演讲稿', due: '2026-07-08', done: false },
      ],
      createdAt: '2026-06-01',
    },
    {
      id: 2,
      name: '学习数据分析技能',
      desc: '掌握Python数据分析基础，能够独立完成数据分析报告',
      category: '职业发展',
      priority: 'medium',
      status: 'active',
      progress: 40,
      cycle: '6个月',
      milestones: [
        { id: 'm1', name: 'Python基础', desc: '掌握Python基础语法和数据处理库', done: true },
        { id: 'm2', name: '数据可视化', desc: '掌握Matplotlib和Seaborn', done: false },
        { id: 'm3', name: '统计分析', desc: '掌握描述统计和推断统计', done: false },
        { id: 'm4', name: '实战项目', desc: '完成2个完整数据分析项目', done: false },
      ],
      tasks: [
        { id: 't5', text: '完成Pandas基础教程', due: '2026-06-30', done: true },
        { id: 't6', text: '练习数据清洗操作', due: '2026-07-03', done: false },
        { id: 't7', text: '完成Matplotlib练习', due: '2026-07-10', done: false },
      ],
      createdAt: '2026-05-15',
    },
    {
      id: 3,
      name: '培养早起习惯',
      desc: '坚持每天早上6:30起床，利用早晨时间学习和锻炼',
      category: '习惯养成',
      priority: 'low',
      status: 'active',
      progress: 80,
      cycle: '1个月',
      milestones: [
        { id: 'm1', name: '适应期', desc: '连续7天6:30起床', done: true },
        { id: 'm2', name: '稳定期', desc: '连续21天6:30起床', done: true },
        { id: 'm3', name: '习惯固化', desc: '连续30天6:30起床', done: false },
      ],
      tasks: [
        { id: 't8', text: '设置6:30闹钟', due: '2026-06-27', done: true },
        { id: 't9', text: '准备第二天早起计划', due: '2026-06-28', done: false },
      ],
      createdAt: '2026-06-20',
    },
  ])

  const todayTasks = ref([
    { id: 'tt1', text: '完成3分钟自我介绍视频录制', goal: '提升公众演讲能力', done: false },
    { id: 'tt2', text: '完成Pandas数据清洗练习', goal: '学习数据分析技能', done: false },
    { id: 'tt3', text: '准备明天早起计划', goal: '培养早起习惯', done: false },
  ])

  function addGoal(goal) {
    goals.value.unshift({
      id: Date.now(),
      ...goal,
      progress: 0,
      milestones: [],
      tasks: [],
      createdAt: new Date().toISOString(),
    })
  }

  function updateGoalProgress(id, progress) {
    const goal = goals.value.find(g => g.id === id)
    if (goal) goal.progress = progress
  }

  function toggleTask(goalId, taskId) {
    const goal = goals.value.find(g => g.id === goalId)
    if (goal) {
      const task = goal.tasks.find(t => t.id === taskId)
      if (task) task.done = !task.done
    }
  }

  return { goals, todayTasks, addGoal, updateGoalProgress, toggleTask }
})