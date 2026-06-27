import db from '../db/init.js'
import bcrypt from 'bcryptjs'

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
  const { status, memberLevel, nickname, phone, email } = req.body

  const updates = []
  const params = []

  if (status !== undefined) { updates.push('status = ?'); params.push(status) }
  if (memberLevel !== undefined) { updates.push('member_level = ?'); params.push(memberLevel) }
  if (nickname !== undefined) { updates.push('nickname = ?'); params.push(nickname) }
  if (phone !== undefined) { updates.push('phone = ?'); params.push(phone) }
  if (email !== undefined) { updates.push('email = ?'); params.push(email) }

  if (updates.length === 0) {
    return res.status(400).json({ code: 400, message: '没有需要更新的字段' })
  }

  updates.push("updated_at = datetime('now', 'localtime')")
  params.push(id)

  db.prepare(`UPDATE members SET ${updates.join(', ')} WHERE id = ?`).run(...params)

  // Log
  db.prepare('INSERT INTO operation_logs (member_id, action, detail, ip) VALUES (?, ?, ?, ?)').run(
    req.member.id, 'admin_update_member', `管理员更新会员: ${id}`, req.ip
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

// ========== 管理员账号管理 ==========

export function getAdminAccounts(req, res) {
  const admins = db.prepare(`
    SELECT m.*, ld.total_study_hours, ld.consecutive_days, ld.completed_tasks
    FROM members m
    LEFT JOIN member_learning_data ld ON ld.member_id = m.id
    WHERE m.member_level = 'admin'
    ORDER BY m.created_at ASC
  `).all()

  const list = admins.map(m => ({
    id: m.id,
    username: m.username,
    nickname: m.nickname,
    phone: m.phone,
    email: m.email,
    status: m.status,
    createdAt: m.created_at,
    lastLoginAt: m.last_login_at,
    stats: {
      totalHours: m.total_study_hours || 0,
      consecutiveDays: m.consecutive_days || 0,
      completedTasks: m.completed_tasks || 0,
    },
  }))

  res.json({ code: 0, data: list })
}

export function createAdminAccount(req, res) {
  const { username, password, nickname, phone, email } = req.body

  if (!username || !password || !nickname || !phone) {
    return res.status(400).json({ code: 400, message: '用户名、密码、昵称和手机号为必填项' })
  }

  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ code: 400, message: '用户名长度应为3-20个字符' })
  }

  if (password.length < 6) {
    return res.status(400).json({ code: 400, message: '密码长度不能少于6位' })
  }

  const existing = db.prepare('SELECT id FROM members WHERE username = ?').get(username)
  if (existing) {
    return res.status(409).json({ code: 409, message: '用户名已存在' })
  }

  const hash = bcrypt.hashSync(password, 10)
  const result = db.prepare(`
    INSERT INTO members (username, password_hash, nickname, phone, email, member_level)
    VALUES (?, ?, ?, ?, ?, 'admin')
  `).run(username, hash, nickname, phone, email || '')

  db.prepare('INSERT INTO member_learning_data (member_id) VALUES (?)').run(result.lastInsertRowid)
  db.prepare('INSERT INTO member_strength_profile (member_id) VALUES (?)').run(result.lastInsertRowid)

  db.prepare('INSERT INTO operation_logs (member_id, action, detail, ip) VALUES (?, ?, ?, ?)').run(
    req.member.id, 'create_admin', `创建管理员: ${username}`, req.ip
  )

  res.json({ code: 0, data: { id: result.lastInsertRowid }, message: '管理员账号创建成功' })
}

export function deleteAdminAccount(req, res) {
  const { id } = req.params

  const admin = db.prepare("SELECT * FROM members WHERE id = ? AND member_level = 'admin'").get(id)
  if (!admin) {
    return res.status(404).json({ code: 404, message: '管理员账号不存在' })
  }

  // Prevent deleting the last admin
  const adminCount = db.prepare("SELECT COUNT(*) as count FROM members WHERE member_level = 'admin'").get().count
  if (adminCount <= 1) {
    return res.status(400).json({ code: 400, message: '不能删除最后一个管理员账号' })
  }

  db.prepare('DELETE FROM members WHERE id = ?').run(id)

  db.prepare('INSERT INTO operation_logs (member_id, action, detail, ip) VALUES (?, ?, ?, ?)').run(
    req.member.id, 'delete_admin', `删除管理员: ${admin.username}`, req.ip
  )

  res.json({ code: 0, message: '管理员账号已删除' })
}

export function resetAdminPassword(req, res) {
  const { id } = req.params
  const { password } = req.body

  if (!password || password.length < 6) {
    return res.status(400).json({ code: 400, message: '新密码长度不能少于6位' })
  }

  const admin = db.prepare("SELECT * FROM members WHERE id = ? AND member_level = 'admin'").get(id)
  if (!admin) {
    return res.status(404).json({ code: 404, message: '管理员账号不存在' })
  }

  const hash = bcrypt.hashSync(password, 10)
  db.prepare("UPDATE members SET password_hash = ?, updated_at = datetime('now', 'localtime') WHERE id = ?").run(hash, id)

  db.prepare('INSERT INTO operation_logs (member_id, action, detail, ip) VALUES (?, ?, ?, ?)').run(
    req.member.id, 'reset_admin_password', `重置管理员密码: ${admin.username}`, req.ip
  )

  res.json({ code: 0, message: '密码重置成功' })
}