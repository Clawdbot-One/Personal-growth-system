# 优伴AI — 数据库设计文档

> 版本：v1.0  
> 更新日期：2026-06-27  
> 状态：已发布

---

## 目录

1. [数据库选型与设计原则](#1-数据库选型与设计原则)
2. [表结构设计](#2-表结构设计)
   - [2.1 user — 用户表](#21-user--用户表)
   - [2.2 assessment_question — 测评题目表](#22-assessment_question--测评题目表)
   - [2.3 assessment_result — 用户测评结果表](#23-assessment_result--用户测评结果表)
   - [2.4 user_strength_profile — 优势画像表](#24-user_strength_profile--优势画像表)
   - [2.5 growth_goal — 成长目标表](#25-growth_goal--成长目标表)
   - [2.6 task_plan — 任务计划表](#26-task_plan--任务计划表)
   - [2.7 ai_chat_record — AI 对话记录表](#27-ai_chat_record--ai-对话记录表)
   - [2.8 practice_project — 实践项目表](#28-practice_project--实践项目表)
   - [2.9 user_practice — 用户实践记录表](#29-user_practice--用户实践记录表)
   - [2.10 growth_archive — 成长档案表](#210-growth_archive--成长档案表)
   - [2.11 system_config — 系统配置表](#211-system_config--系统配置表)
   - [2.12 operation_log — 操作日志表](#212-operation_log--操作日志表)
3. [索引设计汇总](#3-索引设计汇总)
4. [实体关系图描述](#4-实体关系图描述)
5. [数据安全策略](#5-数据安全策略)

---

## 1. 数据库选型与设计原则

### 1.1 选型方案

| 组件 | 选型 | 版本 | 用途 |
|------|------|------|------|
| 关系型数据库 | MySQL | 8.0+ | 核心业务数据持久化（用户、测评、目标、实践等） |
| 缓存数据库 | Redis | 7.0+ | 会话管理、验证码缓存、热点数据加速、分布式锁 |

### 1.2 设计原则

1. **规范化（Normalization）**：遵循第三范式（3NF），消除数据冗余，保证数据一致性。
2. **字段设计**：主键统一使用 `BIGINT UNSIGNED` 自增 ID；时间字段统一使用 `DATETIME` 类型并存储 UTC 时间；金额/比例字段使用 `DECIMAL` 精确存储。
3. **软删除优先**：核心业务表优先使用 `status` 标记或 `deleted_at` 软删除，避免数据不可恢复。
4. **JSON 字段策略**：对于结构灵活、查询不频繁的字段（如测评报告、优势标签），使用 MySQL 原生 `JSON` 类型，兼顾灵活性与可查询性。
5. **分库分表预留**：所有表设计预留分片键（shard key）考量，`user_id` 作为最常用的分片维度。
6. **字符集**：统一使用 `utf8mb4`，排序规则 `utf8mb4_unicode_ci`，完整支持 emoji 与多语言。

---

## 2. 表结构设计

### 2.1 user — 用户表

**表说明**：存储所有注册用户的核心信息，包括身份认证、会员状态和个人资料。

| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `id` | `BIGINT UNSIGNED` | `PRIMARY KEY AUTO_INCREMENT` | — | 用户唯一标识 |
| `phone` | `VARCHAR(20)` | `NOT NULL, UNIQUE` | — | 手机号（加密存储） |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | — | bcrypt 密码哈希 |
| `nickname` | `VARCHAR(64)` | `NOT NULL` | `''` | 用户昵称 |
| `avatar` | `VARCHAR(512)` | `NULL` | `NULL` | 头像 URL |
| `member_level` | `TINYINT UNSIGNED` | `NOT NULL` | `0` | 会员等级：0=普通, 1=银卡, 2=金卡, 3=钻石 |
| `member_expire_at` | `DATETIME` | `NULL` | `NULL` | 会员到期时间 |
| `status` | `TINYINT UNSIGNED` | `NOT NULL` | `1` | 状态：0=禁用, 1=正常 |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | 注册时间 |
| `last_login_at` | `DATETIME` | `NULL` | `NULL` | 最后登录时间 |

**索引**：

| 索引名 | 类型 | 字段 | 说明 |
|--------|------|------|------|
| `PRIMARY` | 主键 | `id` | 聚簇索引 |
| `uk_phone` | 唯一索引 | `phone` | 手机号唯一校验 |
| `idx_status` | 普通索引 | `status` | 按状态筛选 |
| `idx_member_level` | 普通索引 | `member_level` | 按会员等级筛选 |
| `idx_created_at` | 普通索引 | `created_at` | 按注册时间排序 |
| `idx_member_expire` | 复合索引 | `(member_level, member_expire_at)` | 会员到期查询 |

```sql
CREATE TABLE `user` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `phone` VARCHAR(20) NOT NULL COMMENT '手机号（加密存储）',
    `password_hash` VARCHAR(255) NOT NULL COMMENT 'bcrypt密码哈希',
    `nickname` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '用户昵称',
    `avatar` VARCHAR(512) NULL COMMENT '头像URL',
    `member_level` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '会员等级：0=普通,1=银卡,2=金卡,3=钻石',
    `member_expire_at` DATETIME NULL COMMENT '会员到期时间',
    `status` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态：0=禁用,1=正常',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
    `last_login_at` DATETIME NULL COMMENT '最后登录时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_phone` (`phone`),
    KEY `idx_status` (`status`),
    KEY `idx_member_level` (`member_level`),
    KEY `idx_created_at` (`created_at`),
    KEY `idx_member_expire` (`member_level`, `member_expire_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';
```

---

### 2.2 assessment_question — 测评题目表

**表说明**：存储测评题库，涵盖天赋、技能、性格、价值观四大维度。支持分层难度和分类管理。

| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `id` | `BIGINT UNSIGNED` | `PRIMARY KEY AUTO_INCREMENT` | — | 题目唯一标识 |
| `type` | `VARCHAR(20)` | `NOT NULL` | — | 测评类型：talent / skill / character / value |
| `dimension` | `VARCHAR(64)` | `NOT NULL` | — | 所属维度（如"逻辑推理""沟通表达"） |
| `question_text` | `TEXT` | `NOT NULL` | — | 题目文本 |
| `options` | `JSON` | `NOT NULL` | — | 选项列表，格式：`[{"label":"A","text":"...","score":5},...]` |
| `score` | `INT` | `NOT NULL` | `0` | 题目满分值 |
| `difficulty` | `TINYINT UNSIGNED` | `NOT NULL` | `1` | 难度：1=简单, 2=中等, 3=困难 |
| `sort_order` | `INT UNSIGNED` | `NOT NULL` | `0` | 排序序号 |
| `status` | `TINYINT UNSIGNED` | `NOT NULL` | `1` | 状态：0=禁用, 1=启用 |

**索引**：

| 索引名 | 类型 | 字段 | 说明 |
|--------|------|------|------|
| `PRIMARY` | 主键 | `id` | 聚簇索引 |
| `idx_type_status` | 复合索引 | `(type, status)` | 按类型+状态查询 |
| `idx_dimension` | 普通索引 | `dimension` | 按维度筛选 |
| `idx_sort` | 复合索引 | `(type, sort_order)` | 按类型排序 |

```sql
CREATE TABLE `assessment_question` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '题目ID',
    `type` VARCHAR(20) NOT NULL COMMENT '测评类型：talent/skill/character/value',
    `dimension` VARCHAR(64) NOT NULL COMMENT '所属维度',
    `question_text` TEXT NOT NULL COMMENT '题目文本',
    `options` JSON NOT NULL COMMENT '选项列表JSON',
    `score` INT NOT NULL DEFAULT 0 COMMENT '题目满分',
    `difficulty` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '难度：1=简单,2=中等,3=困难',
    `sort_order` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '排序序号',
    `status` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态：0=禁用,1=启用',
    PRIMARY KEY (`id`),
    KEY `idx_type_status` (`type`, `status`),
    KEY `idx_dimension` (`dimension`),
    KEY `idx_sort` (`type`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='测评题目表';
```

---

### 2.3 assessment_result — 用户测评结果表

**表说明**：存储用户每次测评的完整结果，包括各维度得分、优势识别和完整报告。

| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `id` | `BIGINT UNSIGNED` | `PRIMARY KEY AUTO_INCREMENT` | — | 结果唯一标识 |
| `user_id` | `BIGINT UNSIGNED` | `NOT NULL` | — | 用户ID，外键关联 `user.id` |
| `assessment_type` | `VARCHAR(20)` | `NOT NULL` | — | 测评类型：quick / full / talent / skill / character / value |
| `scores` | `JSON` | `NOT NULL` | — | 各维度得分，格式：`{"逻辑推理":85,"沟通表达":72,...}` |
| `top_strengths` | `JSON` | `NOT NULL` | — | 排名靠前的优势项，格式：`["逻辑推理","创造力"]` |
| `full_report` | `JSON` | `NOT NULL` | — | 完整报告内容（含分析、建议等） |
| `duration` | `INT UNSIGNED` | `NOT NULL` | `0` | 答题耗时（秒） |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | 测评时间 |

**索引**：

| 索引名 | 类型 | 字段 | 说明 |
|--------|------|------|------|
| `PRIMARY` | 主键 | `id` | 聚簇索引 |
| `idx_user_type` | 复合索引 | `(user_id, assessment_type)` | 用户按类型查询测评记录 |
| `idx_user_created` | 复合索引 | `(user_id, created_at)` | 用户测评时间线 |

```sql
CREATE TABLE `assessment_result` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '结果ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `assessment_type` VARCHAR(20) NOT NULL COMMENT '测评类型：quick/full/talent/skill/character/value',
    `scores` JSON NOT NULL COMMENT '各维度得分JSON',
    `top_strengths` JSON NOT NULL COMMENT '优势项JSON',
    `full_report` JSON NOT NULL COMMENT '完整报告JSON',
    `duration` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '答题耗时（秒）',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '测评时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_type` (`user_id`, `assessment_type`),
    KEY `idx_user_created` (`user_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户测评结果表';
```

---

### 2.4 user_strength_profile — 优势画像表

**表说明**：存储用户经过 AI 分析后的综合优势画像，支持版本化管理。

| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `id` | `BIGINT UNSIGNED` | `PRIMARY KEY AUTO_INCREMENT` | — | 画像唯一标识 |
| `user_id` | `BIGINT UNSIGNED` | `NOT NULL` | — | 用户ID，外键关联 `user.id` |
| `profile_data` | `JSON` | `NOT NULL` | — | 完整画像数据（各维度分析、雷达图数据等） |
| `strength_tags` | `JSON` | `NOT NULL` | — | 优势标签列表，格式：`["逻辑思维","领导力","共情能力"]` |
| `version` | `INT UNSIGNED` | `NOT NULL` | `1` | 画像版本号 |
| `is_current` | `TINYINT(1)` | `NOT NULL` | `1` | 是否当前版本：0=历史, 1=当前 |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | 创建时间 |

**索引**：

| 索引名 | 类型 | 字段 | 说明 |
|--------|------|------|------|
| `PRIMARY` | 主键 | `id` | 聚簇索引 |
| `idx_user_current` | 复合索引 | `(user_id, is_current)` | 获取用户当前画像 |
| `idx_user_version` | 唯一索引 | `(user_id, version)` | 版本唯一约束 |

```sql
CREATE TABLE `user_strength_profile` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '画像ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `profile_data` JSON NOT NULL COMMENT '完整画像数据JSON',
    `strength_tags` JSON NOT NULL COMMENT '优势标签JSON',
    `version` INT UNSIGNED NOT NULL DEFAULT 1 COMMENT '画像版本号',
    `is_current` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否当前版本：0=历史,1=当前',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_current` (`user_id`, `is_current`),
    UNIQUE KEY `uk_user_version` (`user_id`, `version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='优势画像表';
```

---

### 2.5 growth_goal — 成长目标表

**表说明**：存储用户设定的个人成长目标，支持优先级、周期管理和进度跟踪。

| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `id` | `BIGINT UNSIGNED` | `PRIMARY KEY AUTO_INCREMENT` | — | 目标唯一标识 |
| `user_id` | `BIGINT UNSIGNED` | `NOT NULL` | — | 用户ID，外键关联 `user.id` |
| `name` | `VARCHAR(128)` | `NOT NULL` | — | 目标名称 |
| `description` | `TEXT` | `NULL` | `NULL` | 目标详细描述 |
| `category` | `VARCHAR(32)` | `NOT NULL` | — | 目标分类：talent / skill / character / value / custom |
| `priority` | `TINYINT UNSIGNED` | `NOT NULL` | `2` | 优先级：1=高, 2=中, 3=低 |
| `cycle` | `VARCHAR(16)` | `NOT NULL` | `'month'` | 周期：day / week / month / quarter / year |
| `expected_outcome` | `TEXT` | `NULL` | `NULL` | 期望成果描述 |
| `current_basis` | `TEXT` | `NULL` | `NULL` | 当前基础描述 |
| `status` | `TINYINT UNSIGNED` | `NOT NULL` | `1` | 状态：0=已取消, 1=进行中, 2=已完成 |
| `progress` | `DECIMAL(5,2)` | `NOT NULL` | `0.00` | 完成进度百分比（0.00 - 100.00） |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | 创建时间 |

**索引**：

| 索引名 | 类型 | 字段 | 说明 |
|--------|------|------|------|
| `PRIMARY` | 主键 | `id` | 聚簇索引 |
| `idx_user_status` | 复合索引 | `(user_id, status)` | 用户按状态查询目标 |
| `idx_user_category` | 复合索引 | `(user_id, category)` | 用户按分类查询目标 |
| `idx_user_priority` | 复合索引 | `(user_id, priority)` | 用户按优先级排序 |
| `idx_created_at` | 普通索引 | `created_at` | 按创建时间排序 |

```sql
CREATE TABLE `growth_goal` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '目标ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `name` VARCHAR(128) NOT NULL COMMENT '目标名称',
    `description` TEXT NULL COMMENT '目标详细描述',
    `category` VARCHAR(32) NOT NULL COMMENT '目标分类：talent/skill/character/value/custom',
    `priority` TINYINT UNSIGNED NOT NULL DEFAULT 2 COMMENT '优先级：1=高,2=中,3=低',
    `cycle` VARCHAR(16) NOT NULL DEFAULT 'month' COMMENT '周期：day/week/month/quarter/year',
    `expected_outcome` TEXT NULL COMMENT '期望成果',
    `current_basis` TEXT NULL COMMENT '当前基础',
    `status` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态：0=已取消,1=进行中,2=已完成',
    `progress` DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '完成进度百分比',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_status` (`user_id`, `status`),
    KEY `idx_user_category` (`user_id`, `category`),
    KEY `idx_user_priority` (`user_id`, `priority`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='成长目标表';
```

---

### 2.6 task_plan — 任务计划表

**表说明**：存储每个成长目标下的具体执行任务，支持里程碑和截止日期管理。

| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `id` | `BIGINT UNSIGNED` | `PRIMARY KEY AUTO_INCREMENT` | — | 任务唯一标识 |
| `goal_id` | `BIGINT UNSIGNED` | `NOT NULL` | — | 关联目标ID，外键关联 `growth_goal.id` |
| `user_id` | `BIGINT UNSIGNED` | `NOT NULL` | — | 用户ID，外键关联 `user.id` |
| `content` | `VARCHAR(512)` | `NOT NULL` | — | 任务内容 |
| `milestone` | `VARCHAR(128)` | `NULL` | `NULL` | 里程碑名称 |
| `due_date` | `DATE` | `NULL` | `NULL` | 截止日期 |
| `status` | `TINYINT UNSIGNED` | `NOT NULL` | `0` | 状态：0=待开始, 1=进行中, 2=已完成 |
| `completed_at` | `DATETIME` | `NULL` | `NULL` | 完成时间 |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | 创建时间 |

**索引**：

| 索引名 | 类型 | 字段 | 说明 |
|--------|------|------|------|
| `PRIMARY` | 主键 | `id` | 聚簇索引 |
| `idx_goal_status` | 复合索引 | `(goal_id, status)` | 按目标+状态查询任务 |
| `idx_user_status` | 复合索引 | `(user_id, status)` | 用户按状态查询任务 |
| `idx_due_date` | 普通索引 | `due_date` | 按截止日期排序 |
| `idx_user_goal` | 复合索引 | `(user_id, goal_id)` | 用户+目标联合查询 |

```sql
CREATE TABLE `task_plan` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '任务ID',
    `goal_id` BIGINT UNSIGNED NOT NULL COMMENT '关联目标ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `content` VARCHAR(512) NOT NULL COMMENT '任务内容',
    `milestone` VARCHAR(128) NULL COMMENT '里程碑名称',
    `due_date` DATE NULL COMMENT '截止日期',
    `status` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '状态：0=待开始,1=进行中,2=已完成',
    `completed_at` DATETIME NULL COMMENT '完成时间',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_goal_status` (`goal_id`, `status`),
    KEY `idx_user_status` (`user_id`, `status`),
    KEY `idx_due_date` (`due_date`),
    KEY `idx_user_goal` (`user_id`, `goal_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务计划表';
```

---

### 2.7 ai_chat_record — AI 对话记录表

**表说明**：存储用户与 AI 的对话记录，支持多会话、多场景分类和 Token 用量统计。

| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `id` | `BIGINT UNSIGNED` | `PRIMARY KEY AUTO_INCREMENT` | — | 记录唯一标识 |
| `user_id` | `BIGINT UNSIGNED` | `NOT NULL` | — | 用户ID，外键关联 `user.id` |
| `session_id` | `VARCHAR(64)` | `NOT NULL` | — | 会话ID（UUID） |
| `role` | `VARCHAR(16)` | `NOT NULL` | — | 角色：user / assistant / system |
| `content` | `TEXT` | `NOT NULL` | — | 消息内容 |
| `scene` | `VARCHAR(32)` | `NOT NULL` | `'general'` | 对话场景：general / assessment / growth / practice / coach |
| `token_used` | `INT UNSIGNED` | `NOT NULL` | `0` | 本次消息消耗 Token 数 |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | 创建时间 |

**索引**：

| 索引名 | 类型 | 字段 | 说明 |
|--------|------|------|------|
| `PRIMARY` | 主键 | `id` | 聚簇索引 |
| `idx_session` | 复合索引 | `(session_id, created_at)` | 会话消息时间线 |
| `idx_user_session` | 复合索引 | `(user_id, session_id)` | 用户会话列表 |
| `idx_user_scene` | 复合索引 | `(user_id, scene)` | 用户按场景查询 |
| `idx_created_at` | 普通索引 | `created_at` | 按时间排序 |

```sql
CREATE TABLE `ai_chat_record` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '记录ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `session_id` VARCHAR(64) NOT NULL COMMENT '会话ID',
    `role` VARCHAR(16) NOT NULL COMMENT '角色：user/assistant/system',
    `content` TEXT NOT NULL COMMENT '消息内容',
    `scene` VARCHAR(32) NOT NULL DEFAULT 'general' COMMENT '场景：general/assessment/growth/practice/coach',
    `token_used` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '消耗Token数',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_session` (`session_id`, `created_at`),
    KEY `idx_user_session` (`user_id`, `session_id`),
    KEY `idx_user_scene` (`user_id`, `scene`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI对话记录表';
```

---

### 2.8 practice_project — 实践项目表

**表说明**：存储系统预设的实践项目模板，用于用户成长实践推荐与匹配。

| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `id` | `BIGINT UNSIGNED` | `PRIMARY KEY AUTO_INCREMENT` | — | 项目唯一标识 |
| `name` | `VARCHAR(128)` | `NOT NULL` | — | 项目名称 |
| `category` | `VARCHAR(32)` | `NOT NULL` | — | 项目分类：talent / skill / character / value |
| `tags` | `JSON` | `NOT NULL` | — | 标签列表，格式：`["逻辑","分析","写作"]` |
| `match_strength` | `VARCHAR(64)` | `NULL` | `NULL` | 匹配的优势标签 |
| `content` | `TEXT` | `NOT NULL` | — | 项目内容描述 |
| `difficulty` | `TINYINT UNSIGNED` | `NOT NULL` | `1` | 难度：1=简单, 2=中等, 3=困难 |
| `duration` | `INT UNSIGNED` | `NOT NULL` | `0` | 预计完成时长（分钟） |
| `steps` | `JSON` | `NOT NULL` | — | 执行步骤，格式：`[{"order":1,"desc":"...","tip":"..."},...]` |
| `benefit` | `TEXT` | `NULL` | `NULL` | 收益说明 |
| `status` | `TINYINT UNSIGNED` | `NOT NULL` | `1` | 状态：0=禁用, 1=启用 |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | 创建时间 |

**索引**：

| 索引名 | 类型 | 字段 | 说明 |
|--------|------|------|------|
| `PRIMARY` | 主键 | `id` | 聚簇索引 |
| `idx_category_status` | 复合索引 | `(category, status)` | 按分类+状态查询 |
| `idx_difficulty` | 普通索引 | `difficulty` | 按难度筛选 |
| `idx_match_strength` | 普通索引 | `match_strength` | 按优势匹配查询 |

```sql
CREATE TABLE `practice_project` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '项目ID',
    `name` VARCHAR(128) NOT NULL COMMENT '项目名称',
    `category` VARCHAR(32) NOT NULL COMMENT '项目分类：talent/skill/character/value',
    `tags` JSON NOT NULL COMMENT '标签列表JSON',
    `match_strength` VARCHAR(64) NULL COMMENT '匹配优势标签',
    `content` TEXT NOT NULL COMMENT '项目内容描述',
    `difficulty` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '难度：1=简单,2=中等,3=困难',
    `duration` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '预计完成时长（分钟）',
    `steps` JSON NOT NULL COMMENT '执行步骤JSON',
    `benefit` TEXT NULL COMMENT '收益说明',
    `status` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态：0=禁用,1=启用',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_category_status` (`category`, `status`),
    KEY `idx_difficulty` (`difficulty`),
    KEY `idx_match_strength` (`match_strength`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='实践项目表';
```

---

### 2.9 user_practice — 用户实践记录表

**表说明**：存储用户完成实践项目后的打卡记录，支持图片上传和反思总结。

| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `id` | `BIGINT UNSIGNED` | `PRIMARY KEY AUTO_INCREMENT` | — | 记录唯一标识 |
| `user_id` | `BIGINT UNSIGNED` | `NOT NULL` | — | 用户ID，外键关联 `user.id` |
| `project_id` | `BIGINT UNSIGNED` | `NOT NULL` | — | 关联项目ID，外键关联 `practice_project.id` |
| `content` | `TEXT` | `NULL` | `NULL` | 用户填写的实践内容 |
| `images` | `JSON` | `NULL` | `NULL` | 上传图片URL列表，格式：`["url1","url2"]` |
| `reflection` | `TEXT` | `NULL` | `NULL` | 反思总结 |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | 打卡时间 |

**索引**：

| 索引名 | 类型 | 字段 | 说明 |
|--------|------|------|------|
| `PRIMARY` | 主键 | `id` | 聚簇索引 |
| `idx_user_project` | 复合索引 | `(user_id, project_id)` | 用户+项目联合查询 |
| `idx_user_created` | 复合索引 | `(user_id, created_at)` | 用户实践时间线 |
| `idx_project` | 普通索引 | `project_id` | 按项目查询记录 |

```sql
CREATE TABLE `user_practice` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '记录ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `project_id` BIGINT UNSIGNED NOT NULL COMMENT '关联项目ID',
    `content` TEXT NULL COMMENT '实践内容',
    `images` JSON NULL COMMENT '图片URL列表JSON',
    `reflection` TEXT NULL COMMENT '反思总结',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '打卡时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_project` (`user_id`, `project_id`),
    KEY `idx_user_created` (`user_id`, `created_at`),
    KEY `idx_project` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户实践记录表';
```

---

### 2.10 growth_archive — 成长档案表

**表说明**：存储用户成长历程中的关键事件摘要，形成时间线档案。

| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `id` | `BIGINT UNSIGNED` | `PRIMARY KEY AUTO_INCREMENT` | — | 档案唯一标识 |
| `user_id` | `BIGINT UNSIGNED` | `NOT NULL` | — | 用户ID，外键关联 `user.id` |
| `data_type` | `VARCHAR(32)` | `NOT NULL` | — | 数据类型：assessment / goal / task / practice / chat |
| `ref_id` | `BIGINT UNSIGNED` | `NOT NULL` | — | 关联源数据ID |
| `summary` | `TEXT` | `NOT NULL` | — | 事件摘要 |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | 归档时间 |

**索引**：

| 索引名 | 类型 | 字段 | 说明 |
|--------|------|------|------|
| `PRIMARY` | 主键 | `id` | 聚簇索引 |
| `idx_user_type` | 复合索引 | `(user_id, data_type)` | 用户按类型查询档案 |
| `idx_user_created` | 复合索引 | `(user_id, created_at)` | 用户档案时间线 |
| `idx_ref` | 普通索引 | `(data_type, ref_id)` | 按源数据定位 |

```sql
CREATE TABLE `growth_archive` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '档案ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `data_type` VARCHAR(32) NOT NULL COMMENT '数据类型：assessment/goal/task/practice/chat',
    `ref_id` BIGINT UNSIGNED NOT NULL COMMENT '关联源数据ID',
    `summary` TEXT NOT NULL COMMENT '事件摘要',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '归档时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_type` (`user_id`, `data_type`),
    KEY `idx_user_created` (`user_id`, `created_at`),
    KEY `idx_ref` (`data_type`, `ref_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='成长档案表';
```

---

### 2.11 system_config — 系统配置表

**表说明**：存储系统级配置项，支持动态配置管理和热更新。

| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `id` | `BIGINT UNSIGNED` | `PRIMARY KEY AUTO_INCREMENT` | — | 配置唯一标识 |
| `config_key` | `VARCHAR(64)` | `NOT NULL, UNIQUE` | — | 配置键名（如 `assessment.limits`、`ai.model_params`） |
| `config_value` | `JSON` | `NOT NULL` | — | 配置值（JSON 格式） |
| `description` | `VARCHAR(256)` | `NULL` | `NULL` | 配置说明 |
| `updated_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` | 最后更新时间 |

**索引**：

| 索引名 | 类型 | 字段 | 说明 |
|--------|------|------|------|
| `PRIMARY` | 主键 | `id` | 聚簇索引 |
| `uk_config_key` | 唯一索引 | `config_key` | 配置键唯一约束 |

```sql
CREATE TABLE `system_config` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '配置ID',
    `config_key` VARCHAR(64) NOT NULL COMMENT '配置键名',
    `config_value` JSON NOT NULL COMMENT '配置值JSON',
    `description` VARCHAR(256) NULL COMMENT '配置说明',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';
```

---

### 2.12 operation_log — 操作日志表

**表说明**：记录系统关键操作，用于审计、安全追溯和数据分析。

| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `id` | `BIGINT UNSIGNED` | `PRIMARY KEY AUTO_INCREMENT` | — | 日志唯一标识 |
| `user_id` | `BIGINT UNSIGNED` | `NULL` | `NULL` | 操作用户ID，外键关联 `user.id`（系统操作可为空） |
| `operation_type` | `VARCHAR(32)` | `NOT NULL` | — | 操作类型：login / register / assessment / goal / task / practice / admin |
| `content` | `TEXT` | `NOT NULL` | — | 操作内容描述 |
| `ip_address` | `VARCHAR(45)` | `NULL` | `NULL` | 客户端IP地址（IPv4/IPv6） |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | 操作时间 |

**索引**：

| 索引名 | 类型 | 字段 | 说明 |
|--------|------|------|------|
| `PRIMARY` | 主键 | `id` | 聚簇索引 |
| `idx_user_type` | 复合索引 | `(user_id, operation_type)` | 用户按操作类型查询 |
| `idx_created_at` | 普通索引 | `created_at` | 按时间排序 |
| `idx_type` | 普通索引 | `operation_type` | 按操作类型筛选 |

```sql
CREATE TABLE `operation_log` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
    `user_id` BIGINT UNSIGNED NULL COMMENT '操作用户ID',
    `operation_type` VARCHAR(32) NOT NULL COMMENT '操作类型',
    `content` TEXT NOT NULL COMMENT '操作内容',
    `ip_address` VARCHAR(45) NULL COMMENT '客户端IP地址',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_type` (`user_id`, `operation_type`),
    KEY `idx_created_at` (`created_at`),
    KEY `idx_type` (`operation_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';
```

---

## 3. 索引设计汇总

| 表名 | 主键 | 唯一索引 | 普通/复合索引 |
|------|------|----------|----------------|
| `user` | `id` | `uk_phone (phone)` | `idx_status`, `idx_member_level`, `idx_created_at`, `idx_member_expire (member_level, member_expire_at)` |
| `assessment_question` | `id` | — | `idx_type_status (type, status)`, `idx_dimension`, `idx_sort (type, sort_order)` |
| `assessment_result` | `id` | — | `idx_user_type (user_id, assessment_type)`, `idx_user_created (user_id, created_at)` |
| `user_strength_profile` | `id` | `uk_user_version (user_id, version)` | `idx_user_current (user_id, is_current)` |
| `growth_goal` | `id` | — | `idx_user_status (user_id, status)`, `idx_user_category (user_id, category)`, `idx_user_priority (user_id, priority)`, `idx_created_at` |
| `task_plan` | `id` | — | `idx_goal_status (goal_id, status)`, `idx_user_status (user_id, status)`, `idx_due_date`, `idx_user_goal (user_id, goal_id)` |
| `ai_chat_record` | `id` | — | `idx_session (session_id, created_at)`, `idx_user_session (user_id, session_id)`, `idx_user_scene (user_id, scene)`, `idx_created_at` |
| `practice_project` | `id` | — | `idx_category_status (category, status)`, `idx_difficulty`, `idx_match_strength` |
| `user_practice` | `id` | — | `idx_user_project (user_id, project_id)`, `idx_user_created (user_id, created_at)`, `idx_project` |
| `growth_archive` | `id` | — | `idx_user_type (user_id, data_type)`, `idx_user_created (user_id, created_at)`, `idx_ref (data_type, ref_id)` |
| `system_config` | `id` | `uk_config_key (config_key)` | — |
| `operation_log` | `id` | — | `idx_user_type (user_id, operation_type)`, `idx_created_at`, `idx_type` |

### 索引设计原则

1. **高频查询优先**：`user_id` 作为最高频查询条件，几乎所有表都围绕 `user_id` 建立复合索引。
2. **最左前缀匹配**：复合索引字段顺序遵循等值查询在前、范围查询在后的原则。
3. **覆盖索引**：对于高频回表查询场景，考虑在复合索引中包含查询所需的所有列。
4. **避免过度索引**：每张表索引数量控制在 3-5 个，写入密集型表（如 `operation_log`、`ai_chat_record`）进一步精简。
5. **定期分析**：通过 `EXPLAIN` 和慢查询日志持续优化索引策略。

---

## 4. 实体关系图描述

### 4.1 核心实体关系

```
┌──────────────────────────────────────────────────────────────────────┐
│                            user (用户)                                │
│  核心实体，所有业务围绕用户展开                                          │
└──────┬──────────┬──────────┬──────────┬──────────┬───────────────────┘
       │          │          │          │          │
       │ 1:N      │ 1:1      │ 1:N      │ 1:N      │ 1:N
       ▼          ▼          ▼          ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
│assessment│ │strength_ │ │ growth_  │ │ai_chat_  │ │ user_practice│
│_result   │ │profile   │ │ goal     │ │record    │ │              │
└──────────┘ └──────────┘ └────┬─────┘ └──────────┘ └──────┬───────┘
                               │                            │
                               │ 1:N                        │ N:1
                               ▼                            ▼
                          ┌──────────┐              ┌──────────────────┐
                          │ task_plan│              │ practice_project │
                          └──────────┘              └──────────────────┘
```

### 4.2 关系说明

| 关系 | 类型 | 说明 |
|------|------|------|
| `user` → `assessment_result` | 一对多 | 一个用户可有多次测评记录 |
| `user` → `user_strength_profile` | 一对一（当前） | 一个用户只有一个当前有效画像（`is_current=1`），历史版本为一对多 |
| `user` → `growth_goal` | 一对多 | 一个用户可设定多个成长目标 |
| `growth_goal` → `task_plan` | 一对多 | 一个目标可拆解为多个任务 |
| `user` → `ai_chat_record` | 一对多 | 一个用户可有多条对话记录 |
| `user` → `user_practice` | 一对多 | 一个用户可有多条实践记录 |
| `practice_project` → `user_practice` | 一对多 | 一个项目可被多个用户实践 |
| `user` → `growth_archive` | 一对多 | 一个用户可有多条成长档案 |
| `user` → `operation_log` | 一对多 | 一个用户可有多条操作日志 |
| `system_config` | 独立实体 | 系统级配置，不与用户直接关联 |

### 4.3 跨表数据流

```
用户注册 → user
    │
    ├─ 完成测评 → assessment_result → AI分析 → user_strength_profile
    │                                              │
    │                                              ▼
    ├─ 设定目标 → growth_goal → 拆解任务 → task_plan
    │                                              │
    │                                              ▼
    ├─ 实践项目 → user_practice ← practice_project
    │       │
    │       ▼
    └─ AI对话 → ai_chat_record
                │
                ▼
           growth_archive（汇总归档）
                │
                ▼
           operation_log（审计追溯）
```

---

## 5. 数据安全策略

### 5.1 密码安全

- **哈希算法**：使用 `bcrypt` 算法对密码进行单向哈希，cost factor 设置为 12。
- **存储**：仅存储 `password_hash`，永远不存储明文密码。
- **验证**：登录时使用 `bcrypt.compare()` 进行哈希比对，不做反向解密。
- **密码策略**：密码长度至少 8 位，必须包含字母和数字。

### 5.2 敏感数据加密

| 数据类型 | 加密方式 | 说明 |
|----------|----------|------|
| 手机号（`phone`） | AES-256-GCM 应用层加密 | 存储前加密，读取时解密；密钥通过环境变量注入，不存入代码仓库 |
| 密码哈希（`password_hash`） | bcrypt（单向） | 不可逆，无法还原 |
| IP 地址（`ip_address`） | 脱敏存储 | 仅保留前两段，如 `192.168.*.*` |
| AI 对话内容（`content`） | AES-256-GCM 应用层加密（可选） | 高敏感场景下启用，默认明文存储 |

### 5.3 数据传输安全

- 全站强制 HTTPS，使用 TLS 1.3。
- API 接口使用 JWT（JSON Web Token）进行身份认证，Token 有效期 2 小时，刷新 Token 有效期 7 天。
- 敏感接口（登录、注册）增加频率限制（Rate Limiting），单 IP 每分钟最多 10 次请求。

### 5.4 数据库访问控制

- **最小权限原则**：应用账号仅授予 `SELECT`、`INSERT`、`UPDATE`、`DELETE` 权限，不授予 `DROP`、`ALTER`、`TRUNCATE` 等 DDL 权限。
- **读写分离**：主库负责写入，从库负责查询，应用层根据操作类型路由数据源。
- **网络隔离**：数据库仅允许应用服务器内网 IP 访问，禁止公网直连。
- **审计日志**：数据库开启通用查询日志（General Log）和慢查询日志，`operation_log` 表记录应用层操作审计。

### 5.5 备份与恢复

| 策略 | 频率 | 保留周期 |
|------|------|----------|
| 全量备份 | 每天凌晨 3:00（UTC+8） | 30 天 |
| 增量备份（binlog） | 实时 | 7 天 |
| 异地备份 | 每天（全量备份完成后） | 30 天 |
| 恢复演练 | 每月一次 | — |

恢复目标：
- **RPO（Recovery Point Objective）**：< 1 小时（binlog 实时同步）
- **RTO（Recovery Time Objective）**：< 2 小时

### 5.6 数据生命周期管理

| 数据类别 | 保留策略 | 清理方式 |
|----------|----------|----------|
| 操作日志（`operation_log`） | 保留 6 个月 | 定时任务按月归档到冷存储，超过保留期物理删除 |
| AI 对话记录（`ai_chat_record`） | 保留 1 年 | 超过 1 年的数据归档到对象存储，按需清理 |
| 用户数据（`user` 及相关） | 用户注销后保留 30 天 | 30 天后执行物理删除（GDPR 合规） |
| 测评结果（`assessment_result`） | 永久保留 | 作为用户成长基线数据，不主动删除 |

---

> **文档维护**：本文档由后端团队维护，数据库 Schema 变更时需同步更新本文档。  
> **审核流程**：Schema 变更需经过技术负责人 Review 后方可执行 DDL。