import db from '../db/init.js'

// 认知偏差题库 - 基于《思考，快与慢》理论设计
const BIAS_QUESTIONS = [
  // 锚定效应 (Anchoring Effect)
  { id: 1, biasType: 'anchoring', text: '在估算一个未知数值时，你通常如何开始？', options: [
    { value: 'A', text: '先找一个参考值，再根据参考值调整', score: 4 },
    { value: 'B', text: '直接凭直觉给出一个数字', score: 3 },
    { value: 'C', text: '收集足够信息后再估算', score: 1 },
    { value: 'D', text: '多角度分析后给出范围估计', score: 0 },
  ]},
  { id: 2, biasType: 'anchoring', text: '当别人先给出一个价格后，你的还价通常会？', options: [
    { value: 'A', text: '受对方报价影响较大，在此基础上调整', score: 4 },
    { value: 'B', text: '基本不受影响，有自己的判断标准', score: 0 },
    { value: 'C', text: '有时会受影响，取决于对方报价的合理性', score: 2 },
    { value: 'D', text: '完全忽略对方报价，从零开始评估', score: 1 },
  ]},
  { id: 3, biasType: 'anchoring', text: '设定个人目标时，你倾向于？', options: [
    { value: 'A', text: '参考他人已经达成的目标作为基准', score: 4 },
    { value: 'B', text: '根据自己过往的实际表现来设定', score: 1 },
    { value: 'C', text: '设定一个理想化的高目标', score: 3 },
    { value: 'D', text: '先收集数据，再制定合理范围', score: 0 },
  ]},
  // 可得性偏差 (Availability Bias)
  { id: 4, biasType: 'availability', text: '评估某件事的风险时，你更依赖什么？', options: [
    { value: 'A', text: '最近看到的新闻或听说的案例', score: 4 },
    { value: 'B', text: '统计数据和研究报告', score: 0 },
    { value: 'C', text: '个人亲身经历', score: 3 },
    { value: 'D', text: '综合多方面信息理性判断', score: 1 },
  ]},
  { id: 5, biasType: 'availability', text: '当被问及"飞机和汽车哪个更安全"时，你的第一反应是？', options: [
    { value: 'A', text: '飞机更危险，因为空难新闻给人印象深刻', score: 4 },
    { value: 'B', text: '汽车更危险，统计学上汽车事故死亡率更高', score: 0 },
    { value: 'C', text: '不太确定，需要查一下数据', score: 2 },
    { value: 'D', text: '取决于具体情况', score: 2 },
  ]},
  { id: 6, biasType: 'availability', text: '回顾自己的优势时，你更容易想到？', options: [
    { value: 'A', text: '最近被表扬或成功的事情', score: 4 },
    { value: 'B', text: '长期稳定表现出的能力', score: 0 },
    { value: 'C', text: '他人反馈中反复提到的特质', score: 1 },
    { value: 'D', text: '测评报告中的客观数据', score: 1 },
  ]},
  // 确认偏误 (Confirmation Bias)
  { id: 7, biasType: 'confirmation', text: '当遇到与你观点相反的信息时，你的反应是？', options: [
    { value: 'A', text: '下意识地寻找反驳的理由', score: 4 },
    { value: 'B', text: '认真审视对方观点是否有道理', score: 0 },
    { value: 'C', text: '忽略它，继续坚持自己的看法', score: 3 },
    { value: 'D', text: '感到不舒服，但会尝试理解', score: 2 },
  ]},
  { id: 8, biasType: 'confirmation', text: '在做重要决策前，你通常如何搜集信息？', options: [
    { value: 'A', text: '倾向于寻找支持自己预期的信息', score: 4 },
    { value: 'B', text: '主动寻找反对意见来检验自己的想法', score: 0 },
    { value: 'C', text: '随便看看，凭感觉做决定', score: 3 },
    { value: 'D', text: '列出正反两方面的证据再做判断', score: 1 },
  ]},
  { id: 9, biasType: 'confirmation', text: '当你对自己的能力有负面评价时，你会？', options: [
    { value: 'A', text: '只关注那些证明自己不够好的证据', score: 4 },
    { value: 'B', text: '客观评估自己的优势和不足', score: 0 },
    { value: 'C', text: '避免思考这个问题', score: 2 },
    { value: 'D', text: '寻求他人反馈来验证自己的判断', score: 1 },
  ]},
  // 过度自信 (Overconfidence)
  { id: 10, biasType: 'overconfidence', text: '对于自己不太了解的领域，你的自信程度是？', options: [
    { value: 'A', text: '觉得自己能很快掌握，比较有信心', score: 4 },
    { value: 'B', text: '承认自己不了解，持谨慎态度', score: 0 },
    { value: 'C', text: '有一定信心，但知道需要学习', score: 2 },
    { value: 'D', text: '完全不确定，需要深入了解', score: 1 },
  ]},
  { id: 11, biasType: 'overconfidence', text: '回顾过去的预测，你的准确率通常是？', options: [
    { value: 'A', text: '大部分都预测对了', score: 4 },
    { value: 'B', text: '实际情况经常和预测有差距', score: 0 },
    { value: 'C', text: '没有特别留意过预测的准确性', score: 2 },
    { value: 'D', text: '有时准确有时不准确，差不多一半一半', score: 1 },
  ]},
  { id: 12, biasType: 'overconfidence', text: '你认为自己在同龄人中的能力排名大约是？', options: [
    { value: 'A', text: '前 20%', score: 4 },
    { value: 'B', text: '前 40%', score: 3 },
    { value: 'C', text: '中间水平', score: 1 },
    { value: 'D', text: '不太确定，需要客观评估', score: 0 },
  ]},
  // 损失厌恶 (Loss Aversion)
  { id: 13, biasType: 'lossAversion', text: '面对一个"50%获得100元，50%损失80元"的赌局，你会？', options: [
    { value: 'A', text: '拒绝参与，不想承担损失的风险', score: 4 },
    { value: 'B', text: '参与，期望值为正值得尝试', score: 0 },
    { value: 'C', text: '犹豫不决，需要更多时间考虑', score: 2 },
    { value: 'D', text: '参与，但会感到有些不安', score: 1 },
  ]},
  { id: 14, biasType: 'lossAversion', text: '当你的投资下跌 20% 时，你的反应是？', options: [
    { value: 'A', text: '非常焦虑，想立即卖出止损', score: 4 },
    { value: 'B', text: '冷静分析，判断是否值得继续持有', score: 0 },
    { value: 'C', text: '暂时观望，不做任何操作', score: 2 },
    { value: 'D', text: '考虑加仓，相信长期价值', score: 1 },
  ]},
  { id: 15, biasType: 'lossAversion', text: '放弃一个已经投入很多但前景不佳的项目，你感到？', options: [
    { value: 'A', text: '非常困难，不想让之前的投入白费', score: 4 },
    { value: 'B', text: '虽然遗憾，但理性决策更重要', score: 0 },
    { value: 'C', text: '会纠结很久，但最终可能放弃', score: 2 },
    { value: 'D', text: '会寻找折中方案，不完全放弃', score: 3 },
  ]},
  // 框架效应 (Framing Effect)
  { id: 16, biasType: 'framing', text: '听到"成功率 80%"和"失败率 20%"，你的感受？', options: [
    { value: 'A', text: '两种说法给我完全不同的感受', score: 4 },
    { value: 'B', text: '能意识到是同一件事，感受相似', score: 0 },
    { value: 'C', text: '略有不同，但不会影响我的判断', score: 1 },
    { value: 'D', text: '成功率 80% 听起来更让人放心', score: 3 },
  ]},
  { id: 17, biasType: 'framing', text: '当别人用不同方式描述同一件事时，你的判断？', options: [
    { value: 'A', text: '容易受到描述方式的影响', score: 4 },
    { value: 'B', text: '能透过描述看到本质', score: 0 },
    { value: 'C', text: '有时会受影响，取决于具体情况', score: 2 },
    { value: 'D', text: '会特别注意是否有误导性表述', score: 1 },
  ]},
  { id: 18, biasType: 'framing', text: '面对"保住已有成果"和"追求更多成长"的选择，你倾向于？', options: [
    { value: 'A', text: '保住已有成果，不想冒险失去', score: 4 },
    { value: 'B', text: '追求更多成长，愿意承担风险', score: 1 },
    { value: 'C', text: '在两者之间寻找平衡', score: 2 },
    { value: 'D', text: '根据具体情况分析利弊', score: 0 },
  ]},
  // 光环效应 (Halo Effect)
  { id: 19, biasType: 'halo', text: '当一个人在某方面表现优秀时，你对他的整体评价？', options: [
    { value: 'A', text: '倾向于认为他在其他方面也很优秀', score: 4 },
    { value: 'B', text: '每个方面都需要独立评估', score: 0 },
    { value: 'C', text: '会有一定影响，但会尽量客观', score: 2 },
    { value: 'D', text: '第一印象好会让我对他整体评价更高', score: 3 },
  ]},
  { id: 20, biasType: 'halo', text: '评估一个产品或服务时，外观设计对你的影响？', options: [
    { value: 'A', text: '外观好的产品，我会觉得功能也更好', score: 4 },
    { value: 'B', text: '外观和功能是两回事，不会混淆', score: 0 },
    { value: 'C', text: '有一定影响，但会参考实际体验', score: 2 },
    { value: 'D', text: '外观是第一印象，会影响初始判断', score: 3 },
  ]},
]

// 偏差类型定义
const BIAS_TYPES = {
  anchoring: { name: '锚定效应', description: '在做决策时过度依赖最先获得的信息' },
  availability: { name: '可得性偏差', description: '根据容易回忆的事例来判断事件发生概率' },
  confirmation: { name: '确认偏误', description: '倾向于寻找支持自己已有信念的信息' },
  overconfidence: { name: '过度自信', description: '系统性地高估自己的能力和判断准确性' },
  lossAversion: { name: '损失厌恶', description: '对损失的敏感程度远高于等量收益' },
  framing: { name: '框架效应', description: '同一信息的不同表述方式影响决策选择' },
  halo: { name: '光环效应', description: '因某一突出特征而过度泛化整体判断' },
}

export function startBiasTest(req, res) {
  const memberId = req.member.id
  const result = db.prepare(
    'INSERT INTO cognitive_bias_sessions (member_id) VALUES (?)'
  ).run(memberId)

  res.json({
    code: 0,
    data: {
      sessionId: result.lastInsertRowid,
      questions: BIAS_QUESTIONS,
      totalQuestions: BIAS_QUESTIONS.length,
    },
    message: '认知偏差测试已开始',
  })
}

export function submitBiasAnswer(req, res) {
  const memberId = req.member.id
  const { sessionId, answers } = req.body

  if (!sessionId || !answers) {
    return res.status(400).json({ code: 400, message: '缺少必要参数' })
  }

  // 计算各偏差类型得分
  const biasScores = {}
  for (const q of BIAS_QUESTIONS) {
    const userAnswer = answers[q.id]
    if (!userAnswer) continue
    const option = q.options.find(o => o.value === userAnswer)
    if (!option) continue

    if (!biasScores[q.biasType]) {
      biasScores[q.biasType] = { total: 0, count: 0, maxScore: 0 }
    }
    biasScores[q.biasType].total += option.score
    biasScores[q.biasType].count++
    biasScores[q.biasType].maxScore += 4 // 每题最高 4 分
  }

  // 保存结果
  for (const [biasType, data] of Object.entries(biasScores)) {
    const avgScore = Math.round((data.total / data.count) * 25) // 转换为百分制
    const level = avgScore >= 75 ? 'high' : avgScore >= 50 ? 'medium' : 'low'
    const info = BIAS_TYPES[biasType] || { name: biasType, description: '' }

    db.prepare(`
      INSERT INTO cognitive_bias_results (session_id, member_id, bias_type, bias_name, score, level, interpretation, suggestions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      sessionId, memberId, biasType, info.name, avgScore, level,
      getBiasInterpretation(biasType, level),
      JSON.stringify(getBiasSuggestions(biasType, level))
    )
  }

  // 更新 session 状态
  db.prepare(
    `UPDATE cognitive_bias_sessions SET status = 'completed', completed_at = datetime('now', 'localtime') WHERE id = ?`
  ).run(sessionId)

  res.json({ code: 0, data: { sessionId }, message: '测试结果已保存' })
}

export function getBiasResult(req, res) {
  const memberId = req.member.id
  const { sessionId } = req.params

  const results = db.prepare(
    'SELECT * FROM cognitive_bias_results WHERE session_id = ? AND member_id = ? ORDER BY score DESC'
  ).all(sessionId, memberId)

  if (results.length === 0) {
    return res.status(404).json({ code: 404, message: '未找到测试结果' })
  }

  const list = results.map(r => ({
    id: r.id,
    biasType: r.bias_type,
    biasName: r.bias_name,
    score: r.score,
    level: r.level,
    interpretation: r.interpretation,
    suggestions: JSON.parse(r.suggestions || '[]'),
  }))

  res.json({ code: 0, data: { sessionId, results: list } })
}

export function getBiasHistory(req, res) {
  const memberId = req.member.id
  const sessions = db.prepare(
    `SELECT s.*, COUNT(r.id) as result_count
     FROM cognitive_bias_sessions s
     LEFT JOIN cognitive_bias_results r ON s.id = r.session_id
     WHERE s.member_id = ? AND s.status = 'completed'
     GROUP BY s.id
     ORDER BY s.created_at DESC`
  ).all(memberId)

  res.json({ code: 0, data: sessions })
}

function getBiasInterpretation(biasType, level) {
  const interpretations = {
    anchoring: {
      high: '你在决策中容易受到初始信息的锚定影响，建议在重要决策前多获取不同参考点。',
      medium: '你在一定程度上会受到锚定效应的影响，在某些场景下需要注意。',
      low: '你对锚定效应有较好的免疫力，能够理性看待初始信息。',
    },
    availability: {
      high: '你容易受到近期事件和生动案例的影响，建议多参考统计数据而非直觉印象。',
      medium: '你在某些情况下会受到可得性偏差的影响，注意区分直觉和事实。',
      low: '你能够较好地基于客观数据而非直觉印象做判断。',
    },
    confirmation: {
      high: '你倾向于寻找支持自己观点的证据，建议主动接触不同意见。',
      medium: '你在一定程度上存在确认偏误，可以尝试"反向思考"练习。',
      low: '你能够较为客观地评估不同观点的价值。',
    },
    overconfidence: {
      high: '你对自己的判断可能过于自信，建议养成"置信度标注"的习惯。',
      medium: '你在某些领域可能存在过度自信，建议多参考外部反馈。',
      low: '你对自己的能力有较为准确的认知。',
    },
    lossAversion: {
      high: '你对损失非常敏感，这可能影响你的风险决策，建议理性评估期望值。',
      medium: '你在一定程度上受到损失厌恶的影响，注意不要因害怕损失而错过机会。',
      low: '你能够理性看待损失和收益的权衡。',
    },
    framing: {
      high: '你容易受到信息表述方式的影响，建议在重要决策时尝试"翻面思考"。',
      medium: '你在一定程度上会受到框架效应的影响，注意信息的呈现方式。',
      low: '你能够透过不同的表述方式看到问题的本质。',
    },
    halo: {
      high: '你容易因某一突出特征而影响整体判断，建议对每个维度独立评估。',
      medium: '你在一定程度上会受到光环效应的影响，注意区分不同维度。',
      low: '你能够较为独立地评估不同方面的表现。',
    },
  }
  return (interpretations[biasType] && interpretations[biasType][level]) || ''
}

function getBiasSuggestions(biasType, level) {
  const suggestions = {
    anchoring: [
      '在设定目标前，先不要看任何参考数据，独立写下你的判断',
      '获取至少3个不同来源的参考信息后再做决策',
      '练习"锚定清零"：在做估算前，先问自己"如果没有任何参考，我会怎么想？"',
    ],
    availability: [
      '用数据和统计代替直觉印象做判断',
      '记录"直觉 vs 事实"日记，定期对比你的直觉判断和实际结果',
      '在评估风险时，主动寻找统计数据而非依赖新闻案例',
    ],
    confirmation: [
      '练习"反向思考"：强制自己为相反观点辩护',
      '在决策前，刻意寻找3个反对你观点的证据',
      '与持不同意见的人深入交流，理解他们的逻辑',
    ],
    overconfidence: [
      '在做出判断时，标注你的置信度（如"80%把握"），并追踪准确率',
      '定期进行"预测 vs 实际"对比回顾',
      '在不确定的领域，主动寻求外部专家的意见',
    ],
    lossAversion: [
      '在做风险决策时，计算期望值而非只关注损失可能性',
      '设定"止损线"和"止盈线"，用规则代替情绪决策',
      '练习"10-10-10"法则：10天后、10个月后、10年后你会怎么看待这个决定？',
    ],
    framing: [
      '在阅读重要信息时，尝试用相反框架重新表述',
      '做决策前，问自己"如果换一种说法，我的选择会变吗？"',
      '关注数据本身，而非数据的呈现方式',
    ],
    halo: [
      '在评估时，将不同维度分开独立评分',
      '注意第一印象的影响，给"第二印象"留出空间',
      '使用评估清单，确保每个维度都被独立考虑',
    ],
  }
  const list = (suggestions[biasType] || [])
  if (level === 'high') return list
  if (level === 'medium') return list.slice(0, 2)
  return list.slice(0, 1)
}