import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '..', '..', 'data', 'youban.db')

// Ensure data directory exists
import fs from 'fs'
const dataDir = path.dirname(dbPath)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const db = new Database(dbPath)

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// Create tables
db.exec(`
  -- 会员表：每个会员独立的账户信息
  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nickname TEXT NOT NULL,
    phone TEXT DEFAULT '',
    avatar TEXT DEFAULT '',
    email TEXT DEFAULT '',
    member_level TEXT DEFAULT 'free' CHECK(member_level IN ('free', 'premium', 'vip')),
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'banned')),
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime')),
    last_login_at TEXT
  );

  -- 会员学习空间：每个会员的独立学习数据
  CREATE TABLE IF NOT EXISTS member_learning_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL UNIQUE,
    total_study_hours REAL DEFAULT 0,
    consecutive_days INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    achievements INTEGER DEFAULT 0,
    last_study_date TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
  );

  -- 会员优势画像
  CREATE TABLE IF NOT EXISTS member_strength_profile (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL UNIQUE,
    top_strengths TEXT DEFAULT '[]',
    talent_score INTEGER DEFAULT 0,
    skill_score INTEGER DEFAULT 0,
    character_score INTEGER DEFAULT 0,
    value_score INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
  );

  -- 测评记录
  CREATE TABLE IF NOT EXISTS assessment_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    test_type TEXT NOT NULL CHECK(test_type IN ('quick', 'full', 'interview')),
    scores TEXT DEFAULT '{}',
    top_strengths TEXT DEFAULT '[]',
    blind_spots TEXT DEFAULT '[]',
    recommendations TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
  );

  -- 成长目标
  CREATE TABLE IF NOT EXISTS growth_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT DEFAULT '',
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'active',
    progress INTEGER DEFAULT 0,
    cycle TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
  );

  -- 成长目标里程碑
  CREATE TABLE IF NOT EXISTS goal_milestones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    goal_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    done INTEGER DEFAULT 0,
    FOREIGN KEY (goal_id) REFERENCES growth_goals(id) ON DELETE CASCADE
  );

  -- 成长目标任务
  CREATE TABLE IF NOT EXISTS goal_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    goal_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    due_date TEXT,
    done INTEGER DEFAULT 0,
    FOREIGN KEY (goal_id) REFERENCES growth_goals(id) ON DELETE CASCADE
  );

  -- 实践记录
  CREATE TABLE IF NOT EXISTS practice_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    content TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
  );

  -- AI 对话记录
  CREATE TABLE IF NOT EXISTS chat_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    title TEXT DEFAULT '新对话',
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
  );

  -- 建议与推荐表：系统根据学习情况动态匹配的建议
  CREATE TABLE IF NOT EXISTS recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('practice', 'goal', 'topic', 'career')),
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    match_score INTEGER DEFAULT 0,
    match_reason TEXT DEFAULT '',
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected')),
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
  );

  -- 操作日志
  CREATE TABLE IF NOT EXISTS operation_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER,
    action TEXT NOT NULL,
    detail TEXT DEFAULT '',
    ip TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );
`)

// Create indexes
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_members_username ON members(username);
  CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
  CREATE INDEX IF NOT EXISTS idx_assessment_member ON assessment_records(member_id);
  CREATE INDEX IF NOT EXISTS idx_growth_goals_member ON growth_goals(member_id);
  CREATE INDEX IF NOT EXISTS idx_practice_member ON practice_records(member_id);
  CREATE INDEX IF NOT EXISTS idx_chat_sessions_member ON chat_sessions(member_id);
  CREATE INDEX IF NOT EXISTS idx_recommendations_member ON recommendations(member_id);
  CREATE INDEX IF NOT EXISTS idx_operation_logs_member ON operation_logs(member_id);
`)

export default db