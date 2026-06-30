import db from '../db/init.js'

const BIAS_PATTERNS = [
  { name: '沉没成本谬误', keyword: '已经投入', question: '如果之前没有投入任何资源，你现在还会做同样的选择吗？' },
  { name: '确认偏误', keyword: '证明我是对的', question: '你有没有主动寻找反对这个选择的证据？' },
  { name: '过度自信', keyword: '一定、肯定', question: '客观来说，你有多大把握？有没有考虑过失败的可能性？' },
  { name: '锚定效应', keyword: '参考', question: '你的判断是否受到了某条初始信息的影响？' },
  { name: '损失厌恶', keyword: '失去、损失', question: '如果换个角度，从"获得"的视角看，你的选择会变吗？' },
  { name: '框架效应', keyword: '选择', question: '如果问题用不同的方式表述，你的答案会变吗？' },
]

export function createDecision(req, res) {
  const memberId = req.member.id
  const { title, description, options } = req.body
  const biasesDetected = detectBiases(description || title)

  const result = db.prepare(`INSERT INTO decision_records (member_id, title, description, options, biases_detected) VALUES (?, ?, ?, ?, ?)`).run(memberId, title, description, JSON.stringify(options || []), JSON.stringify(biasesDetected))
  res.json({ code: 0, data: { id: result.lastInsertRowid, biasesDetected }, message: '决策记录已创建' })
}

export function analyzeDecision(req, res) {
  const memberId = req.member.id
  const { id, probabilities } = req.body
  const decision = db.prepare('SELECT * FROM decision_records WHERE id = ? AND member_id = ?').get(id, memberId)
  if (!decision) return res.status(404).json({ code: 404, message: '未找到决策记录' })

  const options = JSON.parse(decision.options || '[]')
  const probs = probabilities || options.map(() => 50)
  const expectedValues = options.map((opt, i) => {
    const prob = probs[i] || 50
    return { option: opt, probability: prob, winValue: Math.round(opt.length * 12 + Math.random() * 50), loseValue: Math.round(opt.length * 8 + Math.random() * 30), expectedValue: Math.round(prob * 0.7 - (100 - prob) * 0.3) }
  })

  const biasesDetected = JSON.parse(decision.biases_detected || '[]')
  const biasQuestions = biasesDetected.map(b => ({ bias: b.name, question: b.question }))

  db.prepare('UPDATE decision_records SET probabilities = ?, expected_values = ? WHERE id = ?').run(JSON.stringify(probs), JSON.stringify(expectedValues), id)

  res.json({ code: 0, data: { id, expectedValues, biasQuestions }, message: '决策分析完成' })
}

export function completeDecision(req, res) {
  const memberId = req.member.id
  const { id, chosenOption, actualOutcome, satisfaction } = req.body
  db.prepare('UPDATE decision_records SET chosen_option = ?, actual_outcome = ?, satisfaction = ? WHERE id = ? AND member_id = ?').run(chosenOption, actualOutcome, satisfaction || 0, id, memberId)
  res.json({ code: 0, message: '决策结果已记录' })
}

export function getDecisionHistory(req, res) {
  const memberId = req.member.id
  const decisions = db.prepare('SELECT * FROM decision_records WHERE member_id = ? ORDER BY created_at DESC').all(memberId)
  res.json({ code: 0, data: decisions.map(d => ({ ...d, options: JSON.parse(d.options || '[]'), expected_values: JSON.parse(d.expected_values || '[]'), biases_detected: JSON.parse(d.biases_detected || '[]') })) })
}

function detectBiases(text) {
  return BIAS_PATTERNS.filter(b => text.includes(b.keyword)).map(b => ({ name: b.name, question: b.question }))
}
