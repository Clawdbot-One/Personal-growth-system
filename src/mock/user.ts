import type { User, StrengthProfile, DailyQuote } from "@/types";

export const mockUser: User = {
  id: "u_001",
  phone: "138****6789",
  email: "youbai@example.com",
  nickname: "林深",
  avatar: "",
  bio: "正在从设计转向产品方向 · 探索属于自己的成长节奏",
  memberLevel: "free",
  createdAt: "2026-03-12T09:20:00.000Z",
  lastLoginAt: new Date().toISOString(),
  streakDays: 23,
  totalGrowthMinutes: 1840,
  points: 628,
};

export const mockProfile: StrengthProfile = {
  userId: "u_001",
  version: 3,
  isCurrent: true,
  dimensions: {
    talent: 82,
    skill: 68,
    personality: 75,
    values: 88,
  },
  topStrengths: [
    {
      name: "战略思维",
      score: 88,
      category: "talent",
      definition: "善于在复杂信息中识别关键模式，梳理出长远方向与可行路径。",
      behaviors: [
        "面对选择时倾向于先看全局再决策",
        "习惯用框架和模型整理零散信息",
        "在团队中常扮演 \"想清楚再动手\" 的角色",
      ],
      scenarios: ["职业方向选择", "项目目标拆解", "中长期规划"],
      suggestions: [
        "将战略思维应用于副业探索，先定位再行动",
        "搭配 \"执行力\" 型伙伴互补推进",
        "警惕想得多做得少，给思考设截止时间",
      ],
    },
    {
      name: "学习敏锐度",
      score: 84,
      category: "talent",
      definition: "对新领域知识的吸收速度与跨场景迁移能力突出。",
      behaviors: [
        "进入新领域时能在 2 周内建立完整知识地图",
        "喜欢用类比与第一性原理解构陌生概念",
        "复盘时习惯提炼可复用的方法论",
      ],
      scenarios: ["跨岗位转型", "新技能习得", "复杂问题研究"],
      suggestions: [
        "为每个学习目标建立 \"输入-处理-输出\" 闭环",
        "把已有方法论主动迁移到新场景巩固",
        "通过教别人加速理解深度",
      ],
    },
    {
      name: "共情连接",
      score: 79,
      category: "personality",
      definition: "能快速感知他人情绪与需求，建立信任型关系。",
      behaviors: [
        "对话中善于倾听与镜像回应",
        "在冲突中能同时理解双方立场",
        "常被朋友作为倾诉对象",
      ],
      scenarios: ["团队协作", "用户访谈", "客户关系维护"],
      suggestions: [
        "在共情后增加 \"结构化总结\" 环节避免淹没",
        "为情绪劳动设立恢复机制",
        "把共情转化为产品洞察，放大价值",
      ],
    },
    {
      name: "价值驱动",
      score: 88,
      category: "values",
      definition: "以内在价值观为决策锚点，长期主义取向明显。",
      behaviors: [
        "面对短期利益时会权衡长期意义",
        "拒绝不符合价值观的诱惑",
        "愿意为认同的使命投入更多",
      ],
      scenarios: ["职业选择", "项目取舍", "合作筛选"],
      suggestions: [
        "把价值观显性化为可执行的标准",
        "在团队中主动表达价值取向吸引同频",
        "警惕过度的价值洁癖，区分底线与偏好",
      ],
    },
    {
      name: "结构化表达",
      score: 72,
      category: "skill",
      definition: "能把复杂信息组织成清晰、有说服力的表达结构。",
      behaviors: [
        "口头与书面表达常有 \"总-分-总\" 框架",
        "善于用金字塔原理组织内容",
        "汇报时重点突出、节奏清晰",
      ],
      scenarios: ["方案汇报", "内容创作", "知识沉淀"],
      suggestions: [
        "持续刻意练习 \"3 分钟讲清一件事\"",
        "学习故事化表达，增强感染力",
        "把表达沉淀为可复用模板",
      ],
    },
  ],
  blindSpots: [
    "执行力偶有波动，长战略容易停在思考阶段",
    "对细节打磨耐心不足，影响交付完整度",
    "情绪劳动较多时缺少主动恢复机制",
  ],
  recommendedDirections: [
    "产品策略 / 解决方案架构方向",
    "用户研究与体验设计",
    "知识内容创作者 / 教练型角色",
    "面向 B 端的咨询与顾问",
  ],
  generatedAt: "2026-06-12T08:30:00.000Z",
};

export const mockDailyQuotes: DailyQuote[] = [
  { text: "真正的成长，是把天赋磨成可以反复使用的能力。", author: "优伴 AI" },
  { text: "不要用短板丈量自己，用长板定义方向。", author: "盖洛普优势理念" },
  { text: "今天的微小行动，是未来你回头看时的关键节点。", author: "詹姆斯·克利尔" },
  { text: "成长不是修正缺点，而是放大优势到不可替代。", author: "彼得·德鲁克" },
  { text: "把节奏放慢一点，把方向看清楚一点。", author: "优伴 AI" },
  { text: "你不需要变成别人，你需要变成更完整的自己。", author: "卡尔·罗杰斯" },
];

export function getDailyQuote(): DailyQuote {
  const day = new Date().getDate();
  return mockDailyQuotes[day % mockDailyQuotes.length];
}
