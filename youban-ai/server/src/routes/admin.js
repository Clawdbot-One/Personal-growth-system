import db from '../db/init.js'

export function getAllMembers(req, res) {
  const { page = 1, pageSize = 20, keyword, status, level } = req.query
  const offset = (page - 1) * pageSize

  let where = 'WHERE 1=1'
  const params = []

  if (keyword) {
    where += ' AND (username LIKE ? OR nickname LIKE ? OR phone LIKE ?)'
    const kw = `%${keyword}%`
    params.push(kw, kw, kw)
  }
  if (status) {
    where += ' AND status = ?'
    params.push(status)
  }
  if (level) {
    where += ' AND member_level = ?'
    params.push(level)
  }

  const total = db.prepare(`SELECT COUNT(*) as count FROM members ${where}`).get(...params).count
  const members = db.prepare(`
    SELECT m.*, 
      ld.total_study_hours, ld.consecutive_days, ld.completed_tasks, ld.achievements
    FROM members m
    LEFT JOIN member_learning_data ld ON ld.member_id = m.id
    ${where}
    ORDER BY m.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, Number(pageSize), offset)

  const list = members.map(m => ({
    id: m.id,
    username: m.username,
    nickname: m.nickname,
    phone: m.phone,
    email: m.email,
    memberLevel: m.member_level,
    status: m.status,
    createdAt: m.created_at,
    lastLoginAt: m.last_login_at,
    stats: {
      totalHours: m.total_study_hours || 0,
      consecutiveDays: m.consecutive_days || 0,
      completedTasks: m.completed_tasks || 0,
      achievements: m.achievements || 0,
    },
  }))

  res.json({
    code: 0,
    data: { list, total, page: Number(page), pageSize: Number(pageSize) },
  })
}

export function getMemberDetail(req, res) {
  const { id } = req.params

  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(id)
  if (!member) {
    return res.status(404).json({ code: 404, message: '会员不存在' })
  }

  const learningData = db.prepare('SELECT * FROM member_learning_data WHERE member_id = ?').get(id)
  const strengthProfile = db.prepare('SELECT * FROM member_strength_profile WHERE member_id = ?').get(id)
  const assessmentCount = db.prepare('SELECT COUNT(*) as count FROM assessment_records WHERE member_id = ?').get(id).count
  const goalCount = db.prepare('SELECT COUNT(*) as count FROM growth_goals WHERE member_id = ?').get(id).count
  const practiceCount = db.prepare('SELECT COUNT(*) as count FROM practice_records WHERE member_id = ?').get(id).count

  res.json({
    code: 0,
    data: {
      id: member.id,
      username: member.username,
      nickname: member.nickname,
      phone: member.phone,
      email: member.email,
      memberLevel: member.member_level,
      status: member.status,
      createdAt: member.created_at,
      lastLoginAt: member.last_login_at,
      strengths: strengthProfile ? {
        top5: JSON.parse(strengthProfile.top_strengths || '[]'),
        scores: {
          talent: strengthProfile.talent_score,
          skill: strengthProfile.skill_score,
          character: strengthProfile.character_score,
          value: strengthProfile.value_score,
        },
      } : null,
      stats: {
        totalHours: learningData?.total_study_hours || 0,
        consecutiveDays: learningData?.consecutive_days || 0,
        completedTasks: learningData?.completed_tasks || 0,
        achievements: learningData?.achievements || 0,
      },
      counts: { assessments: assessmentCount, goals: goalCount, practices: practiceCount },
    },
  })
}

export function updateMemberStatus(req, res) {
  const { id } = req.params
  const { status, memberLevel } = req.body

  const updates = []
  const params = []

  if (status) { updates.push('status = ?'); params.push(status) }
  if (memberLevel) { updates.push('member_level = ?'); params.push(memberLevel) }

  if (updates.length === 0) {
    return res.status(400).json({ code: 400, message: '没有需要更新的字段' })
  }

  updates.push("updated_at = datetime('now', 'localtime')")
  params.push(id)

  db.prepare(`UPDATE members SET ${updates.join(', ')} WHERE id = ?`).run(...params)

  // Log
  db.prepare('INSERT INTO operation_logs (member_id, action, detail, ip) VALUES (?, ?, ?, ?)').run(
    id, 'admin_update_member', `管理员更新会员: ${id}`, req.ip
  )

  res.json({ code: 0, message: '更新成功' })
}

export function getMemberStats(req, res) {
  const totalMembers = db.prepare('SELECT COUNT(*) as count FROM members').get().count
  const activeMembers = db.prepare("SELECT COUNT(*) as count FROM members WHERE status = 'active'").get().count
  const premiumMembers = db.prepare("SELECT COUNT(*) as count FROM members WHERE member_level IN ('premium', 'vip')").get().count
  const newToday = db.prepare("SELECT COUNT(*) as count FROM members WHERE date(created_at) = date('now', 'localtime')").get().count
  const totalAssessments = db.prepare('SELECT COUNT(*) as count FROM assessment_records').get().count

  res.json({
    code: 0,
    data: {
      totalMembers,
      activeMembers,
      premiumMembers,
      newToday,
      totalAssessments,
    },
  })
}