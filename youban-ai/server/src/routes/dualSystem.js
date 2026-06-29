import db from '../db/init.js'

// 双系统思维训练题库 - 基于 CRT (Cognitive Reflection Test) 扩展
const CRT_QUESTIONS = [
  // 直觉冲突题 - 球拍与球
  { id: 1, type: 'intuition_conflict', difficulty: 'easy',
    text: '一个球拍和一个球一共 1.10 元，球拍比球贵 1.00 元。请问球多少钱？',
    options: [
      { value: 'A', text: '0.10 元', isCorrect: false, system1: true },
      { value: 'B', text: '0.05 元', isCorrect: true, system2: true },
      { value: 'C', text: '0.15 元', isCorrect: false },
      { value: 'D', text: '0.01 元', isCorrect: false },
    ],
    explanation: '系统1会快速给出0.10元的答案，但正确的数学计算是：设球为x，球拍为x+1，x+(x+1)=1.10，解得x=0.05。' },
  // 直觉冲突题 - 机器生产
  { id: 2, type: 'intuition_conflict', difficulty: 'easy',
    text: '如果 5 台机器生产 5 个零件需要 5 分钟，那么 100 台机器生产 100 个零件需要多少分钟？',
    options: [
      { value: 'A', text: '100 分钟', isCorrect: false, system1: true },
      { value: 'B', text: '5 分钟', isCorrect: true, system2: true },
      { value: 'C', text: '1 分钟', isCorrect: false },
      { value: 'D', text: '20 分钟', isCorrect: false },
    ],
    explanation: '系统1会直觉地认为100分钟，但每台机器的生产效率不变，100台机器同时工作，生产100个零件只需5分钟。' },
  // 直觉冲突题 - 睡莲
  { id: 3, type: 'intuition_conflict', difficulty: 'easy',
    text: '湖里有一片睡莲，每天面积翻倍。如果这片睡莲覆盖整个湖面需要 48 天，那么覆盖一半湖面需要多少天？',
    options: [
      { value: 'A', text: '24 天', isCorrect: false, system1: true },
      { value: 'B', text: '47 天', isCorrect: true, system2: true },
      { value: 'C', text: '12 天', isCorrect: false },
      { value: 'D', text: '36 天', isCorrect: false },
    ],
    explanation: '系统1会直觉地认为24天（一半），但由于每天翻倍，第48天是全满，第47天就是一半。' },
  // 框架切换题 - Linda 问题
  { id: 4, type: 'framing_switch', difficulty: 'medium',
    text: 'Linda 31 岁，单身，直率且非常聪明。大学主修哲学。作为学生，她非常关注歧视和社会正义问题，也参加过反核游行。以下哪个更可能？',
    options: [
      { value: 'A', text: 'Linda 是一名银行柜员', isCorrect: true, system2: true },
      { value: 'B', text: 'Linda 是一名银行柜员并且积极参与女权运动', isCorrect: false, system1: true },
      { value: 'C', text: 'Linda 是一名女权运动领袖', isCorrect: false },
      { value: 'D', text: 'Linda 是一名哲学教授', isCorrect: false },
    ],
    explanation: '这是著名的合取谬误测试。虽然B的描述更符合Linda的形象（系统1的判断），但逻辑上A的概率一定大于等于B（两个事件同时发生的概率不可能大于单个事件）。' },
  // 统计直觉题
  { id: 5, type: 'statistical_intuition', difficulty: 'medium',
    text: '一个城镇有两家医院。大医院每天约有 45 个婴儿出生，小医院每天约有 15 个婴儿出生。一年中，哪家医院更可能出现"某天超过 60% 的新生儿是男孩"的情况？',
    options: [
      { value: 'A', text: '大医院', isCorrect: false, system1: true },
      { value: 'B', text: '小医院', isCorrect: true, system2: true },
      { value: 'C', text: '两家医院差不多', isCorrect: false },
      { value: 'D', text: '无法判断', isCorrect: false },
    ],
    explanation: '小样本更容易出现极端值。小医院每天只有15个婴儿，统计波动更大，更容易出现偏离50%的情况。这是大数定律的体现。' },
  // 框架切换题
  { id: 6, type: 'framing_switch', difficulty: 'medium',
    text: '一种罕见疾病爆发，预计会导致 600 人死亡。现有两个方案：方案A将确定拯救 200 人；方案B有 1/3 概率拯救全部 600 人，2/3 概率无人获救。你选择？',
    options: [
      { value: 'A', text: '方案A（确定拯救200人）', isCorrect: false, system1: true },
      { value: 'B', text: '方案B（1/3概率拯救全部）', isCorrect: false, system1: true },
      { value: 'C', text: '两个方案期望值相同，我的选择取决于风险偏好', isCorrect: true, system2: true },
      { value: 'D', text: '方案A更好，因为确定性更高', isCorrect: false },
    ],
    explanation: '两个方案的期望值完全相同（都是200人获救）。大多数人会选A（确定性效应），但如果把问题改为"死亡框架"（确定死亡400人 vs 1/3无人死亡），大多数人会选B。这就是框架效应。' },
  // 直觉冲突题
  { id: 7, type: 'intuition_conflict', difficulty: 'medium',
    text: '一个商人以 60 元买进一头牛，以 70 元卖出。然后以 80 元买回，再以 90 元卖出。他赚了多少钱？',
    options: [
      { value: 'A', text: '10 元', isCorrect: false, system1: true },
      { value: 'B', text: '20 元', isCorrect: true, system2: true },
      { value: 'C', text: '0 元', isCorrect: false },
      { value: 'D', text: '30 元', isCorrect: false },
    ],
    explanation: '系统1可能被复杂的交易迷惑。简单计算：总支出60+80=140，总收入70+90=160，利润=20元。' },
  // 概率推理题
  { id: 8, type: 'statistical_intuition', difficulty: 'hard',
    text: '在一个有 30 人的班级中，至少有两个人生日相同的概率大约是多少？',
    options: [
      { value: 'A', text: '约 10%', isCorrect: false, system1: true },
      { value: 'B', text: '约 30%', isCorrect: false },
      { value: 'C', text: '约 70%', isCorrect: true, system2: true },
      { value: 'D', text: '约 50%', isCorrect: false },
    ],
    explanation: '这是著名的生日悖论。30人的班级中，至少两人生日相同的概率约为70.6%，远高于大多数人的直觉估计。' },
  // 框架切换题
  { id: 9, type: 'framing_switch', difficulty: 'hard',
    text: '你在一个游戏中赢得了 1000 元。现在有两种选择：A) 确定再获得 500 元；B) 抛硬币，正面获得 1000 元，反面获得 0 元。你选择？',
    options: [
      { value: 'A', text: '选择A（确定获得500元）', isCorrect: false, system1: true },
      { value: 'B', text: '选择B（抛硬币）', isCorrect: false },
      { value: 'C', text: '我意识到这是前景理论中的"收益域确定性效应"', isCorrect: true, system2: true },
      { value: 'D', text: '两个选择期望值一样，随便选', isCorrect: false },
    ],
    explanation: '在收益域，大多数人选择A（确定性500元），尽管B的期望值也是500元。这就是前景理论中的"确定性效应"。如果换成损失框架，选择会反转。' },
  // 直觉冲突题
  { id: 10, type: 'intuition_conflict', difficulty: 'hard',
    text: '如果 3 个人 3 天喝 3 桶水，那么 9 个人 9 天喝多少桶水？',
    options: [
      { value: 'A', text: '9 桶', isCorrect: false, system1: true },
      { value: 'B', text: '27 桶', isCorrect: true, system2: true },
      { value: 'C', text: '18 桶', isCorrect: false },
      { value: 'D', text: '3 桶', isCorrect: false },
    ],
    explanation: '系统1可能直接对应数字。正确计算：3人3天3桶 = 1人3天1桶 = 1人1天1/3桶。9人9天 = 9×9×(1/3) = 27桶。' },
]

export function startDualSystemTest(req, res) {
  const memberId = req.member.id
  const result = db.prepare(
    'INSERT INTO dual_system_sessions (member_id) VALUES (?)'
  ).run(memberId)

  res.json({
    code: 0,
    data: {
      sessionId: result.lastInsertRowid,
      questions: CRT_QUESTIONS,
      totalQuestions: CRT_QUESTIONS.length,
    },
    message: '双系统思维测试已开始',
  })
}

export function submitDualSystemAnswer(req, res) {
  const memberId = req.member.id
  const { sessionId, answers } = req.body

  if (!sessionId || !answers) {
    return res.status(400).json({ code: 400, message: '缺少必要参数' })
  }

  let correctCount = 0
  let system1Count = 0
  let system2Count = 0
  let totalReactionTime = 0

  for (const q of CRT_QUESTIONS) {
    const userAnswer = answers[q.id]
    if (!userAnswer) continue

    const selectedOption = q.options.find(o => o.value === userAnswer.answer || o.value === userAnswer)
    const answerValue = typeof userAnswer === 'string' ? userAnswer : userAnswer.answer
    const reactionTime = typeof userAnswer === 'object' ? (userAnswer.reactionTime || 0) : 0

    const isCorrect = selectedOption ? selectedOption.isCorrect : false
    const thinkingMode = isCorrect ? 'system2' : 'system1'

    if (isCorrect) correctCount++
    if (thinkingMode === 'system1') system1Count++
    else system2Count++
    totalReactionTime += reactionTime

    db.prepare(`
      INSERT INTO dual_system_results (session_id, member_id, question_id, user_answer, correct_answer, is_correct, reaction_time_ms, thinking_mode, question_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      sessionId, memberId, q.id, answerValue,
      q.options.find(o => o.isCorrect)?.value || '',
      isCorrect ? 1 : 0,
      reactionTime,
      thinkingMode,
      q.type
    )
  }

  const avgReactionTime = CRT_QUESTIONS.length > 0 ? Math.round(totalReactionTime / CRT_QUESTIONS.length) : 0

  db.prepare(`
    UPDATE dual_system_sessions
    SET status = 'completed', total_questions = ?, correct_count = ?,
        system1_count = ?, system2_count = ?, avg_reaction_time_ms = ?,
        completed_at = datetime('now', 'localtime')
    WHERE id = ?
  `).run(CRT_QUESTIONS.length, correctCount, system1Count, system2Count, avgReactionTime, sessionId)

  res.json({
    code: 0,
    data: {
      sessionId,
      totalQuestions: CRT_QUESTIONS.length,
      correctCount,
      system1Count,
      system2Count,
      accuracy: Math.round((correctCount / CRT_QUESTIONS.length) * 100),
      dominantSystem: system2Count >= CRT_QUESTIONS.length / 2 ? 'system2' : 'system1',
      avgReactionTime,
    },
    message: '测试结果已保存',
  })
}

export function getDualSystemResult(req, res) {
  const memberId = req.member.id
  const { sessionId } = req.params

  const session = db.prepare(
    'SELECT * FROM dual_system_sessions WHERE id = ? AND member_id = ?'
  ).get(sessionId, memberId)

  if (!session) {
    return res.status(404).json({ code: 404, message: '未找到测试记录' })
  }

  const results = db.prepare(
    'SELECT * FROM dual_system_results WHERE session_id = ? ORDER BY question_id'
  ).all(sessionId)

  const detailResults = results.map(r => {
    const question = CRT_QUESTIONS.find(q => q.id === r.question_id)
    return {
      id: r.id,
      questionId: r.question_id,
      questionText: question?.text || '',
      questionType: r.question_type,
      userAnswer: r.user_answer,
      correctAnswer: r.correct_answer,
      isCorrect: !!r.is_correct,
      thinkingMode: r.thinking_mode,
      reactionTime: r.reaction_time_ms,
      explanation: question?.explanation || '',
    }
  })

  res.json({
    code: 0,
    data: {
      sessionId,
      totalQuestions: session.total_questions,
      correctCount: session.correct_count,
      system1Count: session.system1_count,
      system2Count: session.system2_count,
      accuracy: session.total_questions > 0 ? Math.round((session.correct_count / session.total_questions) * 100) : 0,
      dominantSystem: session.system2_count >= session.total_questions / 2 ? 'system2' : 'system1',
      avgReactionTime: session.avg_reaction_time_ms,
      results: detailResults,
      createdAt: session.created_at,
    },
  })
}

export function getDualSystemHistory(req, res) {
  const memberId = req.member.id
  const sessions = db.prepare(
    'SELECT * FROM dual_system_sessions WHERE member_id = ? AND status = ? ORDER BY created_at DESC'
  ).all(memberId, 'completed')

  res.json({ code: 0, data: sessions })
}