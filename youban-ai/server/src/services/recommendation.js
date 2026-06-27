import db from '../db/init.js'

const practiceProjects = [
  { id: 1, name: '30天写作挑战', category: '技能练习', difficulty: '中等', duration: '30天', matchStrength: '沟通表达', matchScore: 95 },
  { id: 2, name: '项目管理实战', category: '职场应用', difficulty: '困难', duration: '45天', matchStrength: '战略思维', matchScore: 88 },
  { id: 3, name: '副业探索实验室', category: '副业探索', difficulty: '中等', duration: '60天', matchStrength: '适应力', matchScore: 82 },
  { id: 4, name: '学习力飞轮', category: '技能练习', difficulty: '简单', duration: '21天', matchStrength: '学习能力', matchScore: 96 },
  { id: 5, name: '领导力训练营', category: '职场应用', difficulty: '困难', duration: '60天', matchStrength: '责任担当', matchScore: 90 },
  { id: 6, name: '深度阅读计划', category: '习惯养成', difficulty: '简单', duration: '30天', matchStrength: '学习能力', matchScore: 85 },
]

const careerPaths = [
  { title: '战略咨询', match: 92, reason: '战略思维优势突出' },
  { title: '项目管理', match: 88, reason: '责任担当与执行能力强' },
  { title: '产品经理', match: 85, reason: '沟通表达与学习能力兼备' },
  { title: '教育培训', match: 80, reason: '沟通表达能力优秀' },
  { title: '数据分析', match: 78, reason: '学习能力与逻辑思维好' },
]

const growthTopics = [
  { title: '高效学习方法论', reason: '提升学习效率' },
  { title: '公众演讲技巧', reason: '发挥沟通优势' },
  { title: '时间管理进阶', reason: '盲点补足' },
  { title: '领导力培养', reason: '责任担当延伸' },
  { title: '创新思维训练', reason: '适应力拓展' },
]

function scoreBasedRecommend(memberId) {
  const profile = db.prepare('SELECT * FROM member_strength_profile WHERE member_id = ?').get(memberId)
  if (!profile) return { practices: [], goals: [], topics: [], careers: [] }

  const topStrengths = JSON.parse(profile.top_strengths || '[]')
  const scores = { talent: profile.talent_score, skill: profile.skill_score, character: profile.character_score, value: profile.value_score }

  // Match practices based on strengths
  const matchedPractices = practiceProjects
    .filter(p => topStrengths.includes(p.matchStrength))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3)

  // Generate goal suggestions based on score gaps
  const goals = []
  const minScore = Math.min(scores.talent, scores.skill, scores.character, scores.value)
  const scoreLabels = { talent: '天赋', skill: '技能', character: '品格', value: '价值观' }
  for (const [key, val] of Object.entries(scores)) {
    if (val === minScore) {
      goals.push({
        title: `提升${scoreLabels[key]}维度`,
        description: `当前${scoreLabels[key]}得分为${val}，建议通过专题练习提升`,
        matchScore: Math.max(0, 100 - val),
      })
    }
  }

  // Career recommendations
  const careers = careerPaths.sort(() => Math.random() - 0.5).slice(0, 3)

  // Topic recommendations
  const topics = growthTopics.sort(() => Math.random() - 0.5).slice(0, 3)

  return { practices: matchedPractices, goals, topics, careers }
}

export function getRecommendations(req, res) {
  const memberId = req.member.id

  const recommendations = db.prepare(
    "SELECT * FROM recommendations WHERE member_id = ? AND status = 'pending' ORDER BY match_score DESC"
  ).all(memberId)

  if (recommendations.length === 0) {
    // Generate new recommendations
    generateRecommendations(memberId)
    const newRecs = db.prepare(
      "SELECT * FROM recommendations WHERE member_id = ? AND status = 'pending' ORDER BY match_score DESC"
    ).all(memberId)
    return res.json({ code: 0, data: newRecs })
  }

  res.json({ code: 0, data: recommendations })
}

export function generateRecommendations(memberId) {
  const result = scoreBasedRecommend(memberId)

  const insert = db.prepare(`
    INSERT INTO recommendations (member_id, type, title, description, match_score, match_reason)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  const insertMany = db.transaction((items) => {
    for (const item of items) {
      insert.run(item.memberId, item.type, item.title, item.description, item.matchScore, item.matchReason)
    }
  })

  const items = []

  for (const p of result.practices) {
    items.push({ memberId, type: 'practice', title: p.name, description: p.category, matchScore: p.matchScore, matchReason: `匹配优势: ${p.matchStrength}` })
  }
  for (const g of result.goals) {
    items.push({ memberId, type: 'goal', title: g.title, description: g.description, matchScore: g.matchScore, matchReason: '基于测评数据' })
  }
  for (const t of result.topics) {
    items.push({ memberId, type: 'topic', title: t.title, description: '', matchScore: 80, matchReason: t.reason })
  }
  for (const c of result.careers) {
    items.push({ memberId, type: 'career', title: c.title, description: '', matchScore: c.match, matchReason: c.reason })
  }

  if (items.length > 0) {
    insertMany(items)
  }
}

export function initRecommendations(memberId) {
  const items = [
    { memberId, type: 'practice', title: '学习力飞轮', description: '建立高效学习系统', matchScore: 96, matchReason: '新会员推荐' },
    { memberId, type: 'practice', title: '深度阅读计划', description: '培养阅读习惯', matchScore: 85, matchReason: '新会员推荐' },
    { memberId, type: 'goal', title: '完成首次优势测评', description: '了解自身优势，开启成长之旅', matchScore: 100, matchReason: '新会员引导' },
    { memberId, type: 'topic', title: '发现你的优势', description: '', matchScore: 90, matchReason: '新会员必读' },
    { memberId, type: 'career', title: '产品经理', description: '', matchScore: 85, matchReason: '综合推荐' },
  ]

  const insert = db.prepare(`
    INSERT INTO recommendations (member_id, type, title, description, match_score, match_reason)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  const insertMany = db.transaction((items) => {
    for (const item of items) {
      insert.run(item.memberId, item.type, item.title, item.description, item.matchScore, item.matchReason)
    }
  })

  insertMany(items)
}

export function acceptRecommendation(req, res) {
  const { id } = req.params
  db.prepare("UPDATE recommendations SET status = 'accepted' WHERE id = ?").run(id)

  // Log
  db.prepare('INSERT INTO operation_logs (member_id, action, detail, ip) VALUES (?, ?, ?, ?)').run(
    req.member.id, 'accept_recommendation', `接受建议: ${id}`, req.ip
  )

  res.json({ code: 0, message: '已接受建议' })
}

export function rejectRecommendation(req, res) {
  const { id } = req.params
  db.prepare("UPDATE recommendations SET status = 'rejected' WHERE id = ?").run(id)
  res.json({ code: 0, message: '已忽略建议' })
}