// 优伴 AI · 核心类型定义

// ============ 用户与画像 ============
export type MemberLevel = "free" | "premium";

export interface User {
  id: string;
  phone: string;
  email?: string;
  nickname: string;
  avatar: string;
  bio: string;
  memberLevel: MemberLevel;
  createdAt: string;
  lastLoginAt: string;
  streakDays: number; // 连续成长天数
  totalGrowthMinutes: number;
  points: number; // 成长积分
}

export type DimensionKey = "talent" | "skill" | "personality" | "values";

export interface StrengthDimensions {
  talent: number; // 天赋优势 0-100
  skill: number; // 技能优势
  personality: number; // 性格特质
  values: number; // 价值取向
}

export interface Strength {
  name: string;
  score: number;
  category: DimensionKey;
  definition: string;
  behaviors: string[];
  scenarios: string[];
  suggestions: string[];
}

export interface StrengthProfile {
  userId: string;
  version: number;
  isCurrent: boolean;
  dimensions: StrengthDimensions;
  topStrengths: Strength[];
  blindSpots: string[];
  recommendedDirections: string[];
  generatedAt: string;
}

// ============ 测评 ============
export type AssessmentMode = "quick" | "professional" | "interview";
export type QuestionType = "single" | "scale" | "open";
export type DimensionLabel = "天赋" | "技能" | "性格" | "价值观";

export interface AssessmentQuestion {
  id: string;
  mode: AssessmentMode;
  type: QuestionType;
  dimension: DimensionKey;
  stem: string;
  options?: { label: string; value: number }[];
  difficulty: 1 | 2 | 3;
  order: number;
}

export interface AssessmentResult {
  id: string;
  userId: string;
  mode: AssessmentMode;
  dimensions: StrengthDimensions;
  topStrengths: Strength[];
  blindSpots: string[];
  recommendedDirections: string[];
  durationSeconds: number;
  createdAt: string;
}

export interface AssessmentProgress {
  mode: AssessmentMode;
  currentIndex: number;
  answers: Record<string, number | string>;
  startedAt: number;
  updatedAt: number;
}

// ============ 目标与任务 ============
export type GoalStatus = "active" | "completed" | "paused" | "abandoned";
export type GoalCategory =
  | "career"
  | "skill"
  | "side-project"
  | "self-cognition"
  | "habit";

export interface GrowthGoal {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: GoalCategory;
  expectedPeriodWeeks: number;
  expectedOutcome: string;
  currentBaseline: string;
  priority: 1 | 2 | 3;
  status: GoalStatus;
  milestones: Milestone[];
  progress: number; // 0-100
  createdAt: string;
}

export type MilestoneStatus = "pending" | "in-progress" | "completed";

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  acceptanceCriteria: string;
  order: number;
  status: MilestoneStatus;
  tasks: Task[];
}

export type TaskGranularity = "month" | "week" | "day";
export type TaskStatus = "pending" | "completed" | "overdue";

export interface Task {
  id: string;
  milestoneId: string;
  userId: string;
  content: string;
  granularity: TaskGranularity;
  dueDate: string;
  status: TaskStatus;
  completedAt?: string;
  estimatedMinutes: number;
  isToday?: boolean;
}

// ============ AI 对话 ============
export type ChatRole = "user" | "ai";
export type ChatContext =
  | "general"
  | "assessment"
  | "planning"
  | "review"
  | "emotion"
  | "knowledge";

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: ChatRole;
  content: string;
  context?: ChatContext;
  tokens?: number;
  createdAt: string;
  highlighted?: boolean;
}

// ============ 实践 ============
export type PracticeCategory =
  | "workplace"
  | "side-project"
  | "skill"
  | "project"
  | "habit";

export interface PracticeProject {
  id: string;
  title: string;
  category: PracticeCategory;
  tags: string[];
  suitableStrengths: string[];
  description: string;
  steps: string[];
  skillPoints: string[];
  outcomeStandard: string;
  difficulty: 1 | 2 | 3;
  estimatedMinutes: number;
  matchScore?: number;
  isPublished: boolean;
  checkInsCount: number;
}

export interface PracticeCheckIn {
  id: string;
  userId: string;
  projectId: string;
  content: string;
  images: string[];
  reflection: string;
  isPublic: boolean;
  createdAt: string;
}

// ============ 成长档案 ============
export type ArchiveType = "assessment" | "task" | "review" | "practice" | "milestone";

export interface ArchiveEntry {
  id: string;
  userId: string;
  type: ArchiveType;
  refId: string;
  title: string;
  summary: string;
  createdAt: string;
}

// ============ 通用 ============
export interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}

export interface DailyQuote {
  text: string;
  author: string;
}
