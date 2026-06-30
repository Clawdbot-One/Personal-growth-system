import db from '../db/init.js'

const DEFAULT_NODES = [
  { name: '自我认知', category: '认知基础', mastery: 70, status: 'mastered', prerequisites: [], related: ['元认知', '情绪智力'] },
  { name: '元认知', category: '认知基础', mastery: 50, status: 'learning', prerequisites: ['自我认知'], related: ['结构化思维', '反思能力'] },
  { name: '结构化思维', category: '思维方法', mastery: 40, status: 'learning', prerequisites: ['元认知'], related: ['问题拆解', '知识图谱'] },
  { name: '问题拆解', category: '思维方法', mastery: 30, status: 'to_learn', prerequisites: ['结构化思维'], related: ['系统思维', 'MECE法则'] },
  { name: '系统思维', category: '思维方法', mastery: 20, status: 'to_learn', prerequisites: ['问题拆解'], related: ['复杂问题解决', '反馈循环'] },
  { name: '情绪智力', category: '认知基础', mastery: 60, status: 'mastered', prerequisites: ['自我认知'], related: ['社交认知', '共情能力'] },
  { name: '社交认知', category: '人际关系', mastery: 45, status: 'learning', prerequisites: ['情绪智力'], related: ['沟通技巧', '影响力'] },
  { name: '沟通技巧', category: '人际关系', mastery: 55, status: 'learning', prerequisites: ['社交认知'], related: ['表达力', '倾听能力'] },
  { name: '表达力', category: '人际关系', mastery: 50, status: 'learning', prerequisites: ['沟通技巧'], related: ['写作能力', '演讲能力'] },
  { name: '数据分析', category: '专业技能', mastery: 35, status: 'to_learn', prerequisites: ['结构化思维'], related: ['统计思维', '可视化'] },
  { name: '统计思维', category: '专业技能', mastery: 25, status: 'to_learn', prerequisites: ['数据分析'], related: ['概率思维', '假设检验'] },
  { name: '概率思维', category: '专业技能', mastery: 20, status: 'to_learn', prerequisites: ['统计思维'], related: ['决策科学', '风险管理'] },
  { name: '决策科学', category: '应用领域', mastery: 30, status: 'to_learn', prerequisites: ['概率思维', '系统思维'], related: ['选择架构', '行为经济学'] },
  { name: '学习能力', category: '认知基础', mastery: 65, status: 'mastered', prerequisites: [], related: ['元认知', '知识管理'] },
  { name: '知识管理', category: '认知基础', mastery: 40, status: 'learning', prerequisites: ['学习能力'], related: ['知识图谱', '笔记系统'] },
]

export function getKnowledgeNetwork(req, res) {
  const memberId = req.member.id
  const existingNodes = db.prepare('SELECT * FROM knowledge_nodes WHERE member_id = ?').all(memberId)

  let nodes
  if (existingNodes.length === 0) {
    const insert = db.prepare('INSERT INTO knowledge_nodes (member_id, name, category, mastery_level, status, prerequisites, related_nodes) VALUES (?, ?, ?, ?, ?, ?, ?)')
    const insertMany = db.transaction(() => {
      for (const n of DEFAULT_NODES) {
        insert.run(memberId, n.name, n.category, n.mastery, n.status, JSON.stringify(n.prerequisites), JSON.stringify(n.related))
      }
    })
    insertMany()
    nodes = DEFAULT_NODES.map(n => ({ ...n, prerequisites: n.prerequisites, related: n.related }))
  } else {
    nodes = existingNodes.map(n => ({
      name: n.name, category: n.category, mastery: n.mastery_level, status: n.status,
      prerequisites: JSON.parse(n.prerequisites || '[]'), related: JSON.parse(n.related_nodes || '[]'),
    }))
  }

  const edges = []
  for (const node of nodes) {
    for (const pre of node.prerequisites) {
      if (nodes.some(n => n.name === pre)) {
        edges.push({ source: pre, target: node.name, type: 'prerequisite' })
      }
    }
    for (const rel of node.related) {
      if (nodes.some(n => n.name === rel) && !edges.some(e => (e.source === node.name && e.target === rel) || (e.source === rel && e.target === node.name))) {
        edges.push({ source: node.name, target: rel, type: 'related' })
      }
    }
  }

  const stats = {
    totalNodes: nodes.length,
    mastered: nodes.filter(n => n.status === 'mastered').length,
    learning: nodes.filter(n => n.status === 'learning').length,
    toLearn: nodes.filter(n => n.status === 'to_learn').length,
    avgMastery: Math.round(nodes.reduce((s, n) => s + n.mastery, 0) / nodes.length),
    availablePaths: generateLearningPaths(nodes, edges),
  }

  res.json({ code: 0, data: { nodes, edges, stats } })
}

function generateLearningPaths(nodes, edges) {
  const toLearn = nodes.filter(n => n.status === 'to_learn').slice(0, 3)
  return toLearn.map(n => {
    const path = [n.name]
    let current = n
    while (current.prerequisites && current.prerequisites.length > 0) {
      const pre = current.prerequisites[0]
      const preNode = nodes.find(nn => nn.name === pre)
      if (preNode) { path.unshift(pre); current = preNode }
      else break
    }
    return { target: n.name, path, steps: path.length }
  })
}

export function updateKnowledgeNode(req, res) {
  const memberId = req.member.id
  const { nodeName, masteryLevel, status } = req.body
  db.prepare('UPDATE knowledge_nodes SET mastery_level = ?, status = ? WHERE member_id = ? AND name = ?').run(masteryLevel || 0, status || 'learning', memberId, nodeName)
  res.json({ code: 0, message: '知识节点已更新' })
}
