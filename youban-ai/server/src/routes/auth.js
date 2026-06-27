import bcrypt from 'bcryptjs'
import db from '../db/init.js'
import { generateToken } from '../middleware/auth.js'
import { initRecommendations } from '../services/recommendation.js'

export function register(req, res) {
  const { username, password, nickname, phone, email } = req.body

  if (!username || !password || !nickname) {
    return res.status(400).json({ code: 400, message: '用户名、密码和昵称为必填项' })
  }

  if (!phone) {
    return res.status(400).json({ code: 400, message: '手机号为必填项' })
  }

  if (!/^1[3-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ code: 400, message: '手机号格式不正确' })
  }

  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ code: 400, message: '用户名长度应为3-20个字符' })
  }

  if (password.length < 6) {
    return res.status(400).json({ code: 400, message: '密码长度不能少于6个字符' })
  }

  // Check if username exists
  const existing = db.prepare('SELECT id FROM members WHERE username = ?').get(username)
  if (existing) {
    return res.status(409).json({ code: 409, message: '用户名已存在' })
  }

  // Check if phone exists
  const phoneExist = db.prepare('SELECT id FROM members WHERE phone = ?').get(phone)
  if (phoneExist) {
    return res.status(409).json({ code: 409, message: '手机号已被注册' })
  }

  const passwordHash = bcrypt.hashSync(password, 10)

  const insertMember = db.prepare(`
    INSERT INTO members (username, password_hash, nickname, phone, email)
    VALUES (?, ?, ?, ?, ?)
  `)

  const result = insertMember.run(username, passwordHash, nickname, phone, email || '')

  // Create associated learning data
  db.prepare('INSERT INTO member_learning_data (member_id) VALUES (?)').run(result.lastInsertRowid)
  db.prepare('INSERT INTO member_strength_profile (member_id) VALUES (?)').run(result.lastInsertRowid)

  // Log
  db.prepare('INSERT INTO operation_logs (member_id, action, detail, ip) VALUES (?, ?, ?, ?)').run(
    result.lastInsertRowid, 'register', `会员注册: ${username}`, req.ip
  )

  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(result.lastInsertRowid)
  const token = generateToken(member)

  // Generate initial recommendations
  initRecommendations(member.id)

  res.json({
    code: 0,
    data: {
      token,
      user: {
        id: member.id,
        username: member.username,
        nickname: member.nickname,
        phone: member.phone,
        avatar: member.avatar,
        email: member.email,
        memberLevel: member.member_level,
        joinDate: member.created_at?.split(' ')[0],
      },
    },
    message: '注册成功',
  })
}

export function login(req, res) {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ code: 400, message: '用户名和密码不能为空' })
  }

  const member = db.prepare('SELECT * FROM members WHERE username = ?').get(username)
  if (!member) {
    return res.status(401).json({ code: 401, message: '用户名或密码错误' })
  }

  if (member.status === 'banned') {
    return res.status(403).json({ code: 403, message: '账号已被禁用，请联系管理员' })
  }

  if (member.status === 'inactive') {
    return res.status(403).json({ code: 403, message: '账号未激活' })
  }

  if (!bcrypt.compareSync(password, member.password_hash)) {
    return res.status(401).json({ code: 401, message: '用户名或密码错误' })
  }

  // Update last login
  db.prepare("UPDATE members SET last_login_at = datetime('now', 'localtime') WHERE id = ?").run(member.id)

  // Log
  db.prepare('INSERT INTO operation_logs (member_id, action, detail, ip) VALUES (?, ?, ?, ?)').run(
    member.id, 'login', '会员登录', req.ip
  )

  const token = generateToken(member)

  const learningData = db.prepare('SELECT * FROM member_learning_data WHERE member_id = ?').get(member.id)
  const strengthProfile = db.prepare('SELECT * FROM member_strength_profile WHERE member_id = ?').get(member.id)

  res.json({
    code: 0,
    data: {
      token,
      user: {
        id: member.id,
        username: member.username,
        nickname: member.nickname,
        phone: member.phone,
        avatar: member.avatar,
        email: member.email,
        memberLevel: member.member_level,
        joinDate: member.created_at?.split(' ')[0],
        strengths: {
          top5: strengthProfile?.top_strengths ? JSON.parse(strengthProfile.top_strengths) : [],
          scores: {
            talent: strengthProfile?.talent_score || 0,
            skill: strengthProfile?.skill_score || 0,
            character: strengthProfile?.character_score || 0,
            value: strengthProfile?.value_score || 0,
          },
        },
        stats: {
          consecutiveDays: learningData?.consecutive_days || 0,
          totalHours: learningData?.total_study_hours || 0,
          completedTasks: learningData?.completed_tasks || 0,
          achievements: learningData?.achievements || 0,
        },
      },
    },
    message: '登录成功',
  })
}

export function getProfile(req, res) {
  const memberId = req.member.id

  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(memberId)
  if (!member) {
    return res.status(404).json({ code: 404, message: '用户不存在' })
  }

  const learningData = db.prepare('SELECT * FROM member_learning_data WHERE member_id = ?').get(memberId)
  const strengthProfile = db.prepare('SELECT * FROM member_strength_profile WHERE member_id = ?').get(memberId)

  res.json({
    code: 0,
    data: {
      id: member.id,
      username: member.username,
      nickname: member.nickname,
      phone: member.phone,
      avatar: member.avatar,
      email: member.email,
      memberLevel: member.member_level,
      joinDate: member.created_at?.split(' ')[0],
      strengths: {
        top5: strengthProfile?.top_strengths ? JSON.parse(strengthProfile.top_strengths) : [],
        scores: {
          talent: strengthProfile?.talent_score || 0,
          skill: strengthProfile?.skill_score || 0,
          character: strengthProfile?.character_score || 0,
          value: strengthProfile?.value_score || 0,
        },
      },
      stats: {
        consecutiveDays: learningData?.consecutive_days || 0,
        totalHours: learningData?.total_study_hours || 0,
        completedTasks: learningData?.completed_tasks || 0,
        achievements: learningData?.achievements || 0,
      },
    },
  })
}

export function updateProfile(req, res) {
  const memberId = req.member.id
  const { nickname, phone, avatar, email } = req.body

  const updates = []
  const params = []

  if (nickname !== undefined) { updates.push('nickname = ?'); params.push(nickname) }
  if (phone !== undefined) { updates.push('phone = ?'); params.push(phone) }
  if (avatar !== undefined) { updates.push('avatar = ?'); params.push(avatar) }
  if (email !== undefined) { updates.push('email = ?'); params.push(email) }

  if (updates.length === 0) {
    return res.status(400).json({ code: 400, message: '没有需要更新的字段' })
  }

  updates.push("updated_at = datetime('now', 'localtime')")
  params.push(memberId)

  db.prepare(`UPDATE members SET ${updates.join(', ')} WHERE id = ?`).run(...params)

  // Log
  db.prepare('INSERT INTO operation_logs (member_id, action, detail, ip) VALUES (?, ?, ?, ?)').run(
    memberId, 'update_profile', '更新个人资料', req.ip
  )

  res.json({ code: 0, message: '更新成功' })
}

export function updateLearningData(req, res) {
  const memberId = req.member.id
  const { totalHours, consecutiveDays, completedTasks, achievements } = req.body

  const learningData = db.prepare('SELECT * FROM member_learning_data WHERE member_id = ?').get(memberId)
  if (!learningData) {
    return res.status(404).json({ code: 404, message: '学习数据不存在' })
  }

  db.prepare(`
    UPDATE member_learning_data
    SET total_study_hours = ?,
        consecutive_days = ?,
        completed_tasks = ?,
        achievements = ?,
        last_study_date = date('now', 'localtime'),
        updated_at = datetime('now', 'localtime')
    WHERE member_id = ?
  `).run(
    totalHours ?? learningData.total_study_hours,
    consecutiveDays ?? learningData.consecutive_days,
    completedTasks ?? learningData.completed_tasks,
    achievements ?? learningData.achievements,
    memberId
  )

  // Trigger new recommendations based on updated data
  import('../services/recommendation.js').then(({ generateRecommendations }) => {
    generateRecommendations(memberId)
  })

  res.json({ code: 0, message: '学习数据更新成功' })
}