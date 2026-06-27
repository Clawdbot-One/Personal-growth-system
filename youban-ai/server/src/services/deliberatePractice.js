import db from '../db/init.js'

// ========== 刻意练习质量评分引擎 ==========

/**
 * 四维度加权评分：目标明确度(25%)、走出舒适区(25%)、即时反馈(25%)、高度专注(25%)
 */
export function calculatePracticeQuality({ goalClarity, comfortZoneBreak, hasFeedback, focusIntensity, durationMinutes, effectiveMinutes }) {
  const goalClarityScore = Math.min(100, Math.max(0, goalClarity || 60))
  const comfortZoneBreakScore = Math.min(100, Math.max(0, comfortZoneBreak || 50))
  const feedbackScore = Math.min(100, Math.max(0, hasFeedback ? 70 : 30))
  const focusScore = Math.min(100, Math.max(0, focusIntensity || 50))

  const overall = Math.round(
    goalClarityScore * 0.25 +
    comfortZoneBreakScore * 0.25 +
    feedbackScore * 0.25 +
    focusScore * 0.25
  )

  const effectiveRatio = durationMinutes > 0 ? Math.round((effectiveMinutes / durationMinutes) * 100) : 0
  const adjustedOverall = Math.round(overall * 0.7 + effectiveRatio * 0.3)

  let assessment = ''
  if (adjustedOverall >= 85) assessment = '优秀：这是一次高质量的刻意练习，四个维度均表现良好'
  else if (adjustedOverall >= 70) assessment = '良好：接近刻意练习的黄金标准，建议在薄弱维度上加强'
  else if (adjustedOverall >= 50) assessment = '一般：部分维度达到刻意练习标准，建议审视练习方式'
  else assessment = '需改进：当前练习方式与刻意练习标准差距较大，建议重新设计练习计划'

  return {
    goalClarityScore,
    comfortZoneBreakScore,
    feedbackQualityScore: feedbackScore,
    focusIntensityScore: focusScore,
    overallScore: adjustedOverall,
    assessment,
  }
}

// ========== 三区自适应难度调节引擎 ==========

/**
 * 基于用户历史表现和当前难度，计算用户所处的训练区域
 */
export function assessZone(memberId, area, recentPerformance) {
  const history = db.prepare(`
    SELECT * FROM dp_zone_assessments
    WHERE member_id = ? AND area = ?
    ORDER BY created_at DESC LIMIT 10
  `).all(memberId, area)

  const successRate = recentPerformance?.successRate ?? 0.7
  const avgDuration = recentPerformance?.avgDuration ?? 0
  const difficulty = recentPerformance?.difficulty ?? 1.0

  let comfortZoneScore = 0
  let learningZoneScore = 0
  let panicZoneScore = 0
  let currentZone = 'comfort'

  if (successRate >= 0.85) {
    comfortZoneScore = 70
    learningZoneScore = 25
    panicZoneScore = 5
    currentZone = 'comfort'
  } else if (successRate >= 0.5) {
    comfortZoneScore = 15
    learningZoneScore = 70
    panicZoneScore = 15
    currentZone = 'learning'
  } else {
    comfortZoneScore = 5
    learningZoneScore = 15
    panicZoneScore = 80
    currentZone = 'panic'
  }

  // Adjust difficulty
  let newDifficulty = difficulty
  if (currentZone === 'comfort') newDifficulty = Math.min(3.0, difficulty + 0.2)
  else if (currentZone === 'learning') newDifficulty = difficulty + (Math.random() * 0.1 - 0.05)
  else newDifficulty = Math.max(0.3, difficulty - 0.3)

  return {
    comfortZoneScore,
    learningZoneScore,
    panicZoneScore,
    currentZone,
    difficultyLevel: Math.round(newDifficulty * 10) / 10,
    suggestion: currentZone === 'comfort'
      ? '当前处于舒适区，建议提升难度以获得成长'
      : currentZone === 'learning'
        ? '当前处于学习区，这是最佳训练区间，保持当前难度'
        : '当前处于恐慌区，建议降低难度或增加辅助支持',
  }
}

// ========== 四层即时反馈生成引擎 ==========

/**
 * 生成四层反馈：结果反馈、过程反馈、策略反馈、元反馈
 */
export function generateFeedback(session, qualityScores) {
  const resultFeedback = generateResultFeedback(session, qualityScores)
  const processFeedback = generateProcessFeedback(session, qualityScores)
  const strategyFeedback = generateStrategyFeedback(session, qualityScores)
  const metaFeedback = generateMetaFeedback(session, qualityScores)

  const suggestions = generateImprovementSuggestions(qualityScores)

  return {
    resultFeedback,
    processFeedback,
    strategyFeedback,
    metaFeedback,
    improvementSuggestions: suggestions,
  }
}

function generateResultFeedback(session, scores) {
  const parts = []
  parts.push(`本次练习目标：${session.goal}`)
  parts.push(`练习时长：${session.durationMinutes} 分钟，有效专注时长：${session.effectiveDurationMinutes} 分钟`)
  parts.push(`综合质量评分：${scores.overallScore}/100`)
  if (scores.overallScore >= 85) {
    parts.push('表现优异！本次练习高度符合刻意练习的黄金标准。')
  } else if (scores.overallScore >= 70) {
    parts.push('表现良好，还有提升空间，关注薄弱维度可以进一步提升效率。')
  } else {
    parts.push('本次练习效率有待提升，建议根据下方建议调整练习方式。')
  }
  return parts.join('\n')
}

function generateProcessFeedback(session, scores) {
  const parts = []
  if (scores.goalClarityScore < 60) {
    parts.push('目标不够清晰：建议在开始练习前，将目标拆解为更具体、可衡量的子任务。')
  }
  if (scores.comfortZoneBreakScore < 60) {
    parts.push('挑战不足：你可能在舒适区内练习，建议尝试略超出当前能力的任务。')
  }
  if (scores.focusIntensityScore < 60) {
    parts.push('专注度偏低：建议使用深度练习模式，减少分心干扰。')
  }
  if (parts.length === 0) {
    parts.push('练习过程整体良好，各环节执行到位。')
  }
  return parts.join('\n')
}

function generateStrategyFeedback(session, scores) {
  const parts = []
  if (session.difficultyLevel === 'comfort') {
    parts.push('策略建议：你当前处于舒适区，建议采用"渐进式突破"策略，每次比当前能力高一小步。')
  } else if (session.difficultyLevel === 'panic') {
    parts.push('策略建议：当前难度过高，建议先拆解任务，逐个击破，或寻求 AI 导师的帮助。')
  } else {
    parts.push('策略建议：当前处于最佳学习区，建议保持当前节奏，每次聚焦一个改进点。')
  }
  if (session.effectiveDurationMinutes < session.durationMinutes * 0.5) {
    parts.push('有效练习时间占比偏低，建议缩短单次练习时长，提高单位时间内的专注度。')
  }
  return parts.join('\n')
}

function generateMetaFeedback(session, scores) {
  const parts = []
  const history = db.prepare(`
    SELECT AVG(overall_score) as avgScore, COUNT(*) as count
    FROM dp_practice_quality_scores qs
    JOIN dp_practice_sessions ps ON qs.session_id = ps.id
    WHERE ps.member_id = ? AND ps.created_at >= date('now', '-7 days')
  `).get(session.member_id)

  if (history && history.count >= 3) {
    const trend = scores.overallScore - history.avgScore
    if (trend > 10) {
      parts.push('元反馈：近一周练习质量呈上升趋势，当前练习方法正在发挥作用。')
    } else if (trend < -10) {
      parts.push('元反馈：近一周练习质量有所下降，建议回顾练习方法是否需要调整。')
    } else {
      parts.push('元反馈：近一周练习质量保持稳定，建议在保持的基础上寻求突破。')
    }
  } else {
    parts.push('元反馈：积累更多练习数据后，系统将为你提供长期趋势分析。')
  }
  return parts.join('\n')
}

function generateImprovementSuggestions(scores) {
  const suggestions = []
  if (scores.goalClarityScore < 60) {
    suggestions.push({ dimension: '目标明确度', action: '下次练习前，用一句话写下具体目标，并列出3个可验证的成功标准' })
  }
  if (scores.comfortZoneBreakScore < 60) {
    suggestions.push({ dimension: '挑战难度', action: '选取一个让你感到"略感吃力"的任务，这恰好说明你进入了学习区' })
  }
  if (scores.feedbackQualityScore < 60) {
    suggestions.push({ dimension: '即时反馈', action: '练习后立即记录表现数据，对比标准答案或请 AI 导师给出反馈' })
  }
  if (scores.focusIntensityScore < 60) {
    suggestions.push({ dimension: '专注强度', action: '下次使用深度练习模式，关闭手机通知，设定45分钟无干扰时段' })
  }
  return suggestions
}

// ========== 训练计划生成器 ==========

const trainingPlanTemplates = {
  '战略思维': {
    milestones: [
      { name: '基础认知构建', description: '掌握战略思维的核心概念和框架', days: 7 },
      { name: '案例分析训练', description: '通过10个经典案例训练战略分析能力', days: 14 },
      { name: '实战应用', description: '在实际工作/学习中应用战略思维解决问题', days: 21 },
    ],
    dailyTasks: [
      '阅读一篇战略分析文章并做笔记',
      '用SWOT框架分析一个实际问题',
      '记录当天做决策的思考过程',
    ],
  },
  '学习能力': {
    milestones: [
      { name: '学习方法论', description: '掌握费曼学习法、间隔重复等高效学习方法', days: 7 },
      { name: '知识体系构建', description: '在目标领域建立结构化的知识框架', days: 14 },
      { name: '输出驱动', description: '通过写作、教学等方式强化学习效果', days: 21 },
    ],
    dailyTasks: [
      '用费曼技巧解释一个复杂概念',
      '完成30分钟间隔重复记忆训练',
      '记录今日学到的新知识并建立关联',
    ],
  },
  '沟通表达': {
    milestones: [
      { name: '结构化表达', description: '掌握金字塔原理和结构化表达框架', days: 7 },
      { name: '场景化训练', description: '在不同场景下练习表达技巧', days: 14 },
      { name: '影响力提升', description: '学习说服技巧和故事化表达', days: 21 },
    ],
    dailyTasks: [
      '用金字塔原理写一段300字的观点表达',
      '录音并回听一段自己的即兴表达',
      '阅读一篇优秀演讲稿，分析其结构',
    ],
  },
  '责任担当': {
    milestones: [
      { name: '自我认知', description: '明确个人责任边界和价值观', days: 7 },
      { name: '项目主导', description: '主导一个小型项目，锻炼决策和承担能力', days: 14 },
      { name: '影响力扩展', description: '带领团队完成任务，承担责任', days: 21 },
    ],
    dailyTasks: [
      '记录今日承担的责任和做出的决策',
      '主动承担一项额外任务',
      '反思一个决策的结果和可改进之处',
    ],
  },
  '适应力': {
    milestones: [
      { name: '弹性心态', description: '建立面对变化和不确定性的心理弹性', days: 7 },
      { name: '多场景适应', description: '在不同环境和任务中练习快速适应', days: 14 },
      { name: '创新突破', description: '在全新领域实现从0到1的突破', days: 21 },
    ],
    dailyTasks: [
      '尝试一件从未做过的事情',
      '在变化发生时记录自己的反应和应对策略',
      '学习一个与当前领域完全不同的新技能',
    ],
  },
}

const defaultTemplate = {
  milestones: [
    { name: '基础阶段', description: '建立该领域的基础知识和核心技能', days: 7 },
    { name: '进阶阶段', description: '深化理解，提升应用能力', days: 14 },
    { name: '精通阶段', description: '达到独立解决复杂问题的水平', days: 21 },
  ],
  dailyTasks: [
    '完成30分钟专注练习',
    '记录练习中的关键发现和问题',
    '回顾并优化明天的练习计划',
  ],
}

export function generateTrainingPlan(memberId, area, goal) {
  const template = trainingPlanTemplates[area] || defaultTemplate

  const result = db.prepare(`
    INSERT INTO dp_training_plans (member_id, title, area, description, sub_goals)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    memberId,
    goal || `${area}刻意练习计划`,
    area,
    `基于刻意练习方法论，为${area}领域设计的系统训练计划`,
    JSON.stringify(template.milestones)
  )

  return {
    id: result.lastInsertRowid,
    area,
    milestones: template.milestones,
    dailyTasks: template.dailyTasks,
    suggestion: '每天选择1-2个核心任务进行高质量练习，保持在学习区内，每次练习后记录反思。',
  }
}

// ========== 专注力分析 ==========

export function analyzeFocusPattern(memberId) {
  const sessions = db.prepare(`
    SELECT * FROM dp_focus_sessions
    WHERE member_id = ? AND created_at >= date('now', '-14 days')
    ORDER BY created_at DESC
  `).all(memberId)

  if (sessions.length === 0) return null

  const avgFocus = sessions.reduce((s, r) => s + r.focus_score, 0) / sessions.length
  const avgDistractions = sessions.reduce((s, r) => s + r.distraction_count, 0) / sessions.length

  // Find best time of day
  const timeSlots = {}
  sessions.forEach(s => {
    const hour = s.time_of_day ? parseInt(s.time_of_day.split(':')[0]) : 0
    const slot = hour < 9 ? 'morning' : hour < 12 ? 'late_morning' : hour < 14 ? 'afternoon' : hour < 18 ? 'late_afternoon' : 'evening'
    if (!timeSlots[slot]) timeSlots[slot] = { total: 0, count: 0 }
    timeSlots[slot].total += s.focus_score
    timeSlots[slot].count++
  })

  let bestSlot = 'morning'
  let bestAvg = 0
  Object.entries(timeSlots).forEach(([slot, data]) => {
    const avg = data.total / data.count
    if (avg > bestAvg) { bestAvg = avg; bestSlot = slot }
  })

  const slotLabels = {
    morning: '早晨（6-9点）',
    late_morning: '上午（9-12点）',
    afternoon: '下午（12-14点）',
    late_afternoon: '傍晚（14-18点）',
    evening: '晚上（18点后）',
  }

  return {
    avgFocusScore: Math.round(avgFocus),
    avgDistractions: Math.round(avgDistractions * 10) / 10,
    bestTimeSlot: slotLabels[bestSlot] || '上午',
    totalSessions: sessions.length,
    trend: sessions.length >= 3
      ? (sessions.slice(0, 3).reduce((s, r) => s + r.focus_score, 0) / 3) > avgFocus ? '上升' : '稳定'
      : '数据不足',
  }
}