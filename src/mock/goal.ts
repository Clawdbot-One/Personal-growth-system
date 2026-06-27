import type { GrowthGoal, Task } from "@/types";

const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const iso = (d: Date) => d.toISOString();
const addDays = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return iso(d);
};

export const mockGoals: GrowthGoal[] = [
  {
    id: "g_001",
    userId: "u_001",
    title: "转型产品经理：从设计到产品策略",
    description:
      "在 12 周内完成从资深设计师到产品经理的能力迁移，重点补齐商业洞察与数据决策能力，同时放大战略思维与结构化表达优势。",
    category: "career",
    expectedPeriodWeeks: 12,
    expectedOutcome:
      "独立负责一个产品模块的 0-1 规划；输出 3 份产品策略文档；拿到内部转岗机会",
    currentBaseline: "5 年设计经验，懂用户与体验，缺商业与数据视角",
    priority: 1,
    status: "active",
    progress: 42,
    createdAt: "2026-05-20T09:00:00.000Z",
    milestones: [
      {
        id: "m_001",
        goalId: "g_001",
        title: "阶段一：建立产品认知地图",
        acceptanceCriteria: "完成 2 本核心书目 + 3 个产品拆解 + 1 张知识图谱",
        order: 1,
        status: "completed",
        tasks: [
          {
            id: "t_001",
            milestoneId: "m_001",
            userId: "u_001",
            content: "阅读《启示录》并输出 5 条产品思维原则",
            granularity: "week",
            dueDate: addDays(-21),
            status: "completed",
            completedAt: addDays(-22),
            estimatedMinutes: 240,
          },
          {
            id: "t_002",
            milestoneId: "m_001",
            userId: "u_001",
            content: "拆解 3 个 SaaS 产品的商业模型",
            granularity: "week",
            dueDate: addDays(-14),
            status: "completed",
            completedAt: addDays(-15),
            estimatedMinutes: 360,
          },
        ],
      },
      {
        id: "m_002",
        goalId: "g_001",
        title: "阶段二：补齐数据与商业视角",
        acceptanceCriteria: "完成数据分析基础 + 输出 1 份产品策略文档",
        order: 2,
        status: "in-progress",
        tasks: [
          {
            id: "t_003",
            milestoneId: "m_002",
            userId: "u_001",
            content: "学习 SQL 基础与漏斗分析（课程 3 小时）",
            granularity: "week",
            dueDate: addDays(-2),
            status: "completed",
            completedAt: addDays(-3),
            estimatedMinutes: 180,
          },
          {
            id: "t_004",
            milestoneId: "m_002",
            userId: "u_001",
            content: "为现有产品模块输出一份增长假设与实验设计",
            granularity: "week",
            dueDate: addDays(0),
            status: "pending",
            estimatedMinutes: 120,
            isToday: true,
          },
          {
            id: "t_005",
            milestoneId: "m_002",
            userId: "u_001",
            content: "与产品 mentor 进行 1 次策略对谈",
            granularity: "week",
            dueDate: addDays(2),
            status: "pending",
            estimatedMinutes: 60,
            isToday: true,
          },
        ],
      },
      {
        id: "m_003",
        goalId: "g_001",
        title: "阶段三：实战项目独立交付",
        acceptanceCriteria: "负责一个产品模块 0-1 规划并通过评审",
        order: 3,
        status: "pending",
        tasks: [
          {
            id: "t_006",
            milestoneId: "m_003",
            userId: "u_001",
            content: "选定实战模块并完成需求调研",
            granularity: "month",
            dueDate: addDays(14),
            status: "pending",
            estimatedMinutes: 300,
          },
          {
            id: "t_007",
            milestoneId: "m_003",
            userId: "u_001",
            content: "输出 PRD v1 并组织评审",
            granularity: "month",
            dueDate: addDays(28),
            status: "pending",
            estimatedMinutes: 480,
          },
        ],
      },
    ],
  },
  {
    id: "g_002",
    userId: "u_001",
    title: "建立每周深度内容输出习惯",
    description: "通过每周一篇深度长文，固化方法论沉淀，放大结构化表达优势。",
    category: "habit",
    expectedPeriodWeeks: 8,
    expectedOutcome: "8 篇深度文章 + 1000 关注者 + 形成个人方法论 v1",
    currentBaseline: "断断续续输出，缺乏节奏与主题聚焦",
    priority: 2,
    status: "active",
    progress: 25,
    createdAt: "2026-06-01T09:00:00.000Z",
    milestones: [
      {
        id: "m_101",
        goalId: "g_002",
        title: "确定主题矩阵与写作节奏",
        acceptanceCriteria: "完成 4 周连续输出 + 主题地图",
        order: 1,
        status: "in-progress",
        tasks: [
          {
            id: "t_101",
            milestoneId: "m_101",
            userId: "u_001",
            content: "本周输出：我的产品思维迁移笔记（2000 字）",
            granularity: "week",
            dueDate: addDays(0),
            status: "pending",
            estimatedMinutes: 180,
            isToday: true,
          },
          {
            id: "t_102",
            milestoneId: "m_101",
            userId: "u_001",
            content: "梳理 4 个核心主题并建立素材库",
            granularity: "week",
            dueDate: addDays(3),
            status: "pending",
            estimatedMinutes: 90,
          },
        ],
      },
    ],
  },
  {
    id: "g_003",
    userId: "u_001",
    title: "副业探索：优势教练陪练服务",
    description: "测试 \"优势挖掘陪练\" 作为副业方向的可行性与商业模式。",
    category: "side-project",
    expectedPeriodWeeks: 16,
    expectedOutcome: "服务 5 位付费用户 + 验证定价 + 输出标准化流程",
    currentBaseline: "有方法论与共情优势，缺获客与服务标准化经验",
    priority: 3,
    status: "active",
    progress: 12,
    createdAt: "2026-06-10T09:00:00.000Z",
    milestones: [
      {
        id: "m_201",
        goalId: "g_003",
        title: "MVP 服务流程设计",
        acceptanceCriteria: "完成服务卡片 + 流程 SOP + 首位用户体验",
        order: 1,
        status: "pending",
        tasks: [
          {
            id: "t_201",
            milestoneId: "m_201",
            userId: "u_001",
            content: "设计陪练服务卡片与定价",
            granularity: "week",
            dueDate: addDays(5),
            status: "pending",
            estimatedMinutes: 120,
          },
        ],
      },
    ],
  },
];

export function getTodayTasks(): Task[] {
  const tasks: Task[] = [];
  mockGoals.forEach((g) => {
    g.milestones.forEach((m) => {
      m.tasks.forEach((t) => {
        if (t.isToday || (t.status === "pending" && new Date(t.dueDate) <= today)) {
          tasks.push({ ...t, isToday: true });
        }
      });
    });
  });
  return tasks;
}

export function getGoalById(id: string): GrowthGoal | undefined {
  return mockGoals.find((g) => g.id === id);
}
