import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Compass,
  Target,
  BookOpen,
  Sparkles,
  TrendingUp,
  Award,
} from "lucide-react";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LineChart } from "@/components/charts/LineChart";
import { EmptyState } from "@/components/ui/EmptyState";
import { mockAssessmentHistory } from "@/mock/assessment";
import { mockGoals } from "@/mock/goal";
import { mockPractices } from "@/mock/practice";
import { formatDate, DIMENSION_LABELS, DIMENSION_COLORS, GOAL_CATEGORY_LABELS, PRACTICE_CATEGORY_LABELS, cn } from "@/lib/utils";
import type { ArchiveType } from "@/types";

interface ArchiveItem {
  id: string;
  type: ArchiveType;
  title: string;
  summary: string;
  date: string;
  ref?: string;
}

const typeConfig: Record<ArchiveType, { label: string; color: "primary" | "accent" | "mint" | "amber"; icon: typeof Compass }> = {
  assessment: { label: "测评", color: "primary", icon: Compass },
  task: { label: "任务", color: "mint", icon: Target },
  review: { label: "复盘", color: "amber", icon: Sparkles },
  practice: { label: "实践", color: "accent", icon: BookOpen },
  milestone: { label: "里程碑", color: "primary", icon: Award },
};

const filters: { value: ArchiveType | "all"; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "assessment", label: "测评" },
  { value: "task", label: "任务" },
  { value: "practice", label: "实践" },
  { value: "review", label: "复盘" },
];

export default function GrowthArchive() {
  const [filter, setFilter] = useState<ArchiveType | "all">("all");

  // 构建档案时间线
  const archives: ArchiveItem[] = [
    ...mockAssessmentHistory.map((r) => ({
      id: r.id,
      type: "assessment" as const,
      title: `${r.mode === "quick" ? "快速精简版" : r.mode === "professional" ? "专业完整版" : "深度访谈版"}测评`,
      summary: `天赋 ${r.dimensions.talent} · 技能 ${r.dimensions.skill} · 性格 ${r.dimensions.personality} · 价值观 ${r.dimensions.values}`,
      date: r.createdAt,
      ref: `/assessment/report/${r.id}`,
    })),
    ...mockGoals.flatMap((g) =>
      g.milestones
        .filter((m) => m.status === "completed")
        .map((m) => ({
          id: m.id,
          type: "milestone" as const,
          title: `完成里程碑：${m.title}`,
          summary: `目标「${g.title}」· ${GOAL_CATEGORY_LABELS[g.category]}`,
          date: new Date(new Date(g.createdAt).getTime() + 14 * 24 * 3600 * 1000).toISOString(),
          ref: `/growth/${g.id}`,
        }))
    ),
    ...mockGoals.flatMap((g) =>
      g.milestones.flatMap((m) =>
        m.tasks
          .filter((t) => t.status === "completed")
          .map((t) => ({
            id: t.id,
            type: "task" as const,
            title: t.content,
            summary: `目标「${g.title}」· ${GOAL_CATEGORY_LABELS[g.category]}`,
            date: t.completedAt ?? t.dueDate,
            ref: `/growth/${g.id}`,
          }))
      )
    ),
    ...mockPractices.slice(0, 2).map((p, i) => ({
      id: `practice_${p.id}`,
      type: "practice" as const,
      title: `完成实践：${p.title}`,
      summary: `${PRACTICE_CATEGORY_LABELS[p.category]} · ${p.tags.slice(0, 2).join(" / ")}`,
      date: new Date(Date.now() - (i + 1) * 3 * 24 * 3600 * 1000).toISOString(),
      ref: `/practice/${p.id}`,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filtered = filter === "all" ? archives : archives.filter((a) => a.type === filter);

  // 能力变化曲线数据
  const abilityTrend = mockAssessmentHistory.map((r) => ({
    label: formatDate(r.createdAt, "MM-DD"),
    value: Math.round((r.dimensions.talent + r.dimensions.skill + r.dimensions.personality + r.dimensions.values) / 4),
  }));

  // 任务完成趋势
  const taskTrend = [
    { label: "W1", value: 8 },
    { label: "W2", value: 12 },
    { label: "W3", value: 10 },
    { label: "W4", value: 15 },
    { label: "W5", value: 18 },
    { label: "W6", value: 22 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-cn text-2xl font-semibold text-ink-800 dark:text-ink-100 mb-1">
          成长档案
        </h1>
        <p className="text-sm text-ink-500">
          全周期成长记录 · 数据可视化 · 轨迹回溯
        </p>
      </div>

      {/* 数据可视化 */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <SectionTitle
            title="综合能力变化"
            subtitle="近 3 个月测评平均分趋势"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <LineChart data={abilityTrend} height={180} color="#2563EB" />
          <div className="mt-3 pt-3 border-t border-ink-100 dark:border-ink-800 flex items-center justify-between text-xs">
            <span className="text-ink-500">起点：{abilityTrend[0]?.value ?? 0} 分</span>
            <span className="text-ink-500">最新：{abilityTrend[abilityTrend.length - 1]?.value ?? 0} 分</span>
            <Badge color="mint" size="sm">
              ↑ +{(abilityTrend[abilityTrend.length - 1]?.value ?? 0) - (abilityTrend[0]?.value ?? 0)}
            </Badge>
          </div>
        </Card>

        <Card>
          <SectionTitle
            title="任务完成趋势"
            subtitle="最近 6 周完成任务数"
            icon={<Target className="h-5 w-5" />}
          />
          <LineChart data={taskTrend} height={180} color="#F97316" />
          <div className="mt-3 pt-3 border-t border-ink-100 dark:border-ink-800 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="font-display text-base font-semibold text-ink-800 dark:text-ink-100">
                {taskTrend.reduce((a, b) => a + b.value, 0)}
              </div>
              <div className="text-[10px] text-ink-500">累计完成</div>
            </div>
            <div>
              <div className="font-display text-base font-semibold text-ink-800 dark:text-ink-100">
                {Math.round(taskTrend.reduce((a, b) => a + b.value, 0) / taskTrend.length)}
              </div>
              <div className="text-[10px] text-ink-500">周均完成</div>
            </div>
            <div>
              <div className="font-display text-base font-semibold text-mint-600">↑ 175%</div>
              <div className="text-[10px] text-ink-500">增长率</div>
            </div>
          </div>
        </Card>
      </div>

      {/* 维度雷达对比（简化版） */}
      <Card>
        <SectionTitle
          title="优势维度变化"
          subtitle="对比历史测评，看优势强化进度"
          icon={<Compass className="h-5 w-5" />}
        />
        <div className="space-y-3">
          {(["talent", "skill", "personality", "values"] as const).map((dim) => {
            const history = mockAssessmentHistory.map((r) => r.dimensions[dim]);
            const first = history[0];
            const last = history[history.length - 1];
            const delta = last - first;
            return (
              <div key={dim} className="flex items-center gap-3">
                <span className="text-xs text-ink-600 dark:text-ink-300 w-16 shrink-0">
                  {DIMENSION_LABELS[dim]}
                </span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden relative">
                    <div
                      className="absolute h-full rounded-full opacity-30"
                      style={{ width: `${first}%`, background: DIMENSION_COLORS[dim] }}
                    />
                    <div
                      className="relative h-full rounded-full transition-all duration-1000"
                      style={{ width: `${last}%`, background: DIMENSION_COLORS[dim] }}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-xs font-semibold w-12 text-right",
                      delta >= 0 ? "text-mint-600" : "text-red-500"
                    )}
                  >
                    {delta >= 0 ? "+" : ""}{delta}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 时间线 */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="font-serif-cn text-lg font-semibold text-ink-800 dark:text-ink-100">
            成长时间线
          </h2>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                  filter === f.value
                    ? "bg-primary-600 text-white shadow-soft"
                    : "bg-white dark:bg-ink-900 text-ink-600 dark:text-ink-300 border border-ink-100 dark:border-ink-800 hover:border-primary-200"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="该维度暂无记录" description="切换其他筛选条件查看" />
        ) : (
          <Card padded={false} className="overflow-hidden">
            <div className="relative">
              <div className="absolute left-[19px] top-4 bottom-4 w-px bg-ink-200 dark:bg-ink-700" />
              <div className="divide-y divide-ink-100 dark:divide-ink-800">
                {filtered.map((item) => {
                  const config = typeConfig[item.type];
                  const Icon = config.icon;
                  return (
                    <div key={item.id} className="relative flex items-start gap-3 p-4 hover:bg-ink-50/50 dark:hover:bg-ink-800/30 transition-colors">
                      <div
                        className={cn(
                          "relative z-10 h-10 w-10 shrink-0 rounded-xl flex items-center justify-center border-2 border-white dark:border-ink-900 shadow-soft",
                          config.color === "primary" && "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300",
                          config.color === "accent" && "bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300",
                          config.color === "mint" && "bg-mint-100 text-mint-600 dark:bg-mint-500/15 dark:text-mint-500",
                          config.color === "amber" && "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-500"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <Badge color={config.color} size="sm">{config.label}</Badge>
                          <span className="text-[11px] text-ink-500">{formatDate(item.date, "YYYY-MM-DD")}</span>
                        </div>
                        <div className="text-sm font-medium text-ink-800 dark:text-ink-100 line-clamp-1">
                          {item.title}
                        </div>
                        <p className="text-xs text-ink-500 mt-0.5 line-clamp-1">{item.summary}</p>
                      </div>
                      {item.ref && (
                        <Link
                          to={item.ref}
                          className="shrink-0 text-xs text-primary-600 hover:underline self-center"
                        >
                          查看 →
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
