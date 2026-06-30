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
    member_level TEXT DEFAULT 'free' CHECK(member_level IN ('free', 'premium', 'vip', 'admin')),
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

  -- ========== 刻意练习模块 ==========

  -- 训练计划表
  CREATE TABLE IF NOT EXISTS dp_training_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    area TEXT NOT NULL,
    description TEXT DEFAULT '',
    sub_goals TEXT DEFAULT '[]',
    current_level TEXT DEFAULT 'novice',
    target_level TEXT DEFAULT 'competent',
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'paused', 'completed')),
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
  );

  -- 刻意练习会话记录
  CREATE TABLE IF NOT EXISTS dp_practice_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    plan_id INTEGER,
    goal TEXT NOT NULL,
    content TEXT DEFAULT '',
    duration_minutes INTEGER DEFAULT 0,
    effective_duration_minutes INTEGER DEFAULT 0,
    focus_score INTEGER DEFAULT 0,
    difficulty_level TEXT DEFAULT 'learning' CHECK(difficulty_level IN ('comfort', 'learning', 'panic')),
    reflection TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES dp_training_plans(id) ON DELETE SET NULL
  );

  -- 练习质量评分表
  CREATE TABLE IF NOT EXISTS dp_practice_quality_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL UNIQUE,
    goal_clarity_score INTEGER DEFAULT 0,
    comfort_zone_break_score INTEGER DEFAULT 0,
    feedback_quality_score INTEGER DEFAULT 0,
    focus_intensity_score INTEGER DEFAULT 0,
    overall_score INTEGER DEFAULT 0,
    assessment TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (session_id) REFERENCES dp_practice_sessions(id) ON DELETE CASCADE
  );

  -- 三区评估记录
  CREATE TABLE IF NOT EXISTS dp_zone_assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    area TEXT NOT NULL,
    comfort_zone_score REAL DEFAULT 0,
    learning_zone_score REAL DEFAULT 0,
    panic_zone_score REAL DEFAULT 0,
    current_zone TEXT DEFAULT 'comfort',
    difficulty_level REAL DEFAULT 1.0,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
  );

  -- 反馈记录表（四层反馈模型）
  CREATE TABLE IF NOT EXISTS dp_feedback_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    member_id INTEGER NOT NULL,
    result_feedback TEXT DEFAULT '',
    process_feedback TEXT DEFAULT '',
    strategy_feedback TEXT DEFAULT '',
    meta_feedback TEXT DEFAULT '',
    improvement_suggestions TEXT DEFAULT '[]',
    is_adopted INTEGER DEFAULT 0,
    adopted_at TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (session_id) REFERENCES dp_practice_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
  );

  -- 专注力训练会话
  CREATE TABLE IF NOT EXISTS dp_focus_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    duration_minutes INTEGER NOT NULL,
    focus_score INTEGER DEFAULT 0,
    distraction_count INTEGER DEFAULT 0,
    mode TEXT DEFAULT 'normal' CHECK(mode IN ('normal', 'deep', 'strict')),
    time_of_day TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
  );

  -- 心理表征测评记录
  CREATE TABLE IF NOT EXISTS dp_mental_representation_assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    area TEXT NOT NULL,
    stage TEXT DEFAULT 'novice',
    pattern_recognition_score INTEGER DEFAULT 0,
    situational_judgment_score INTEGER DEFAULT 0,
    analogical_reasoning_score INTEGER DEFAULT 0,
    overall_maturity_score INTEGER DEFAULT 0,
    assessment_data TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
  );
`)

  // === 认知偏差扫描仪 ===
  db.exec(`
    CREATE TABLE IF NOT EXISTS cognitive_bias_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      status TEXT DEFAULT 'in_progress',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      completed_at TEXT,
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cognitive_bias_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      member_id INTEGER NOT NULL,
      bias_type TEXT NOT NULL,
      bias_name TEXT NOT NULL,
      score INTEGER DEFAULT 0,
      level TEXT DEFAULT 'low',
      interpretation TEXT DEFAULT '',
      suggestions TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (session_id) REFERENCES cognitive_bias_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
    );
  `)

  // === 双系统思维训练 ===
  db.exec(`
    CREATE TABLE IF NOT EXISTS dual_system_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      status TEXT DEFAULT 'in_progress',
      total_questions INTEGER DEFAULT 0,
      correct_count INTEGER DEFAULT 0,
      system1_count INTEGER DEFAULT 0,
      system2_count INTEGER DEFAULT 0,
      avg_reaction_time_ms INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      completed_at TEXT,
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS dual_system_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      member_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      user_answer TEXT,
      correct_answer TEXT,
      is_correct INTEGER DEFAULT 0,
      reaction_time_ms INTEGER DEFAULT 0,
      thinking_mode TEXT DEFAULT 'system1',
      question_type TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (session_id) REFERENCES dual_system_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
    );
  `)

  // === 过度自信校准 ===
  db.exec(`
    CREATE TABLE IF NOT EXISTS calibration_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      status TEXT DEFAULT 'in_progress',
      total_questions INTEGER DEFAULT 0,
      correct_count INTEGER DEFAULT 0,
      brier_score REAL DEFAULT 0,
      calibration_level TEXT DEFAULT 'uncalibrated',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      completed_at TEXT,
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS calibration_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      member_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      category TEXT DEFAULT '',
      user_answer TEXT,
      correct_answer TEXT,
      is_correct INTEGER DEFAULT 0,
      confidence INTEGER DEFAULT 50,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (session_id) REFERENCES calibration_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
    );
  `)

  // === 认知层次诊断 ===
  db.exec(`
    CREATE TABLE IF NOT EXISTS cognitive_level_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      status TEXT DEFAULT 'in_progress',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      completed_at TEXT,
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cognitive_level_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      member_id INTEGER NOT NULL,
      dimension TEXT NOT NULL,
      dimension_name TEXT DEFAULT '',
      level INTEGER DEFAULT 1,
      level_name TEXT DEFAULT '',
      score INTEGER DEFAULT 0,
      blind_spots TEXT DEFAULT '[]',
      breakthrough_tips TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (session_id) REFERENCES cognitive_level_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
    );
  `)

  // === 价值定位分析 ===
  db.exec(`
    CREATE TABLE IF NOT EXISTS value_assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      usefulness_score INTEGER DEFAULT 0,
      scarcity_score INTEGER DEFAULT 0,
      irreplaceability_score INTEGER DEFAULT 0,
      value_index INTEGER DEFAULT 0,
      top_fields TEXT DEFAULT '[]',
      recommendations TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
    );
  `)

  // === 杠杆点分析 ===
  db.exec(`
    CREATE TABLE IF NOT EXISTS leverage_analyses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      ability_leverage TEXT DEFAULT '[]',
      platform_leverage TEXT DEFAULT '[]',
      network_leverage TEXT DEFAULT '[]',
      resource_leverage TEXT DEFAULT '[]',
      high_leverage_points TEXT DEFAULT '[]',
      roi_analysis TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
    );
  `)

  // === 复利成长追踪 ===
  db.exec(`
    CREATE TABLE IF NOT EXISTS compound_growth_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      dimension TEXT DEFAULT '',
      dimension_name TEXT DEFAULT '',
      daily_growth_rate REAL DEFAULT 0,
      current_level REAL DEFAULT 0,
      streak_days INTEGER DEFAULT 0,
      projected_milestone_date TEXT,
      next_milestone TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS micro_habit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      habit_name TEXT DEFAULT '',
      dimension TEXT DEFAULT '',
      completed INTEGER DEFAULT 0,
      log_date TEXT DEFAULT (date('now', 'localtime')),
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
    );
  `)

  // === 知识网络 ===
  db.exec(`
    CREATE TABLE IF NOT EXISTS knowledge_nodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      name TEXT DEFAULT '',
      category TEXT DEFAULT '',
      mastery_level INTEGER DEFAULT 0,
      status TEXT DEFAULT 'to_learn',
      prerequisites TEXT DEFAULT '[]',
      related_nodes TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
    );
  `)

  // === 决策辅助 ===
  db.exec(`
    CREATE TABLE IF NOT EXISTS decision_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      title TEXT DEFAULT '',
      description TEXT DEFAULT '',
      options TEXT DEFAULT '[]',
      probabilities TEXT DEFAULT '[]',
      expected_values TEXT DEFAULT '[]',
      chosen_option TEXT DEFAULT '',
      actual_outcome TEXT DEFAULT '',
      satisfaction INTEGER DEFAULT 0,
      biases_detected TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
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
  CREATE INDEX IF NOT EXISTS idx_dp_sessions_member ON dp_practice_sessions(member_id);
  CREATE INDEX IF NOT EXISTS idx_dp_sessions_plan ON dp_practice_sessions(plan_id);
  CREATE INDEX IF NOT EXISTS idx_dp_zone_member ON dp_zone_assessments(member_id);
  CREATE INDEX IF NOT EXISTS idx_dp_feedback_session ON dp_feedback_records(session_id);
  CREATE INDEX IF NOT EXISTS idx_dp_feedback_member ON dp_feedback_records(member_id);
  CREATE INDEX IF NOT EXISTS idx_dp_focus_member ON dp_focus_sessions(member_id);
  CREATE INDEX IF NOT EXISTS idx_dp_mental_member ON dp_mental_representation_assessments(member_id);
  CREATE INDEX IF NOT EXISTS idx_dp_plans_member ON dp_training_plans(member_id);
  CREATE INDEX IF NOT EXISTS idx_cb_sessions_member ON cognitive_bias_sessions(member_id);
  CREATE INDEX IF NOT EXISTS idx_cb_results_session ON cognitive_bias_results(session_id);
  CREATE INDEX IF NOT EXISTS idx_ds_sessions_member ON dual_system_sessions(member_id);
  CREATE INDEX IF NOT EXISTS idx_ds_results_session ON dual_system_results(session_id);
  CREATE INDEX IF NOT EXISTS idx_cal_sessions_member ON calibration_sessions(member_id);
  CREATE INDEX IF NOT EXISTS idx_cal_records_session ON calibration_records(session_id);
  CREATE INDEX IF NOT EXISTS idx_cl_sessions_member ON cognitive_level_sessions(member_id);
  CREATE INDEX IF NOT EXISTS idx_cl_results_session ON cognitive_level_results(session_id);
  CREATE INDEX IF NOT EXISTS idx_value_assess_member ON value_assessments(member_id);
  CREATE INDEX IF NOT EXISTS idx_leverage_member ON leverage_analyses(member_id);
  CREATE INDEX IF NOT EXISTS idx_compound_member ON compound_growth_records(member_id);
  CREATE INDEX IF NOT EXISTS idx_habit_member ON micro_habit_logs(member_id);
  CREATE INDEX IF NOT EXISTS idx_knowledge_member ON knowledge_nodes(member_id);
  CREATE INDEX IF NOT EXISTS idx_decision_member ON decision_records(member_id);
`)

export default db