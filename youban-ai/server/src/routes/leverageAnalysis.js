import db from '../db/init.js'

export function analyzeLeveragePoints(req, res) {
  const memberId = req.member.id
  const { topStrengths } = req.body || {}

  const strengths = (topStrengths && topStrengths.length > 0) ? topStrengths : ['战略思维', '学习能力', '沟通表达', '分析判断', '创新能力']

  const abilityLeverage = strengths.slice(0, 3).map((s, i) => ({
    ability: typeof s === 'string' ? s : s.name || s,
    leverageScore: 85 - i * 10,
    effort: 1,
    return: (5 - i * 1.5).toFixed(1),
    roi: ((5 - i * 1.5) / 1).toFixed(1),
    strategy: `${typeof s === 'string' ? s : s.name || s}是你的核心优势，投入1分精力可获得${(5 - i * 1.5).toFixed(1)}分回报。建议将此能力与行业需求结合，打造个人品牌。`,
  }))

  const platformLeverage = [
    { platform: '内容创作平台', score: 78, desc: '通过写作/视频分享专业知识，放大个人影响力' },
    { platform: '专业社群网络', score: 72, desc: '加入高质量行业社群，建立有价值的人脉连接' },
    { platform: '开源/协作项目', score: 68, desc: '参与行业开源项目，展示专业能力并获得反馈' },
  ]

  const networkLeverage = [
    { type: '导师/教练关系', score: 82, desc: '寻找一位行业导师，加速认知升级和资源获取' },
    { type: '同行学习小组', score: 75, desc: '组建3-5人的学习小组，定期交流碰撞思想' },
    { type: '跨界人脉连接', score: 70, desc: '主动连接不同领域的优秀人才，获取跨界视角' },
  ]

  const resourceLeverage = [
    { resource: '时间投资', score: 85, desc: '将每天最高效的2小时投入到高杠杆能力的刻意练习中' },
    { resource: '知识资产', score: 78, desc: '将隐性知识转化为文章、课程、工具等可复用资产' },
    { resource: '技术工具', score: 72, desc: '利用AI工具提升效率，将精力集中在创造性工作' },
  ]

  const highLeveragePoints = [
    { point: strengths[0] || '核心优势', type: '能力杠杆', roi: '5x', priority: '最高' },
    { point: '内容创作', type: '平台杠杆', roi: '4x', priority: '高' },
    { point: '导师关系', type: '人脉杠杆', roi: '3.5x', priority: '高' },
  ]

  const roiAnalysis = [
    { action: `深耕${strengths[0]}能力`, effort: '每天1小时', expectedReturn: '专业能力提升50%', timeFrame: '3个月' },
    { action: '每周输出一篇专业文章', effort: '每周2小时', expectedReturn: '建立个人品牌，获得行业认可', timeFrame: '6个月' },
    { action: '寻找一位行业导师', effort: '每月2次交流', expectedReturn: '认知升级，获取关键资源', timeFrame: '1个月' },
  ]

  db.prepare(`INSERT INTO leverage_analyses (member_id, ability_leverage, platform_leverage, network_leverage, resource_leverage, high_leverage_points, roi_analysis) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(memberId, JSON.stringify(abilityLeverage), JSON.stringify(platformLeverage), JSON.stringify(networkLeverage), JSON.stringify(resourceLeverage), JSON.stringify(highLeveragePoints), JSON.stringify(roiAnalysis))

  res.json({ code: 0, data: { abilityLeverage, platformLeverage, networkLeverage, resourceLeverage, highLeveragePoints, roiAnalysis }, message: '杠杆分析完成' })
}

export function getLeverageAnalysisHistory(req, res) {
  const memberId = req.member.id
  const analyses = db.prepare('SELECT * FROM leverage_analyses WHERE member_id = ? ORDER BY created_at DESC').all(memberId)
  res.json({ code: 0, data: analyses.map(a => ({
    ...a,
    ability_leverage: JSON.parse(a.ability_leverage || '[]'),
    platform_leverage: JSON.parse(a.platform_leverage || '[]'),
    network_leverage: JSON.parse(a.network_leverage || '[]'),
    resource_leverage: JSON.parse(a.resource_leverage || '[]'),
    high_leverage_points: JSON.parse(a.high_leverage_points || '[]'),
    roi_analysis: JSON.parse(a.roi_analysis || '[]'),
  })) })
}
