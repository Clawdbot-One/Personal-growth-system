import db from '../db/init.js'

const DIMENSIONS = [
  { key: 'self_awareness', name: '自我觉察', desc: '对自己思维过程和认知状态的觉察能力', questions: [
    { id: 1, text: '在做出重要决定后，你是否经常反思自己的思考过程？', options: [{ value: 'A', text: '几乎从不', score: 1 }, { value: 'B', text: '偶尔会', score: 2 }, { value: 'C', text: '经常会', score: 3 }, { value: 'D', text: '几乎每次都会', score: 4 }] },
    { id: 2, text: '当别人指出你的错误时，你的第一反应是？', options: [{ value: 'A', text: '立即反驳，认为自己是对的', score: 1 }, { value: 'B', text: '先怀疑对方，再慢慢思考', score: 2 }, { value: 'C', text: '认真倾听，对照自我认知', score: 3 }, { value: 'D', text: '感谢对方，深度反思自己的盲区', score: 4 }] },
    { id: 3, text: '你能否准确描述自己在不同情境下的情绪和思维模式？', options: [{ value: 'A', text: '完全不能', score: 1 }, { value: 'B', text: '偶尔能描述一些', score: 2 }, { value: 'C', text: '大部分情况可以', score: 3 }, { value: 'D', text: '非常清晰，善于自我分析', score: 4 }] },
  ]},
  { key: 'knowledge_gap', name: '认知盲区识别', desc: '识别自己"不知道什么"的能力', questions: [
    { id: 4, text: '面对一个陌生领域的问题，你通常如何反应？', options: [{ value: 'A', text: '觉得自己能很快搞定，不需要太多学习', score: 1 }, { value: 'B', text: '意识到自己不太懂，但不会主动学习', score: 2 }, { value: 'C', text: '承认知识不足，开始主动搜集信息', score: 3 }, { value: 'D', text: '先评估自己的知识缺口，再制定学习计划', score: 4 }] },
    { id: 5, text: '你是否经常发现自己在某方面的认知存在盲区？', options: [{ value: 'A', text: '几乎没有这种感觉', score: 1 }, { value: 'B', text: '偶尔会意识到', score: 2 }, { value: 'C', text: '经常发现新的盲区', score: 3 }, { value: 'D', text: '非常清楚自己的知识边界', score: 4 }] },
    { id: 6, text: '当别人谈论你不了解的话题时，你倾向于？', options: [{ value: 'A', text: '假装了解，发表看法', score: 1 }, { value: 'B', text: '保持沉默，不暴露无知', score: 2 }, { value: 'C', text: '主动提问，承认不了解', score: 3 }, { value: 'D', text: '记录下话题，后续深入研究', score: 4 }] },
  ]},
  { key: 'structured_thinking', name: '结构化思维', desc: '将复杂问题拆解为结构化知识树的能力', questions: [
    { id: 7, text: '面对复杂问题时，你的思考方式是？', options: [{ value: 'A', text: '凭直觉和经验直接判断', score: 1 }, { value: 'B', text: '列出关键点，但不够系统', score: 2 }, { value: 'C', text: '用思维导图或框架进行拆解', score: 3 }, { value: 'D', text: '建立系统化分析框架，逐层深入', score: 4 }] },
    { id: 8, text: '你能否将一个复杂概念用自己的话清晰地解释给别人？', options: [{ value: 'A', text: '非常困难', score: 1 }, { value: 'B', text: '可以解释大概', score: 2 }, { value: 'C', text: '大部分概念可以清晰解释', score: 3 }, { value: 'D', text: '善于将复杂概念简化为易懂的表述', score: 4 }] },
    { id: 9, text: '学习新知识时，你是否会主动建立与已有知识的连接？', options: [{ value: 'A', text: '基本不会', score: 1 }, { value: 'B', text: '偶尔会联想到相关知识', score: 2 }, { value: 'C', text: '经常主动建立知识连接', score: 3 }, { value: 'D', text: '系统性地构建知识网络', score: 4 }] },
  ]},
  { key: 'meta_cognition', name: '元认知能力', desc: '对自身思维过程的觉察与调控能力', questions: [
    { id: 10, text: '在解决问题时，你是否会思考"我正在用什么方法思考"？', options: [{ value: 'A', text: '从来没有', score: 1 }, { value: 'B', text: '偶尔会意识到', score: 2 }, { value: 'C', text: '经常会反思自己的思考方式', score: 3 }, { value: 'D', text: '总是有意识地监控自己的思维过程', score: 4 }] },
    { id: 11, text: '当你发现自己的思考方式不够有效时，你会？', options: [{ value: 'A', text: '继续用同样的方式，期待结果改变', score: 1 }, { value: 'B', text: '感到沮丧但不知如何改变', score: 2 }, { value: 'C', text: '尝试换个角度思考', score: 3 }, { value: 'D', text: '主动学习新的思考框架和方法', score: 4 }] },
    { id: 12, text: '你是否经常进行"思考的思考"——即反思自己的思维习惯？', options: [{ value: 'A', text: '几乎没有', score: 1 }, { value: 'B', text: '偶尔会', score: 2 }, { value: 'C', text: '定期进行反思', score: 3 }, { value: 'D', text: '有系统的反思习惯', score: 4 }] },
  ]},
  { key: 'growth_mindset', name: '成长型思维', desc: '相信能力可以通过努力提升的信念', questions: [
    { id: 13, text: '面对失败或挫折，你通常如何解读？', options: [{ value: 'A', text: '说明我能力不够，不适合做这件事', score: 1 }, { value: 'B', text: '运气不好，下次再试试', score: 2 }, { value: 'C', text: '这是一次学习机会，从中找到改进方向', score: 3 }, { value: 'D', text: '系统分析失败原因，制定针对性提升计划', score: 4 }] },
    { id: 14, text: '你对"天才"的看法是？', options: [{ value: 'A', text: '天赋决定一切，努力作用有限', score: 1 }, { value: 'B', text: '天赋很重要，但努力也有一定作用', score: 2 }, { value: 'C', text: '天赋和努力同等重要', score: 3 }, { value: 'D', text: '持续学习和刻意练习比天赋更重要', score: 4 }] },
    { id: 15, text: '当看到别人比你优秀时，你的感受是？', options: [{ value: 'A', text: '沮丧，觉得自己不如人', score: 1 }, { value: 'B', text: '羡慕，但不会做什么', score: 2 }, { value: 'C', text: '受激励，想向他们学习', score: 3 }, { value: 'D', text: '分析他们成功的原因，纳入自己的成长计划', score: 4 }] },
  ]},
]

export function startCognitiveLevelTest(req, res) {
  const memberId = req.member.id
  const result = db.prepare('INSERT INTO cognitive_level_sessions (member_id) VALUES (?)').run(memberId)
  const questions = DIMENSIONS.flatMap(d => d.questions.map(q => ({ ...q, dimension: d.key })))
  res.json({ code: 0, data: { sessionId: result.lastInsertRowid, questions, totalQuestions: questions.length }, message: '认知层次诊断已开始' })
}

export function submitCognitiveLevelAnswers(req, res) {
  const memberId = req.member.id
  const { sessionId, answers } = req.body
  if (!sessionId || !answers) return res.status(400).json({ code: 400, message: '缺少必要参数' })

  const dimScores = {}
  for (const dim of DIMENSIONS) {
    dimScores[dim.key] = { total: 0, count: 0, name: dim.name, desc: dim.desc }
  }
  const allQuestions = DIMENSIONS.flatMap(d => d.questions)
  for (const q of allQuestions) {
    const userAnswer = answers[q.id]
    if (!userAnswer) continue
    const option = q.options.find(o => o.value === userAnswer)
    if (!option) continue
    const dim = DIMENSIONS.find(d => d.questions.some(dq => dq.id === q.id))
    if (dim) { dimScores[dim.key].total += option.score; dimScores[dim.key].count++ }
  }

  for (const [key, data] of Object.entries(dimScores)) {
    const avgScore = data.count > 0 ? Math.round((data.total / (data.count * 4)) * 100) : 0
    let level, levelName
    if (avgScore >= 75) { level = 3; levelName = '融会贯通区' }
    else if (avgScore >= 50) { level = 2; levelName = '专业精通区' }
    else if (avgScore >= 25) { level = 1; levelName = '觉醒学习区' }
    else { level = 0; levelName = '盲目自信区' }

    const blindSpots = level <= 1 ? [`你在${data.name}方面存在较大认知盲区`, `建议从基础自我觉察练习开始`] : level <= 2 ? [`${data.name}还有提升空间`, `建议进行刻意练习`] : []
    const breakthroughTips = level === 0 ? ['每天进行5分钟反思日记', '向他人寻求诚实反馈', '阅读认知升级相关书籍'] : level === 1 ? ['使用费曼技巧检验理解', '建立知识框架体系', '定期进行认知复盘'] : level === 2 ? ['进行跨领域知识连接', '教授他人所学内容', '挑战更高难度的问题'] : ['保持元认知习惯', '探索新的思维模型', '帮助他人提升认知层次']

    db.prepare(`INSERT INTO cognitive_level_results (session_id, member_id, dimension, dimension_name, level, level_name, score, blind_spots, breakthrough_tips) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(sessionId, memberId, key, data.name, level, levelName, avgScore, JSON.stringify(blindSpots), JSON.stringify(breakthroughTips))
  }

  db.prepare(`UPDATE cognitive_level_sessions SET status = 'completed', completed_at = datetime('now', 'localtime') WHERE id = ?`).run(sessionId)
  res.json({ code: 0, data: { sessionId }, message: '诊断结果已保存' })
}

export function getCognitiveLevelResult(req, res) {
  const memberId = req.member.id
  const { sessionId } = req.params
  const results = db.prepare('SELECT * FROM cognitive_level_results WHERE session_id = ? AND member_id = ? ORDER BY score DESC').all(sessionId, memberId)
  if (results.length === 0) return res.status(404).json({ code: 404, message: '未找到诊断结果' })
  res.json({ code: 0, data: { sessionId, results: results.map(r => ({ ...r, blind_spots: JSON.parse(r.blind_spots || '[]'), breakthrough_tips: JSON.parse(r.breakthrough_tips || '[]') })) } })
}

export function getCognitiveLevelHistory(req, res) {
  const memberId = req.member.id
  const sessions = db.prepare(`SELECT s.*, COUNT(r.id) as result_count FROM cognitive_level_sessions s LEFT JOIN cognitive_level_results r ON s.id = r.session_id WHERE s.member_id = ? AND s.status = 'completed' GROUP BY s.id ORDER BY s.created_at DESC`).all(memberId)
  res.json({ code: 0, data: sessions })
}
