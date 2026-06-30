import db from '../db/init.js'

// 各等级的功能限制配置
const LEVEL_CONFIG = {
  free: {
    label: '免费版',
    limits: {
      'assessment-full': 0,       // 完整版测评不可用
      'assessment-interview': 0,  // 访谈版测评不可用
      'cognitive-bias': 1,       // 认知偏差 1次/月
      'dual-system': 3,          // 双系统思维 3次/月
      'calibration': 1,          // 过度自信校准 1次/月
      'cognitive-level': 1,      // 认知层次 1次/月
      'value-analysis': 1,       // 价值定位 1次/月
      'leverage-analysis': 1,    // 杠杆分析 1次/月
      'ai-chat': 10,             // AI助手 10次/天
      'decision': 1,             // 决策辅助 1个/月
      'compound-growth': 3,      // 复利成长 3维度
      'knowledge-network': 10,   // 知识网络 10节点
    },
  },
  premium: {
    label: '高级版',
    limits: {
      'assessment-full': 99,     // 完整版可用
      'assessment-interview': 0, // 访谈版不可用
      'cognitive-bias': 3,
      'dual-system': 10,
      'calibration': 3,
      'cognitive-level': 3,
      'value-analysis': 3,
      'leverage-analysis': 3,
      'ai-chat': 50,
      'decision': 5,
      'compound-growth': 5,
      'knowledge-network': 15,
    },
  },
  vip: {
    label: 'VIP版',
    limits: {
      'assessment-full': 99,
      'assessment-interview': 99,
      'cognitive-bias': 99,
      'dual-system': 99,
      'calibration': 99,
      'cognitive-level': 99,
      'value-analysis': 99,
      'leverage-analysis': 99,
      'ai-chat': 99,
      'decision': 99,
      'compound-growth': 99,
      'knowledge-network': 99,
    },
  },
  admin: {
    label: '管理员',
    limits: {},
  },
}

// 等级名称映射
const LEVEL_LABELS = {
  free: '免费版',
  premium: '高级版',
  vip: 'VIP版',
  admin: '管理员',
}

// 获取当前月份标识
function getYearMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function getToday() {
  return new Date().toISOString().slice(0, 10)
}

// 获取用户功能用量
function getUsage(memberId, feature, period = 'month') {
  const key = period === 'day' ? getToday() : getYearMonth()
  const row = db.prepare(
    'SELECT usage_count FROM monthly_usage WHERE member_id = ? AND feature = ? AND year_month = ?'
  ).get(memberId, feature, key)
  return row ? row.usage_count : 0
}

// 增加功能用量
function incrementUsage(memberId, feature, period = 'month') {
  const key = period === 'day' ? getToday() : getYearMonth()
  db.prepare(`
    INSERT INTO monthly_usage (member_id, feature, year_month, usage_count)
    VALUES (?, ?, ?, 1)
    ON CONFLICT(member_id, feature, year_month)
    DO UPDATE SET usage_count = usage_count + 1, updated_at = datetime('now', 'localtime')
  `).run(memberId, feature, key)
}

// 检查会员是否可以访问某功能
function checkAccess(memberId, feature, period = 'month') {
  const member = db.prepare('SELECT member_level FROM members WHERE id = ?').get(memberId)
  if (!member) return { allowed: false, reason: '用户不存在' }

  const level = member.member_level
  const config = LEVEL_CONFIG[level]
  if (!config) return { allowed: false, reason: '未知等级' }

  // admin 无限制
  if (level === 'admin') return { allowed: true, usage: 0, limit: Infinity, level, levelLabel: '管理员' }

  const limit = config.limits[feature]
  if (limit === undefined) return { allowed: true, usage: 0, limit: Infinity, level, levelLabel: config.label }

  if (limit === 0) return { allowed: false, reason: '该功能需要升级会员', usage: 0, limit: 0, level, levelLabel: config.label }

  const usage = getUsage(memberId, feature, period)
  if (usage >= limit) {
    return { allowed: false, reason: '本月使用次数已达上限', usage, limit, level, levelLabel: config.label }
  }

  return { allowed: true, usage, limit, level, levelLabel: config.label }
}

// 中间件工厂函数
function requireLevel(feature, period) {
  return (req, res, next) => {
    const result = checkAccess(req.member.id, feature, period)
    if (!result.allowed) {
      return res.status(403).json({
        code: 403,
        message: result.reason || '权限不足',
        data: {
          currentLevel: result.level,
          currentLevelLabel: result.levelLabel,
          usage: result.usage,
          limit: result.limit,
          feature,
          upgradeUrl: '/upgrade',
        },
      })
    }
    // 记录用量
    incrementUsage(req.member.id, feature, period)
    req.usageInfo = result
    next()
  }
}

// 获取用户所有功能用量和限制
function getMemberLimits(memberId) {
  const member = db.prepare('SELECT member_level FROM members WHERE id = ?').get(memberId)
  if (!member) return null

  const level = member.member_level
  const config = LEVEL_CONFIG[level] || { limits: {}, label: '未知' }

  const limits = {}
  for (const [feature, limit] of Object.entries(config.limits)) {
    const period = feature === 'ai-chat' ? 'day' : 'month'
    limits[feature] = {
      usage: getUsage(memberId, feature, period),
      limit,
      remaining: Math.max(0, limit - getUsage(memberId, feature, period)),
      period,
    }
  }

  return {
    level,
    levelLabel: config.label,
    limits,
  }
}

export {
  LEVEL_CONFIG,
  LEVEL_LABELS,
  checkAccess,
  requireLevel,
  getUsage,
  incrementUsage,
  getMemberLimits,
  getYearMonth,
  getToday,
}