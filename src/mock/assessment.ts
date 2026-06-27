import type { AssessmentQuestion, AssessmentResult, AssessmentMode } from "@/types";

// ============ 题库（按模式分组） ============

const quickQuestions: AssessmentQuestion[] = [
  {
    id: "q_q1",
    mode: "quick",
    type: "scale",
    dimension: "talent",
    stem: "面对一个全新的复杂问题，我更倾向于先：",
    options: [
      { label: "快速收集信息建立全局图景", value: 5 },
      { label: "找有经验的人请教", value: 3 },
      { label: "直接动手试错再调整", value: 2 },
      { label: "等想清楚再行动", value: 4 },
    ],
    difficulty: 1,
    order: 1,
  },
  {
    id: "q_q2",
    mode: "quick",
    type: "scale",
    dimension: "personality",
    stem: "在团队中，我常被需要的角色是：",
    options: [
      { label: "想清楚方向的策划者", value: 5 },
      { label: "推动落地的执行者", value: 3 },
      { label: "协调关系的连接者", value: 4 },
      { label: "深钻细节的专家", value: 2 },
    ],
    difficulty: 1,
    order: 2,
  },
  {
    id: "q_q3",
    mode: "quick",
    type: "scale",
    dimension: "skill",
    stem: "学习一个新技能时，我吸收最快的方式是：",
    options: [
      { label: "看完整体框架再深入", value: 5 },
      { label: "边做边学，遇到再查", value: 3 },
      { label: "找系统课程跟练", value: 4 },
      { label: "教别人一遍就懂了", value: 4 },
    ],
    difficulty: 2,
    order: 3,
  },
  {
    id: "q_q4",
    mode: "quick",
    type: "scale",
    dimension: "values",
    stem: "面对一份待遇更好但价值不符的机会，我会：",
    options: [
      { label: "果断拒绝", value: 5 },
      { label: "评估后再决定", value: 3 },
      { label: "先试试再说", value: 2 },
      { label: "看是否能为后续目标服务", value: 4 },
    ],
    difficulty: 2,
    order: 4,
  },
  {
    id: "q_q5",
    mode: "quick",
    type: "scale",
    dimension: "talent",
    stem: "我最近一次进入 \"心流\" 状态是在做什么类型的事？",
    options: [
      { label: "梳理复杂信息 / 做规划", value: 5 },
      { label: "深度创作 / 表达", value: 4 },
      { label: "与人深度交流 / 帮助他人", value: 4 },
      { label: "完成具体任务 / 攻克难题", value: 3 },
    ],
    difficulty: 2,
    order: 5,
  },
];

const professionalQuestions: AssessmentQuestion[] = [
  ...quickQuestions.map((q) => ({ ...q, mode: "professional" as const })),
  {
    id: "q_p6",
    mode: "professional",
    type: "scale",
    dimension: "skill",
    stem: "当需要把一个模糊想法传达给他人时，我通常：",
    options: [
      { label: "先画框架图或列表", value: 5 },
      { label: "用类比讲故事", value: 4 },
      { label: "直接口头解释", value: 2 },
      { label: "写下来再发出去", value: 4 },
    ],
    difficulty: 2,
    order: 6,
  },
  {
    id: "q_p7",
    mode: "professional",
    type: "scale",
    dimension: "personality",
    stem: "团队遇到冲突时，我最自然的反应是：",
    options: [
      { label: "先理解双方立场再调解", value: 5 },
      { label: "推动尽快达成结论", value: 3 },
      { label: "回避直接冲突", value: 2 },
      { label: "用规则 / 框架重新组织讨论", value: 4 },
    ],
    difficulty: 2,
    order: 7,
  },
  {
    id: "q_p8",
    mode: "professional",
    type: "scale",
    dimension: "values",
    stem: "我最希望自己的工作能够：",
    options: [
      { label: "对他人产生持续正向影响", value: 5 },
      { label: "推动行业或领域向前", value: 4 },
      { label: "获得专业认可与成就", value: 3 },
      { label: "提供自由与稳定的生活", value: 3 },
    ],
    difficulty: 2,
    order: 8,
  },
  {
    id: "q_p9",
    mode: "professional",
    type: "scale",
    dimension: "talent",
    stem: "我对 \"未完成的事\" 的态度是：",
    options: [
      { label: "容易停留在思考阶段", value: 4 },
      { label: "会持续推动直到完成", value: 5 },
      { label: "看是否值得继续投入", value: 3 },
      { label: "会被情绪影响推进", value: 2 },
    ],
    difficulty: 3,
    order: 9,
  },
  {
    id: "q_p10",
    mode: "professional",
    type: "scale",
    dimension: "skill",
    stem: "复盘一次经历时，我最常做的事：",
    options: [
      { label: "提炼方法论或框架", value: 5 },
      { label: "记录情绪与感受", value: 3 },
      { label: "列待办与改进项", value: 4 },
      { label: "与他人讨论求证", value: 3 },
    ],
    difficulty: 2,
    order: 10,
  },
];

const interviewScript = [
  "你好，我是你的优伴 AI 访谈员。接下来我会通过 10-15 个关键事件问题，帮你从过往经历中挖掘潜在优势。请尽量用具体故事回答，不要担心语无伦次，我会帮你梳理。",
  "第一个问题：回想过去一年，哪一件事让你在做的过程中感觉 \"毫不费力却效果不错\"？请描述具体场景。",
  "听起来你在 \"信息整合\" 上很敏锐。再深入一步：当时你是怎么从混乱信息里看出关键模式的？",
  "很好。换一个角度：有没有哪类任务，你做完后总是能量更高、更想再来一次？",
  "我注意到你多次提到 \"帮别人想清楚\"——这种角色在你过去 3 年里出现频率多高？",
];

export function getQuestionsByMode(mode: AssessmentMode): AssessmentQuestion[] {
  if (mode === "quick") return quickQuestions;
  if (mode === "professional") return professionalQuestions;
  return []; // interview 走对话脚本
}

export function getInterviewScript(): string[] {
  return interviewScript;
}

// ============ 历史测评结果 ============
export const mockAssessmentHistory: AssessmentResult[] = [
  {
    id: "ar_001",
    userId: "u_001",
    mode: "professional",
    dimensions: { talent: 78, skill: 62, personality: 70, values: 82 },
    topStrengths: [],
    blindSpots: ["执行力偶有波动", "细节耐心不足"],
    recommendedDirections: ["产品策略方向", "用户研究"],
    durationSeconds: 920,
    createdAt: "2026-03-15T10:20:00.000Z",
  },
  {
    id: "ar_002",
    userId: "u_001",
    mode: "quick",
    dimensions: { talent: 80, skill: 65, personality: 72, values: 85 },
    topStrengths: [],
    blindSpots: ["执行力偶有波动"],
    recommendedDirections: ["产品策略方向"],
    durationSeconds: 280,
    createdAt: "2026-05-02T14:10:00.000Z",
  },
  {
    id: "ar_003",
    userId: "u_001",
    mode: "professional",
    dimensions: { talent: 82, skill: 68, personality: 75, values: 88 },
    topStrengths: [],
    blindSpots: ["执行力偶有波动", "细节耐心不足", "情绪劳动恢复不足"],
    recommendedDirections: [
      "产品策略 / 解决方案架构方向",
      "用户研究与体验设计",
      "知识内容创作者 / 教练型角色",
    ],
    durationSeconds: 1020,
    createdAt: "2026-06-12T08:30:00.000Z",
  },
];

// ============ 模式元数据 ============
export const ASSESSMENT_MODES: {
  key: AssessmentMode;
  name: string;
  subtitle: string;
  duration: string;
  questionCount: string;
  output: string;
  recommended?: boolean;
  premium?: boolean;
  features: string[];
}[] = [
  {
    key: "quick",
    name: "快速精简版",
    subtitle: "5 分钟建立优势基础认知",
    duration: "约 5 分钟",
    questionCount: "20 道选择题",
    output: "基础优势概览",
    features: ["四维雷达图", "TOP3 优势速览", "基础方向建议"],
  },
  {
    key: "professional",
    name: "专业完整版",
    subtitle: "15 分钟生成完整优势画像",
    duration: "约 15 分钟",
    questionCount: "60 道分层测评题",
    output: "完整优势报告",
    recommended: true,
    features: ["四维雷达图", "TOP5 核心优势解读", "盲区与成长提示", "适配方向推荐", "PDF 报告导出"],
  },
  {
    key: "interview",
    name: "深度访谈版",
    subtitle: "AI 对话式动态挖掘",
    duration: "约 20 分钟",
    questionCount: "10-15 个关键事件追问",
    output: "深度访谈报告",
    premium: true,
    features: ["AI 实时访谈", "行为模式挖掘", "潜在优势识别", "专属深度报告"],
  },
];
