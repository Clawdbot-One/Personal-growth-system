import db from '../db/init.js'

const DIMENSIONS = [
  { key: 'talent', name: '天赋优势', icon: 'star' },
  { key: 'skill', name: '专业技能', icon: 'tool' },
  { key: 'character', name: '性格品质', icon: 'heart' },
  { key: 'value', name: '价值观', icon: 'compass' },
  { key: 'learning', name: '学习能力', icon: 'book' },
]

export function getCompoundGrowthData(req, res) {
  const memberId = req.member.id
  const records = db.prepare('SELECT * FROM compound_growth_records WHERE member_id = ? ORDER BY created_at DESC').all(memberId)

  const data = DIMENSIONS.map(dim => {
    const existing = records.find(r => r.dimension === dim.key)
    const dailyRate = existing ? existing.daily_growth_rate : (0.5 + Math.random() * 1.5)
    const currentLevel = existing ? existing.current_level : (30 + Math.random() * 40)
    const streakDays = existing ? existing.streak_days : Math.floor(Math.random() * 14)
    const projectedDays = Math.ceil(Math.log(100 / currentLevel) / Math.log(1 + dailyRate / 100))
    const projectedDate = new Date(Date.now() + projectedDays * 86400000).toISOString().slice(0, 10)

    return {
      dimension: dim.key,
      dimensionName: dim.name,
      icon: dim.icon,
      dailyGrowthRate: Math.round(dailyRate * 100) / 100,
      currentLevel: Math.round(currentLevel),
      streakDays,
      projectedMilestoneDate: projectedDate,
      nextMilestone: currentLevel < 50 ? '达到50%精通' : currentLevel < 75 ? '达到75%精通' : '达到100%精通',
      growthData: Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        level: Math.round(currentLevel * Math.pow(1 + dailyRate / 100, i)),
      })),
    }
  })

  res.json({ code: 0, data, message: '复利成长数据获取成功' })
}

export function getMicroHabits(req, res) {
  const memberId = req.member.id
  const today = new Date().toISOString().slice(0, 10)
  const logs = db.prepare("SELECT * FROM micro_habit_logs WHERE member_id = ? AND log_date = ?").all(memberId, today)

  const habits = DIMENSIONS.map(dim => ({
    id: dim.key,
    name: `${dim.name}微习惯`,
    dimension: dim.key,
    dimensionName: dim.name,
    description: getHabitDescription(dim.key),
    completed: logs.some(l => l.dimension === dim.key && l.completed),
    streak: db.prepare("SELECT COUNT(*) as cnt FROM micro_habit_logs WHERE member_id = ? AND dimension = ? AND completed = 1 AND log_date >= date('now', '-7 days', 'localtime')").get(memberId, dim.key)?.cnt || 0,
  }))

  res.json({ code: 0, data: habits })
}

export function toggleMicroHabit(req, res) {
  const memberId = req.member.id
  const { dimension, habitName } = req.body
  const today = new Date().toISOString().slice(0, 10)

  const existing = db.prepare("SELECT * FROM micro_habit_logs WHERE member_id = ? AND dimension = ? AND log_date = ?").get(memberId, dimension, today)
  if (existing) {
    db.prepare("UPDATE micro_habit_logs SET completed = ?, created_at = datetime('now', 'localtime') WHERE id = ?").run(existing.completed ? 0 : 1, existing.id)
  } else {
    db.prepare("INSERT INTO micro_habit_logs (member_id, habit_name, dimension, completed, log_date) VALUES (?, ?, ?, 1, ?)").run(memberId, habitName || dimension, dimension, today)
  }

  res.json({ code: 0, message: '打卡成功' })
}

function getHabitDescription(dim) {
  const map = {
    talent: '每天花10分钟做一件发挥天赋优势的事',
    skill: '每天学习一个专业技能知识点',
    character: '每天做一件体现品格的事',
    value: '每天花5分钟思考价值观与行动的一致性',
    learning: '每天阅读15分钟与成长相关的书籍',
  }
  return map[dim] || '每天坚持一个小行动'
}

export function getStreakStats(req, res) {
  const memberId = req.member.id
  const today = new Date().toISOString().slice(0, 10)
  const totalLogs = db.prepare("SELECT COUNT(*) as cnt FROM micro_habit_logs WHERE member_id = ? AND log_date = ? AND completed = 1").get(memberId, today)
  const weekLogs = db.prepare("SELECT COUNT(*) as cnt FROM micro_habit_logs WHERE member_id = ? AND completed = 1 AND log_date >= date('now', '-7 days', 'localtime')").get(memberId)
  const longestStreak = db.prepare("SELECT MAX(streak_days) as max FROM compound_growth_records WHERE member_id = ?").get(memberId)

  res.json({ code: 0, data: { todayCompleted: totalLogs?.cnt || 0, totalToday: DIMENSIONS.length, weekCompleted: weekLogs?.cnt || 0, longestStreak: longestStreak?.max || 0 } })
}
