import type { ChatContext, ChatMessage } from "@/types";

// ============ 快捷指令 ============
export const QUICK_COMMANDS: { label: string; prompt: string; context: ChatContext }[] = [
  { label: "解读我的优势", prompt: "帮我解读一下我当前的优势画像，并告诉我如何在日常工作中放大它们。", context: "assessment" },
  { label: "拆解一个目标", prompt: "我想 3 个月内学会用 AI 做内容创作，帮我拆解成可执行的成长路径。", context: "planning" },
  { label: "本周复盘", prompt: "带我做一次本周复盘，帮我看看哪些做得好、哪些可以调整。", context: "review" },
  { label: "缓解成长焦虑", prompt: "最近总感觉自己进步太慢，有些焦虑，能和我聊聊吗？", context: "emotion" },
  { label: "讲解 SMART 原则", prompt: "用通俗的话讲讲什么是 SMART 原则，怎么用在目标设定上？", context: "knowledge" },
];

// ============ AI 关键词回复规则 ============
interface ReplyRule {
  keywords: string[];
  context: ChatContext;
  // 模板支持占位符 {strength1} {strength2} {goal1}
  reply: string;
}

const userStrengthsShort = "战略思维、学习敏锐度与共情连接";
const userGoalShort = "转型产品经理并建立每周深度输出习惯";

const replyRules: ReplyRule[] = [
  {
    keywords: ["优势", "画像", "强项", "擅长", "天赋"],
    context: "assessment",
    reply: `我看了你最近一次测评结果，你的核心优势集中在 ${userStrengthsShort}。\n\n这几个优势组合很有意思——你既能想清楚方向，又能快速吸收新知识，还能在对话中捕捉他人需求。这种组合非常适合做「产品策略 + 用户研究」类工作。\n\n建议你在日常中这样放大它们：\n1. 在做决策前，先用框架梳理（发挥战略思维）\n2. 每周固定时间输入新领域知识（发挥学习敏锐度）\n3. 在团队中主动承担用户访谈与对齐角色（发挥共情连接）\n\n你希望我针对哪一项给出更具体的练习方案吗？`,
  },
  {
    keywords: ["拆解", "计划", "路径", "目标", "怎么", "规划"],
    context: "planning",
    reply: `好的，基于你的优势画像和当前目标「${userGoalShort}」，我用 SMART 框架帮你拆解。\n\n**3 个月总目标**：完成能力迁移 + 沉淀 12 篇深度内容\n\n**里程碑拆解**：\n• M1（第 1-4 周）：建立认知地图 → 阅读 2 本书 + 拆解 3 个产品\n• M2（第 5-8 周）：补齐数据视角 → 学完 SQL 基础 + 输出 1 份增长假设\n• M3（第 9-12 周）：实战交付 → 负责 1 个模块 0-1 + 通过评审\n\n**本周可执行任务**（建议 3 项以内）：\n1. 周一-周三：完成《启示录》第 1-5 章阅读并输出 5 条原则\n2. 周四-周五：选 1 个熟悉产品写 1 页商业模型拆解\n3. 周末：与产品 mentor 约一次 30 分钟策略对谈\n\n需要我帮你把任务排进日历，还是先调整某个阶段的颗粒度？`,
  },
  {
    keywords: ["复盘", "回顾", "总结", "本周", "这周"],
    context: "review",
    reply: `我们用 GROW 模型做一次本周复盘，我会分 5 步引导你。\n\n**第 1 步：Goal 回顾目标**\n本周你为自己设定的核心目标是什么？完成了哪些？\n\n（你可以用一两句话回答，我会继续追问，不用担心结构化。）`,
  },
  {
    keywords: ["焦虑", "焦虑", "压力", "慢", "怀疑", "挫败", "情绪", "内耗"],
    context: "emotion",
    reply: `先停一下，深呼吸。你愿意说出来本身就是一种觉察力。\n\n我能感受到你的焦虑——感觉进步慢、看不到反馈时，这种情绪很正常。它不等于你做错了什么，更多是节奏与外部信号的不匹配。\n\n我们换个视角看：你过去 23 天连续成长、累计 1840 分钟，这本身就是一个稳态在形成的信号。优势成长不是冲刺，是马拉松。\n\n你能告诉我，最近哪一件事让你最有「没进展」的感觉吗？我们一起把它拆开看看。`,
  },
  {
    keywords: ["smart", "原则", "什么是", "解释", "方法", "模型"],
    context: "knowledge",
    reply: `SMART 是目标设定的经典框架，5 个字母分别代表：\n\n• **S**pecific 具体的 —— 目标要清晰可描述\n• **M**easurable 可衡量的 —— 有明确数字或标志\n• **A**chievable 可达成的 —— 跳一跳够得着\n• **R**elevant 相关的 —— 与长期方向一致\n• **T**ime-bound 有时限的 —— 设明确截止时间\n\n举个例子：\n❌ 「我要学会产品经理」→ 太模糊\n✅ 「3 个月内独立负责 1 个产品模块的 0-1 规划，通过评审」→ SMART\n\n你希望我用 SMART 帮你重写一个当前的目标吗？`,
  },
];

const defaultReply = `我是你的优伴 AI，可以在以下方面帮你：\n\n• **优势解读**：帮你理解测评结果，找到放大优势的方式\n• **路径拆解**：把模糊目标拆成可执行的行动清单\n• **复盘引导**：通过 GROW 模型带你看清进展与卡点\n• **情绪疏导**：成长焦虑时陪你梳理节奏\n• **方法科普**：SMART / GROW / 费曼等工具讲解\n\n你可以直接告诉我你想聊什么，或点击下方快捷指令开始。`;

export function matchReply(userInput: string): { reply: string; context: ChatContext } {
  const input = userInput.toLowerCase();
  for (const rule of replyRules) {
    if (rule.keywords.some((k) => input.includes(k.toLowerCase()))) {
      return { reply: rule.reply, context: rule.context };
    }
  }
  return { reply: defaultReply, context: "general" };
}

// ============ 欢迎消息 ============
export const welcomeMessages: ChatMessage[] = [
  {
    id: "msg_welcome_1",
    sessionId: "s_default",
    role: "ai",
    content: `你好，林深 👋\n\n我是你的优伴 AI 成长助手。我看过你 6 月 12 日的最新优势画像——你的核心优势是 ${userStrengthsShort}，当前正在推进「${userGoalShort}」。\n\n有什么想聊的？比如帮你解读优势、拆解一个具体目标，或者做一次本周复盘。`,
    context: "general",
    tokens: 0,
    createdAt: new Date(Date.now() - 60_000).toISOString(),
  },
];

// ============ 复盘引导问题序列 ============
export const reviewQuestions = [
  "本周你为自己设定的核心目标是什么？完成了哪些？",
  "本周哪一件事情让你感觉最在状态？具体发生了什么？",
  "本周遇到的最大卡点是什么？是能力问题、资源问题，还是节奏问题？",
  "如果重新来一次，你会做哪一个不同的选择？",
  "本周你有哪些关于自己优势的新发现？",
  "下周你打算保留哪一项节奏、调整哪一项？",
  "用一句话总结本周的成长。",
];
