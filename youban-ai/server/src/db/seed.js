import bcrypt from 'bcryptjs'
import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '..', '..', 'data', 'youban.db')

const db = new Database(dbPath)

const adminAccounts = [
  { username: 'admin', password: 'admin123', nickname: '系统管理员', phone: '13800000001', email: 'admin@youban.ai' },
  { username: 'superadmin', password: 'super123', nickname: '超级管理员', phone: '13800000002', email: 'super@youban.ai' },
  { username: 'opsmanager', password: 'ops123456', nickname: '运营管理员', phone: '13800000003', email: 'ops@youban.ai' },
]

const insertMember = db.prepare(`
  INSERT OR IGNORE INTO members (username, password_hash, nickname, phone, email, member_level)
  VALUES (?, ?, ?, ?, ?, 'admin')
`)

for (const admin of adminAccounts) {
  const hash = bcrypt.hashSync(admin.password, 10)
  const result = insertMember.run(admin.username, hash, admin.nickname, admin.phone, admin.email)
  if (result.changes > 0) {
    const memberId = result.lastInsertRowid
    db.prepare('INSERT OR IGNORE INTO member_learning_data (member_id) VALUES (?)').run(memberId)
    db.prepare('INSERT OR IGNORE INTO member_strength_profile (member_id) VALUES (?)').run(memberId)
    console.log(`管理员账号已创建: ${admin.username} / ${admin.password}`)
  } else {
    console.log(`管理员账号已存在: ${admin.username}`)
  }
}

db.close()
console.log('种子数据初始化完成')