import db from '../db/init.js'

const INDUSTRY_FIELDS = [
  { name: '技术研发', usefulness: 90, scarcity: 85, irreplaceability: 80 },
  { name: '产品管理', usefulness: 85, scarcity: 75, irreplaceability: 70 },
  { name: '数据分析', usefulness: 88, scarcity: 80, irreplaceability: 75 },
  { name: '市场营销', usefulness: 75, scarcity: 60, irreplaceability: 55 },
  { name: '战略咨询', usefulness: 82, scarcity: 78, irreplaceability: 72 },
  { name: '教育培训', usefulness: 80, scarcity: 55, irreplaceability: 60 },
  { name: '创意设计', usefulness: 78, scarcity: 70, irreplaceability: 65 },
  { name: '人力资源', usefulness: 72, scarcity: 50, irreplaceability: 45 },
  { name: '金融投资', usefulness: 85, scarcity: 82, irreplaceability: 78 },
  { name: '医疗健康', usefulness: 92, scarcity: 88, irreplaceability: 85 },
]

export function analyzeValuePositioning(req, res) {
  const memberId = req.member.id
  const { talent, skill, character, value } = req.body || {}

  const usefulness = talent ? Math.round(talent * 0.4 + (skill || 50) * 0.3 + (character || 50) * 0.2 + (value || 50) * 0.1) : 50 + Math.floor(Math.random() * 30)
  const scarcity = Math.round(usefulness * 0.7 + Math.random() * 20)
  const irreplaceability = Math.round(scarcity * 0.8 + Math.random() * 15)
  const valueIndex = Math.round(usefulness * 0.4 + scarcity * 0.35 + irreplaceability * 0.25)

  const topFields = INDUSTRY_FIELDS.map(f => ({
    ...f,
    match: Math.round((usefulness * 0.3 + scarcity * 0.3 + irreplaceability * 0.2 + f.usefulness * 0.2) / 2),
  })).sort((a, b) => b.match - a.match).slice(0, 5)

  const recommendations = [
    { title: '提升稀缺性', desc: `你的稀缺性得分 ${scarcity}，建议深耕 ${topFields[0]?.name || '核心领域'} 的细分方向，建立差异化优势。`, action: '选择一个细分领域，投入100小时深度学习' },
    { title: '构建不可替代性', desc: `你的不可替代性得分 ${irreplaceability}，建议培养跨领域复合能力。`, action: '每周花2小时学习一个与主领域相关的交叉学科知识' },
    { title: '扩大有用性', desc: `你的有用性得分 ${usefulness}，建议将能力应用于更广泛的市场需求。`, action: '主动参与跨部门项目，拓宽能力应用场景' },
  ]

  db.prepare(`INSERT INTO value_assessments (member_id, usefulness_score, scarcity_score, irreplaceability_score, value_index, top_fields, recommendations) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(memberId, usefulness, scarcity, irreplaceability, valueIndex, JSON.stringify(topFields), JSON.stringify(recommendations))

  res.json({ code: 0, data: { usefulness, scarcity, irreplaceability, valueIndex, topFields, recommendations }, message: '价值定位分析完成' })
}

export function getValueAnalysisHistory(req, res) {
  const memberId = req.member.id
  const assessments = db.prepare('SELECT * FROM value_assessments WHERE member_id = ? ORDER BY created_at DESC').all(memberId)
  res.json({ code: 0, data: assessments.map(a => ({ ...a, top_fields: JSON.parse(a.top_fields || '[]'), recommendations: JSON.parse(a.recommendations || '[]') })) })
}
