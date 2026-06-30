import db from '../db/init.js'
import { checkAccess, incrementUsage } from '../middleware/level.js'

export function getLearningData(req, res) {
  const memberId = req.member.id
  const data = db.prepare('SELECT * FROM member_learning_data WHERE member_id = ?').get(memberId)
  if (!data) {
    return res.status(404).json({ code: 404, message: '学习数据不存在' })
  }
  res.json({ code: 0, data })
}

export function saveAssessment(req, res) {
  const memberId = req.member.id
  const { testType, scores, topStrengths, blindSpots, recommendations } = req.body

  // 完整版和访谈版测评需要等级限制
  if (testType === 'full') {
    const access = checkAccess(memberId, 'assessment-full')
    if (!access.allowed) {
      return res.status(403).json({
        code: 403,
        message: access.reason || '完整版测评需要升级会员',
        data: {
          currentLevel: access.level,
          currentLevelLabel: access.levelLabel,
          usage: access.usage,
          limit: access.limit,
          feature: 'assessment-full',
          upgradeUrl: '/upgrade',
        },
      })
    }
    incrementUsage(memberId, 'assessment-full')
  } else if (testType === 'interview') {
    const access = checkAccess(memberId, 'assessment-interview')
    if (!access.allowed) {
      return res.status(403).json({
        code: 403,
        message: access.reason || '访谈版测评需要升级会员',
        data: {
          currentLevel: access.level,
          currentLevelLabel: access.levelLabel,
          usage: access.usage,
          limit: access.limit,
          feature: 'assessment-interview',
          upgradeUrl: '/upgrade',
        },
      })
    }
    incrementUsage(memberId, 'assessment-interview')
  }

  const result = db.prepare(`
    INSERT INTO assessment_records (member_id, test_type, scores, top_strengths, blind_spots, recommendations)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    memberId,
    testType,
    JSON.stringify(scores || {}),
    JSON.stringify(topStrengths || []),
    JSON.stringify(blindSpots || []),
    JSON.stringify(recommendations || [])
  )

  // Update strength profile
  if (topStrengths && topStrengths.length > 0) {
    db.prepare(`
      UPDATE member_strength_profile
      SET top_strengths = ?, talent_score = ?, skill_score = ?, character_score = ?, value_score = ?,
          updated_at = datetime('now', 'localtime')
      WHERE member_id = ?
    `).run(
      JSON.stringify(topStrengths.map(s => typeof s === 'string' ? s : s.name)),
      scores?.talent || 0,
      scores?.skill || 0,
      scores?.character || 0,
      scores?.value || 0,
      memberId
    )
  }

  // Update learning data
  db.prepare(`
    UPDATE member_learning_data
    SET completed_tasks = completed_tasks + 1,
        last_study_date = date('now', 'localtime'),
        updated_at = datetime('now', 'localtime')
    WHERE member_id = ?
  `).run(memberId)

  // Trigger new recommendations
  import('../services/recommendation.js').then(({ generateRecommendations }) => {
    generateRecommendations(memberId)
  })

  res.json({ code: 0, data: { id: result.lastInsertRowid }, message: '测评结果保存成功' })
}

export function getAssessments(req, res) {
  const memberId = req.member.id
  const records = db.prepare(
    'SELECT * FROM assessment_records WHERE member_id = ? ORDER BY created_at DESC'
  ).all(memberId)

  const list = records.map(r => ({
    id: r.id,
    testType: r.test_type,
    scores: JSON.parse(r.scores || '{}'),
    topStrengths: JSON.parse(r.top_strengths || '[]'),
    blindSpots: JSON.parse(r.blind_spots || '[]'),
    recommendations: JSON.parse(r.recommendations || '[]'),
    createdAt: r.created_at,
  }))

  res.json({ code: 0, data: list })
}

export function getGoals(req, res) {
  const memberId = req.member.id
  const goals = db.prepare(
    'SELECT * FROM growth_goals WHERE member_id = ? ORDER BY created_at DESC'
  ).all(memberId)

  const list = goals.map(g => {
    const milestones = db.prepare('SELECT * FROM goal_milestones WHERE goal_id = ?').all(g.id)
    const tasks = db.prepare('SELECT * FROM goal_tasks WHERE goal_id = ?').all(g.id)
    return {
      id: g.id,
      name: g.name,
      desc: g.description,
      category: g.category,
      priority: g.priority,
      status: g.status,
      progress: g.progress,
      cycle: g.cycle,
      milestones: milestones.map(m => ({ id: m.id, name: m.name, desc: m.description, done: !!m.done })),
      tasks: tasks.map(t => ({ id: t.id, text: t.text, due: t.due_date, done: !!t.done })),
      createdAt: g.created_at,
    }
  })

  res.json({ code: 0, data: list })
}

export function createGoal(req, res) {
  const memberId = req.member.id
  const { name, desc, category, priority, cycle, milestones, tasks } = req.body

  const result = db.prepare(`
    INSERT INTO growth_goals (member_id, name, description, category, priority, cycle)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(memberId, name, desc || '', category || '', priority || 'medium', cycle || '')

  const goalId = result.lastInsertRowid

  if (milestones && milestones.length > 0) {
    const insertMilestone = db.prepare('INSERT INTO goal_milestones (goal_id, name, description, done) VALUES (?, ?, ?, ?)')
    for (const m of milestones) {
      insertMilestone.run(goalId, m.name, m.desc || '', m.done ? 1 : 0)
    }
  }

  if (tasks && tasks.length > 0) {
    const insertTask = db.prepare('INSERT INTO goal_tasks (goal_id, text, due_date, done) VALUES (?, ?, ?, ?)')
    for (const t of tasks) {
      insertTask.run(goalId, t.text, t.due || null, t.done ? 1 : 0)
    }
  }

  res.json({ code: 0, data: { id: goalId }, message: '目标创建成功' })
}

export function updateGoal(req, res) {
  const { id } = req.params
  const { progress, status } = req.body

  db.prepare('UPDATE growth_goals SET progress = ?, status = ? WHERE id = ?').run(
    progress ?? 0, status ?? 'active', id
  )

  res.json({ code: 0, message: '目标更新成功' })
}

export function getPractices(req, res) {
  const memberId = req.member.id
  const records = db.prepare(
    'SELECT * FROM practice_records WHERE member_id = ? ORDER BY created_at DESC'
  ).all(memberId)

  res.json({ code: 0, data: records })
}

export function addPractice(req, res) {
  const memberId = req.member.id
  const { projectId, content } = req.body

  const result = db.prepare(`
    INSERT INTO practice_records (member_id, project_id, content) VALUES (?, ?, ?)
  `).run(memberId, projectId, content || '')

  res.json({ code: 0, data: { id: result.lastInsertRowid }, message: '实践记录添加成功' })
}