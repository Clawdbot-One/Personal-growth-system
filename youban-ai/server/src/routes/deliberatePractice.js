import db from '../db/init.js'
import {
  calculatePracticeQuality,
  assessZone,
  generateFeedback,
  generateTrainingPlan,
  analyzeFocusPattern,
} from '../services/deliberatePractice.js'

// ========== 训练计划管理 ==========

export function getPlans(req, res) {
  const memberId = req.member.id
  const plans = db.prepare(`
    SELECT * FROM dp_training_plans WHERE member_id = ? ORDER BY created_at DESC
  `).all(memberId)

  const list = plans.map(p => ({
    id: p.id,
    title: p.title,
    area: p.area,
    description: p.description,
    subGoals: JSON.parse(p.sub_goals || '[]'),
    currentLevel: p.current_level,
    targetLevel: p.target_level,
    status: p.status,
    createdAt: p.created_at,
  }))

  res.json({ code: 0, data: list })
}

export function createPlan(req, res) {
  const memberId = req.member.id
  const { area, goal } = req.body

  if (!area) {
    return res.status(400).json({ code: 400, message: '请选择训练领域' })
  }

  const plan = generateTrainingPlan(memberId, area, goal)

  db.prepare('INSERT INTO operation_logs (member_id, action, detail, ip) VALUES (?, ?, ?, ?)').run(
    memberId, 'create_training_plan', `创建训练计划: ${area}`, req.ip
  )

  res.json({ code: 0, data: plan, message: '训练计划已生成' })
}

export function updatePlanStatus(req, res) {
  const { id } = req.params
  const { status } = req.body

  db.prepare("UPDATE dp_training_plans SET status = ?, updated_at = datetime('now', 'localtime') WHERE id = ? AND member_id = ?")
    .run(status, id, req.member.id)

  res.json({ code: 0, message: '计划状态已更新' })
}

// ========== 练习会话管理 ==========

export function getSessions(req, res) {
  const memberId = req.member.id
  const { planId, limit = 20 } = req.query

  let query = 'SELECT * FROM dp_practice_sessions WHERE member_id = ?'
  const params = [memberId]

  if (planId) {
    query += ' AND plan_id = ?'
    params.push(planId)
  }

  query += ' ORDER BY created_at DESC LIMIT ?'
  params.push(Number(limit))

  const sessions = db.prepare(query).all(...params)

  const list = sessions.map(s => ({
    id: s.id,
    planId: s.plan_id,
    goal: s.goal,
    content: s.content,
    durationMinutes: s.duration_minutes,
    effectiveDurationMinutes: s.effective_duration_minutes,
    focusScore: s.focus_score,
    difficultyLevel: s.difficulty_level,
    reflection: s.reflection,
    createdAt: s.created_at,
  }))

  res.json({ code: 0, data: list })
}

export function createSession(req, res) {
  const memberId = req.member.id
  const { planId, goal, content, durationMinutes, effectiveMinutes, focusScore, difficultyLevel, reflection } = req.body

  if (!goal) {
    return res.status(400).json({ code: 400, message: '请输入练习目标' })
  }

  const result = db.prepare(`
    INSERT INTO dp_practice_sessions (member_id, plan_id, goal, content, duration_minutes, effective_duration_minutes, focus_score, difficulty_level, reflection)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(memberId, planId || null, goal, content || '', durationMinutes || 0, effectiveMinutes || 0, focusScore || 50, difficultyLevel || 'learning', reflection || '')

  const sessionId = result.lastInsertRowid

  // Calculate quality score
  const qualityScores = calculatePracticeQuality({
    goalClarity: goal ? 70 : 40,
    comfortZoneBreak: difficultyLevel === 'learning' ? 75 : difficultyLevel === 'comfort' ? 30 : 50,
    hasFeedback: true,
    focusIntensity: focusScore || 50,
    durationMinutes: durationMinutes || 0,
    effectiveMinutes: effectiveMinutes || 0,
  })

  db.prepare(`
    INSERT INTO dp_practice_quality_scores (session_id, goal_clarity_score, comfort_zone_break_score, feedback_quality_score, focus_intensity_score, overall_score, assessment)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(sessionId, qualityScores.goalClarityScore, qualityScores.comfortZoneBreakScore, qualityScores.feedbackQualityScore, qualityScores.focusIntensityScore, qualityScores.overallScore, qualityScores.assessment)

  // Generate feedback
  const session = {
    id: sessionId,
    member_id: memberId,
    goal,
    durationMinutes: durationMinutes || 0,
    effectiveDurationMinutes: effectiveMinutes || 0,
    difficultyLevel: difficultyLevel || 'learning',
  }
  const feedback = generateFeedback(session, qualityScores)

  db.prepare(`
    INSERT INTO dp_feedback_records (session_id, member_id, result_feedback, process_feedback, strategy_feedback, meta_feedback, improvement_suggestions)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(sessionId, memberId, feedback.resultFeedback, feedback.processFeedback, feedback.strategyFeedback, feedback.metaFeedback, JSON.stringify(feedback.improvementSuggestions))

  // Update learning data
  db.prepare(`
    UPDATE member_learning_data
    SET total_study_hours = total_study_hours + ?,
        completed_tasks = completed_tasks + 1,
        last_study_date = date('now', 'localtime'),
        updated_at = datetime('now', 'localtime')
    WHERE member_id = ?
  `).run((durationMinutes || 0) / 60, memberId)

  db.prepare('INSERT INTO operation_logs (member_id, action, detail, ip) VALUES (?, ?, ?, ?)').run(
    memberId, 'deliberate_practice', `完成刻意练习: ${goal}`, req.ip
  )

  res.json({
    code: 0,
    data: {
      sessionId,
      qualityScores,
      feedback,
    },
    message: '练习记录已保存',
  })
}

// ========== 练习质量评分 ==========

export function getQualityScores(req, res) {
  const memberId = req.member.id
  const { days = 30 } = req.query

  const scores = db.prepare(`
    SELECT qs.*, ps.goal, ps.created_at as session_time
    FROM dp_practice_quality_scores qs
    JOIN dp_practice_sessions ps ON qs.session_id = ps.id
    WHERE ps.member_id = ? AND ps.created_at >= date('now', ?)
    ORDER BY ps.created_at DESC
  `).all(memberId, `-${days} days`)

  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((s, r) => s + r.overall_score, 0) / scores.length)
    : 0

  res.json({
    code: 0,
    data: {
      scores: scores.map(s => ({
        sessionId: s.session_id,
        goal: s.goal,
        goalClarity: s.goal_clarity_score,
        comfortZoneBreak: s.comfort_zone_break_score,
        feedbackQuality: s.feedback_quality_score,
        focusIntensity: s.focus_intensity_score,
        overall: s.overall_score,
        assessment: s.assessment,
        time: s.session_time,
      })),
      avgScore,
      totalSessions: scores.length,
    },
  })
}

// ========== 三区评估 ==========

export function getZoneAssessment(req, res) {
  const memberId = req.member.id
  const { area } = req.query
  // 默认使用"战略思维"作为评估领域，避免 400 错误
  const effectiveArea = area || '战略思维'
  console.log(`[getZoneAssessment] called, area=${area}, effectiveArea=${effectiveArea}`)

  // Calculate recent performance
  const recentSessions = db.prepare(`
    SELECT * FROM dp_practice_sessions
    WHERE member_id = ? AND created_at >= date('now', '-7 days')
    ORDER BY created_at DESC LIMIT 10
  `).all(memberId)

  const totalSessions = recentSessions.length
  const learningSessions = recentSessions.filter(s => s.difficulty_level === 'learning').length
  const comfortSessions = recentSessions.filter(s => s.difficulty_level === 'comfort').length
  const panicSessions = recentSessions.filter(s => s.difficulty_level === 'panic').length

  const successRate = totalSessions > 0
    ? (learningSessions * 0.8 + comfortSessions * 0.95 + panicSessions * 0.3) / totalSessions
    : 0.7

  const avgDuration = totalSessions > 0
    ? recentSessions.reduce((s, r) => s + r.duration_minutes, 0) / totalSessions
    : 0

  const lastAssessment = db.prepare(`
    SELECT * FROM dp_zone_assessments WHERE member_id = ? AND area = ? ORDER BY created_at DESC LIMIT 1
  `).get(memberId, effectiveArea)

  const zoneResult = assessZone(memberId, effectiveArea, {
    successRate,
    avgDuration,
    difficulty: lastAssessment?.difficulty_level || 1.0,
  })

  // Save assessment
  db.prepare(`
    INSERT INTO dp_zone_assessments (member_id, area, comfort_zone_score, learning_zone_score, panic_zone_score, current_zone, difficulty_level)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(memberId, effectiveArea, zoneResult.comfortZoneScore, zoneResult.learningZoneScore, zoneResult.panicZoneScore, zoneResult.currentZone, zoneResult.difficultyLevel)

  res.json({
    code: 0,
    data: {
      ...zoneResult,
      recentStats: {
        totalSessions,
        comfortSessions,
        learningSessions,
        panicSessions,
        learningZoneRatio: totalSessions > 0 ? Math.round((learningSessions / totalSessions) * 100) : 0,
      },
    },
  })
}

// ========== 反馈记录 ==========

export function getFeedbackRecords(req, res) {
  const memberId = req.member.id
  const { sessionId, limit = 10 } = req.query

  let query = 'SELECT * FROM dp_feedback_records WHERE member_id = ?'
  const params = [memberId]

  if (sessionId) {
    query += ' AND session_id = ?'
    params.push(sessionId)
  }

  query += ' ORDER BY created_at DESC LIMIT ?'
  params.push(Number(limit))

  const records = db.prepare(query).all(...params)

  const list = records.map(r => ({
    id: r.id,
    sessionId: r.session_id,
    resultFeedback: r.result_feedback,
    processFeedback: r.process_feedback,
    strategyFeedback: r.strategy_feedback,
    metaFeedback: r.meta_feedback,
    improvementSuggestions: JSON.parse(r.improvement_suggestions || '[]'),
    isAdopted: !!r.is_adopted,
    createdAt: r.created_at,
  }))

  res.json({ code: 0, data: list })
}

export function adoptFeedback(req, res) {
  const { id } = req.params
  db.prepare("UPDATE dp_feedback_records SET is_adopted = 1, adopted_at = datetime('now', 'localtime') WHERE id = ? AND member_id = ?")
    .run(id, req.member.id)

  res.json({ code: 0, message: '已采纳反馈建议' })
}

// ========== 专注力训练 ==========

export function getFocusSessions(req, res) {
  const memberId = req.member.id
  const sessions = db.prepare(`
    SELECT * FROM dp_focus_sessions WHERE member_id = ? ORDER BY created_at DESC LIMIT 30
  `).all(memberId)

  const analysis = analyzeFocusPattern(memberId)

  res.json({
    code: 0,
    data: {
      sessions: sessions.map(s => ({
        id: s.id,
        durationMinutes: s.duration_minutes,
        focusScore: s.focus_score,
        distractionCount: s.distraction_count,
        mode: s.mode,
        timeOfDay: s.time_of_day,
        createdAt: s.created_at,
      })),
      analysis,
    },
  })
}

export function recordFocusSession(req, res) {
  const memberId = req.member.id
  const { durationMinutes, focusScore, distractionCount, mode } = req.body

  const hour = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })

  db.prepare(`
    INSERT INTO dp_focus_sessions (member_id, duration_minutes, focus_score, distraction_count, mode, time_of_day)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(memberId, durationMinutes || 0, focusScore || 0, distractionCount || 0, mode || 'normal', hour)

  db.prepare('INSERT INTO operation_logs (member_id, action, detail, ip) VALUES (?, ?, ?, ?)').run(
    memberId, 'focus_session', `专注力训练: ${durationMinutes}分钟`, req.ip
  )

  res.json({ code: 0, message: '专注力训练记录已保存' })
}

// ========== 心理表征测评 ==========

export function getMentalAssessments(req, res) {
  const memberId = req.member.id
  const assessments = db.prepare(`
    SELECT * FROM dp_mental_representation_assessments WHERE member_id = ? ORDER BY created_at DESC
  `).all(memberId)

  const list = assessments.map(a => ({
    id: a.id,
    area: a.area,
    stage: a.stage,
    patternRecognitionScore: a.pattern_recognition_score,
    situationalJudgmentScore: a.situational_judgment_score,
    analogicalReasoningScore: a.analogical_reasoning_score,
    overallMaturityScore: a.overall_maturity_score,
    assessmentData: JSON.parse(a.assessment_data || '{}'),
    createdAt: a.created_at,
  }))

  res.json({ code: 0, data: list })
}

export function createMentalAssessment(req, res) {
  const memberId = req.member.id
  const { area, patternRecognitionScore, situationalJudgmentScore, analogicalReasoningScore, assessmentData } = req.body

  const overall = Math.round(
    (patternRecognitionScore || 0) * 0.35 +
    (situationalJudgmentScore || 0) * 0.35 +
    (analogicalReasoningScore || 0) * 0.30
  )

  let stage = 'novice'
  if (overall >= 85) stage = 'expert'
  else if (overall >= 70) stage = 'proficient'
  else if (overall >= 50) stage = 'competent'
  else if (overall >= 30) stage = 'advanced_beginner'

  db.prepare(`
    INSERT INTO dp_mental_representation_assessments (member_id, area, stage, pattern_recognition_score, situational_judgment_score, analogical_reasoning_score, overall_maturity_score, assessment_data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(memberId, area, stage, patternRecognitionScore || 0, situationalJudgmentScore || 0, analogicalReasoningScore || 0, overall, JSON.stringify(assessmentData || {}))

  const stageLabels = {
    novice: '新手',
    advanced_beginner: '高级新手',
    competent: '胜任者',
    proficient: '精通者',
    expert: '专家',
  }

  res.json({
    code: 0,
    data: {
      stage,
      stageLabel: stageLabels[stage],
      overallMaturityScore: overall,
    },
    message: '心理表征测评完成',
  })
}

// ========== 仪表盘数据 ==========

export function getDashboard(req, res) {
  const memberId = req.member.id

  const totalSessions = db.prepare('SELECT COUNT(*) as count FROM dp_practice_sessions WHERE member_id = ?').get(memberId).count
  const avgQuality = db.prepare(`
    SELECT AVG(qs.overall_score) as avgScore
    FROM dp_practice_quality_scores qs
    JOIN dp_practice_sessions ps ON qs.session_id = ps.id
    WHERE ps.member_id = ?
  `).get(memberId)

  const zoneDistribution = db.prepare(`
    SELECT difficulty_level, COUNT(*) as count
    FROM dp_practice_sessions
    WHERE member_id = ? AND created_at >= date('now', '-30 days')
    GROUP BY difficulty_level
  `).all(memberId)

  const totalRecent = zoneDistribution.reduce((s, r) => s + r.count, 0)
  const learningRatio = totalRecent > 0
    ? Math.round(((zoneDistribution.find(z => z.difficulty_level === 'learning')?.count || 0) / totalRecent) * 100)
    : 0

  const focusAnalysis = analyzeFocusPattern(memberId)

  const weeklySessions = db.prepare(`
    SELECT date(created_at) as date, COUNT(*) as count
    FROM dp_practice_sessions
    WHERE member_id = ? AND created_at >= date('now', '-7 days')
    GROUP BY date(created_at)
    ORDER BY date
  `).all(memberId)

  res.json({
    code: 0,
    data: {
      totalSessions,
      avgQualityScore: avgQuality?.avgScore ? Math.round(avgQuality.avgScore) : 0,
      learningZoneRatio: learningRatio,
      focusAnalysis,
      weeklySessions: weeklySessions.map(s => ({ date: s.date, count: s.count })),
      zoneData: generateZoneData(memberId),
    },
  })
}

function generateZoneData(memberId) {
  const recentSessions = db.prepare(`
    SELECT * FROM dp_practice_sessions
    WHERE member_id = ? AND created_at >= date('now', '-7 days')
    ORDER BY created_at DESC LIMIT 10
  `).all(memberId)

  const totalSessions = recentSessions.length
  const learningSessions = recentSessions.filter(s => s.difficulty_level === 'learning').length
  const comfortSessions = recentSessions.filter(s => s.difficulty_level === 'comfort').length
  const panicSessions = recentSessions.filter(s => s.difficulty_level === 'panic').length

  const successRate = totalSessions > 0
    ? (learningSessions * 0.8 + comfortSessions * 0.95 + panicSessions * 0.3) / totalSessions
    : 0.7

  const avgDuration = totalSessions > 0
    ? recentSessions.reduce((s, r) => s + r.duration_minutes, 0) / totalSessions
    : 0

  const lastAssessment = db.prepare(`
    SELECT * FROM dp_zone_assessments WHERE member_id = ? ORDER BY created_at DESC LIMIT 1
  `).get(memberId)

  const zoneResult = assessZone(memberId, '战略思维', {
    successRate,
    avgDuration,
    difficulty: lastAssessment?.difficulty_level || 1.0,
  })

  return {
    ...zoneResult,
    recentStats: {
      totalSessions,
      comfortSessions,
      learningSessions,
      panicSessions,
      learningZoneRatio: totalSessions > 0 ? Math.round((learningSessions / totalSessions) * 100) : 0,
    },
  }
}