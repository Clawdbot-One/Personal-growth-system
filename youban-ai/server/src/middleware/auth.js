import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'youban-ai-secret-key-2026'

export function generateToken(member) {
  return jwt.sign(
    { id: member.id, username: member.username, level: member.member_level },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '未登录，请先登录' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.member = decoded
    next()
  } catch (err) {
    return res.status(401).json({ code: 401, message: '登录已过期，请重新登录' })
  }
}

export function adminMiddleware(req, res, next) {
  if (req.member?.level !== 'admin') {
    return res.status(403).json({ code: 403, message: '无管理员权限' })
  }
  next()
}