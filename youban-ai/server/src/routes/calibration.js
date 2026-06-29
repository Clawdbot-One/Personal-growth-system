import db from '../db/init.js'

// 过度自信校准题库 - 常识判断题，要求标注置信度
const CALIBRATION_QUESTIONS = [
  { id: 1, category: 'geography', text: '撒哈拉沙漠是世界上最大的沙漠吗？', answer: 'no', hint: '南极洲实际上是一个沙漠，且面积更大' },
  { id: 2, category: 'science', text: '人体中最硬的物质是牙釉质吗？', answer: 'yes', hint: '牙釉质是人体中最坚硬的物质' },
  { id: 3, category: 'history', text: '成吉思汗建立的帝国是人类历史上面积最大的连续陆地帝国吗？', answer: 'yes', hint: '蒙古帝国面积约2400万平方公里' },
  { id: 4, category: 'science', text: '月球绕地球一周的时间恰好是30天吗？', answer: 'no', hint: '月球公转周期约为27.3天' },
  { id: 5, category: 'geography', text: '尼罗河是世界上最长的河流吗？', answer: 'yes', hint: '尼罗河全长约6650公里，比亚马逊河略长' },
  { id: 6, category: 'history', text: '中国古代四大发明中，造纸术是最早发明的吗？', answer: 'no', hint: '指南针的雏形（司南）在战国时期就已出现' },
  { id: 7, category: 'science', text: '一个标准大气压下，水在100°C时一定会沸腾吗？', answer: 'no', hint: '纯水在标准大气压下沸点是100°C，但含杂质的水沸点会变化' },
  { id: 8, category: 'arts', text: '《蒙娜丽莎》是达芬奇在1500年之前完成的吗？', answer: 'yes', hint: '《蒙娜丽莎》大约创作于1503-1506年，也有说法是1503-1517' },
  { id: 9, category: 'technology', text: '第一台电子计算机ENIAC的重量超过20吨吗？', answer: 'yes', hint: 'ENIAC重约30吨，占地约167平方米' },
  { id: 10, category: 'sports', text: '奥运会马拉松的标准距离是42公里吗？', answer: 'no', hint: '标准马拉松距离是42.195公里' },
  { id: 11, category: 'geography', text: '澳大利亚的首都是悉尼吗？', answer: 'no', hint: '澳大利亚的首都是堪培拉' },
  { id: 12, category: 'science', text: '变色龙变色主要是为了伪装自己吗？', answer: 'no', hint: '变色龙变色主要用于调节体温和社交沟通' },
  { id: 13, category: 'history', text: '拿破仑是在滑铁卢战役中战死的吗？', answer: 'no', hint: '拿破仑在滑铁卢战败后被流放，最终在圣赫勒拿岛病逝' },
  { id: 14, category: 'technology', text: '5G网络的理论峰值速率可以达到10Gbps以上吗？', answer: 'yes', hint: '5G理论峰值速率可达20Gbps' },
  { id: 15, category: 'arts', text: '《红楼梦》的作者曹雪芹完成了全书120回吗？', answer: 'no', hint: '《红楼梦》前80回为曹雪芹所著，后40回一般认为由高鹗续写' },
]

export function startCalibrationTest(req, res) {
  const memberId = req.member.id
  const result = db.prepare(
    'INSERT INTO calibration_sessions (member_id) VALUES (?)'
  ).run(memberId)

  // 返回不带答案的题目
  const questions = CALIBRATION_QUESTIONS.map(q => ({
    id: q.id,
    category: q.category,
    text: q.text,
  }))

  res.json({
    code: 0,
    data: {
      sessionId: result.lastInsertRowid,
      questions,
      totalQuestions: questions.length,
    },
    message: '校准测试已开始',
  })
}

export function submitCalibrationAnswer(req, res) {
  const memberId = req.member.id
  const { sessionId, answers } = req.body

  if (!sessionId || !answers) {
    return res.status(400).json({ code: 400, message: '缺少必要参数' })
  }

  let correctCount = 0
  let totalConfidence = 0
  let brierSum = 0

  for (const q of CALIBRATION_QUESTIONS) {
    const userAnswer = answers[q.id]
    if (!userAnswer) continue

    const userChoice = typeof userAnswer === 'object' ? userAnswer.answer : userAnswer
    const confidence = typeof userAnswer === 'object' ? (userAnswer.confidence || 50) : 50
    const isCorrect = (userChoice === 'yes' && q.answer === 'yes') || (userChoice === 'no' && q.answer === 'no') ? 1 : 0

    if (isCorrect) correctCount++
    totalConfidence += confidence

    // Brier Score: (confidence/100 - outcome)^2
    const predictedProb = confidence / 100
    brierSum += (predictedProb - isCorrect) ** 2

    db.prepare(`
      INSERT INTO calibration_records (session_id, member_id, question_id, category, user_answer, correct_answer, is_correct, confidence)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      sessionId, memberId, q.id, q.category, userChoice, q.answer, isCorrect, confidence
    )
  }

  const totalQuestions = CALIBRATION_QUESTIONS.length
  const accuracy = Math.round((correctCount / totalQuestions) * 100)
  const avgConfidence = Math.round(totalConfidence / totalQuestions)
  const brierScore = Math.round(brierSum / totalQuestions * 1000) / 1000

  // 判断校准水平
  let calibrationLevel = 'uncalibrated'
  const gap = avgConfidence - accuracy
  if (Math.abs(gap) <= 10) calibrationLevel = 'well_calibrated'
  else if (gap > 10) calibrationLevel = 'overconfident'
  else calibrationLevel = 'underconfident'

  db.prepare(`
    UPDATE calibration_sessions
    SET status = 'completed', total_questions = ?, correct_count = ?,
        brier_score = ?, calibration_level = ?,
        completed_at = datetime('now', 'localtime')
    WHERE id = ?
  `).run(totalQuestions, correctCount, brierScore, calibrationLevel, sessionId)

  res.json({
    code: 0,
    data: {
      sessionId,
      totalQuestions,
      correctCount,
      accuracy,
      avgConfidence,
      brierScore,
      calibrationLevel,
      overconfidenceGap: Math.max(0, avgConfidence - accuracy),
    },
    message: '校准结果已保存',
  })
}

export function getCalibrationResult(req, res) {
  const memberId = req.member.id
  const { sessionId } = req.params

  const session = db.prepare(
    'SELECT * FROM calibration_sessions WHERE id = ? AND member_id = ?'
  ).get(sessionId, memberId)

  if (!session) {
    return res.status(404).json({ code: 404, message: '未找到校准记录' })
  }

  const records = db.prepare(
    'SELECT * FROM calibration_records WHERE session_id = ? ORDER BY question_id'
  ).all(sessionId)

  const detailResults = records.map(r => {
    const question = CALIBRATION_QUESTIONS.find(q => q.id === r.question_id)
    return {
      id: r.id,
      questionId: r.question_id,
      questionText: question?.text || '',
      category: r.category,
      userAnswer: r.user_answer,
      correctAnswer: r.correct_answer,
      isCorrect: !!r.is_correct,
      confidence: r.confidence,
      hint: question?.hint || '',
    }
  })

  // 按置信度区间分组
  const confidenceGroups = [
    { range: '50-60%', min: 50, max: 60, total: 0, correct: 0 },
    { range: '60-70%', min: 60, max: 70, total: 0, correct: 0 },
    { range: '70-80%', min: 70, max: 80, total: 0, correct: 0 },
    { range: '80-90%', min: 80, max: 90, total: 0, correct: 0 },
    { range: '90-100%', min: 90, max: 100, total: 0, correct: 0 },
  ]
  for (const r of detailResults) {
    for (const g of confidenceGroups) {
      if (r.confidence >= g.min && r.confidence <= g.max) {
        g.total++
        if (r.isCorrect) g.correct++
        break
      }
    }
  }

  res.json({
    code: 0,
    data: {
      sessionId,
      totalQuestions: session.total_questions,
      correctCount: session.correct_count,
      accuracy: session.total_questions > 0 ? Math.round((session.correct_count / session.total_questions) * 100) : 0,
      brierScore: session.brier_score,
      calibrationLevel: session.calibration_level,
      confidenceGroups: confidenceGroups.filter(g => g.total > 0),
      results: detailResults,
      createdAt: session.created_at,
    },
  })
}

export function getCalibrationHistory(req, res) {
  const memberId = req.member.id
  const sessions = db.prepare(
    'SELECT * FROM calibration_sessions WHERE member_id = ? AND status = ? ORDER BY created_at DESC'
  ).all(memberId, 'completed')

  res.json({ code: 0, data: sessions })
}