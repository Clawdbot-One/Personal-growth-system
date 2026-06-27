import { Check, Crown, Sparkles, Zap, Infinity as InfinityIcon, FileText } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/lib/utils";

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: { text: string; included: boolean }[];
  cta: string;
  highlight?: boolean;
  icon: typeof Crown;
}

const plans: Plan[] = [
  {
    name: "免费版",
    price: "¥0",
    period: "永久免费",
    description: "适合初次体验优势成长",
    icon: Sparkles,
    features: [
      { text: "快速精简版测评", included: true },
      { text: "基础优势报告", included: true },
      { text: "1 个成长目标", included: true },
      { text: "AI 对话每日 10 次", included: true },
      { text: "实践库基础访问", included: true },
      { text: "专业完整版测评", included: false },
      { text: "深度访谈版测评", included: false },
      { text: "PDF 报告导出", included: false },
      { text: "无限 AI 对话", included: false },
    ],
    cta: "当前方案",
  },
  {
    name: "Pro 月度",
    price: "¥29",
    period: "/ 月",
    description: "解锁全部高级能力",
    icon: Crown,
    highlight: true,
    features: [
      { text: "全部三种测评模式", included: true },
      { text: "完整可视化报告", included: true },
      { text: "无限成长目标", included: true },
      { text: "无限 AI 对话", included: true },
      { text: "实践库全量访问", included: true },
      { text: "PDF 报告导出", included: true },
      { text: "专属 AI 模型（升级版）", included: true },
      { text: "深度复盘引导", included: true },
      { text: "优先客服支持", included: true },
    ],
    cta: "立即升级",
  },
  {
    name: "Pro 年度",
    price: "¥288",
    period: "/ 年",
    description: "立省 ¥60，相当于 8 折",
    icon: Zap,
    features: [
      { text: "包含 Pro 月度全部权益", included: true },
      { text: "专属成长教练 1v1（季度 1 次）", included: true },
      { text: "B 端企业人才报告", included: true },
      { text: "API 接口调用额度", included: true },
      { text: "优先体验新功能", included: true },
      { text: "团队协作（5 席位）", included: true },
    ],
    cta: "选择年度",
  },
];

const benefits = [
  { icon: InfinityIcon, title: "无限 AI 对话", desc: "不设次数上限，随时陪伴你的成长" },
  { icon: FileText, title: "深度报告导出", desc: "高清长图、PDF 文件，一键分享至社交平台" },
  { icon: Sparkles, title: "深度访谈版", desc: "AI 对话式动态挖掘潜在优势" },
  { icon: Crown, title: "专属模型", desc: "升级版 AI 模型，回答更精准、更深入" },
];

export default function Membership() {
  const { user } = useUserStore();

  return (
    <div className="space-y-6 pb-12">
      {/* 头部 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-hero text-white p-6 sm:p-8">
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-accent-500/30 blur-3xl" />
        <div className="relative">
          <Badge color="amber" size="md" className="mb-3 bg-white/15 text-amber-300">
            <Crown className="h-3 w-3" /> 优伴 Pro
          </Badge>
          <h1 className="font-serif-cn text-2xl sm:text-3xl font-semibold mb-2">
            解锁深度成长，释放优势全部潜能
          </h1>
          <p className="text-sm text-white/80 max-w-xl">
            从免费版到 Pro，解锁深度访谈版测评、无限 AI 对话与高级报告导出。
            让你的优势成长不止于「知道」，更走向「做到」。
          </p>
        </div>
      </div>

      {/* 核心权益 */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {benefits.map((b) => {
          const Icon = b.icon;
          return (
            <Card key={b.title} className="text-center">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-cool dark:bg-ink-800 text-primary-600 mb-2">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-medium text-sm text-ink-800 dark:text-ink-100">{b.title}</h3>
              <p className="text-xs text-ink-500 mt-1">{b.desc}</p>
            </Card>
          );
        })}
      </div>

      {/* 价格方案 */}
      <div className="grid lg:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = plan.name === "免费版" && user?.memberLevel === "free";
          return (
            <Card
              key={plan.name}
              className={cn(
                "relative flex flex-col",
                plan.highlight && "ring-2 ring-primary-400 shadow-lift"
              )}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge color="primary" size="md">推荐</Badge>
                </div>
              )}

              <div className="flex items-center gap-2 mb-3">
                <div
                  className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center",
                    plan.highlight
                      ? "bg-gradient-hero text-white shadow-glow"
                      : "bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-serif-cn text-lg font-semibold text-ink-800 dark:text-ink-100">
                  {plan.name}
                </h3>
              </div>

              <p className="text-xs text-ink-500 mb-3">{plan.description}</p>

              <div className="flex items-baseline gap-1 mb-4">
                <span className="font-display text-3xl font-bold text-ink-800 dark:text-ink-100">
                  {plan.price}
                </span>
                <span className="text-xs text-ink-500">{plan.period}</span>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f, i) => (
                  <li
                    key={i}
                    className={cn(
                      "flex items-start gap-2 text-xs",
                      f.included ? "text-ink-700 dark:text-ink-200" : "text-ink-400 dark:text-ink-600"
                    )}
                  >
                    {f.included ? (
                      <Check className="h-3.5 w-3.5 text-mint-500 mt-0.5 shrink-0" />
                    ) : (
                      <span className="h-3.5 w-3.5 mt-0.5 shrink-0 flex items-center justify-center text-ink-300">
                        ×
                      </span>
                    )}
                    <span className={cn(!f.included && "line-through")}>{f.text}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.highlight ? "primary" : "outline"}
                className="w-full"
                disabled={isCurrent}
                onClick={() => !isCurrent && alert(`演示：${plan.name} 升级流程`)}
              >
                {isCurrent ? "当前方案" : plan.cta}
              </Button>
            </Card>
          );
        })}
      </div>

      {/* 积分体系 */}
      <Card>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="font-serif-cn text-lg font-semibold text-ink-800 dark:text-ink-100">
              成长积分体系
            </h2>
            <p className="text-xs text-ink-500 mt-0.5">通过持续行动累积积分，兑换权益或服务</p>
          </div>
          <Badge color="amber" size="md">{user?.points ?? 0} 积分</Badge>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <PointsRow action="完成每日任务" points="+5" />
          <PointsRow action="完成一次实践打卡" points="+20" />
          <PointsRow action="完成一次完整测评" points="+50" />
          <PointsRow action="连续 7 天成长" points="+100" />
          <PointsRow action="完成阶段里程碑" points="+200" />
          <PointsRow action="推荐好友加入" points="+500" />
        </div>
      </Card>

      {/* FAQ */}
      <Card>
        <h2 className="font-serif-cn text-lg font-semibold text-ink-800 dark:text-ink-100 mb-3">
          常见问题
        </h2>
        <div className="space-y-3">
          {[
            { q: "升级后可以退款吗？", a: "支持 7 天无理由退款，未使用的会员时长可全额退回。" },
            { q: "免费版的数据会保留吗？", a: "升级后所有测评、目标、对话记录完整保留，无缝衔接。" },
            { q: "年度方案可以取消吗？", a: "可随时取消自动续费，已支付时长继续生效至周期结束。" },
          ].map((item, i) => (
            <div key={i} className="rounded-xl bg-ink-50 dark:bg-ink-800 p-3">
              <div className="text-sm font-medium text-ink-800 dark:text-ink-100 mb-0.5">
                Q: {item.q}
              </div>
              <div className="text-xs text-ink-600 dark:text-ink-300">A: {item.a}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function PointsRow({ action, points }: { action: string; points: string }) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg bg-ink-50 dark:bg-ink-800">
      <span className="text-xs text-ink-600 dark:text-ink-300">{action}</span>
      <Badge color="amber" size="sm">{points}</Badge>
    </div>
  );
}
