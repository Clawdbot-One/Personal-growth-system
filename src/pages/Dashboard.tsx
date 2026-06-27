import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Flame,
  Clock,
  CheckCircle2,
  Compass,
  ArrowRight,
  Sparkles,
  Quote,
  TrendingUp,
} from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { useGoalStore } from "@/store/goalStore";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { TaskItem } from "@/components/growth/TaskItem";
import { MiniSparkline } from "@/components/charts/MiniSparkline";
import { EmptyState } from "@/components/ui/EmptyState";
import { fetchRecommendedPractices } from "@/services/userService";
import { PRACTICE_CATEGORY_LABELS, formatMinutes, cn } from "@/lib/utils";
import type { PracticeProject } from "@/types";
import { useState } from "react";

export default function Dashboard() {
  const { user, profile, quote, overview, loading, loadAll } = useUserStore();
  const { goals, todayTasks, loadGoals, loadTodayTasks, completeTask } = useGoalStore();
  const [practices, setPractices] = useState<PracticeProject[]>([]);

  useEffect(() => {
    loadAll();
    loadGoals();
    loadTodayTasks();
    fetchRecommendedPractices().then(setPractices);
  }, [loadAll, loadGoals, loadTodayTasks]);

  if (loading && !user) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" rounded="lg" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 欢迎区 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-hero text-white p-6 sm:p-8">
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-accent-500/30 blur-2xl" />
        <div className="absolute top-6 right-6 opacity-20 hidden sm:block">
          <Sparkles className="h-24 w-24" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 text-xs bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full">
              <Flame className="h-3 w-3 text-accent-300" />
              连续成长 {user?.streakDays ?? 0} 天
            </span>
            {user?.memberLevel === "free" && (
              <span className="text-xs bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full">
                免费版
              </span>
            )}
          </div>
          <h1 className="font-serif-cn text-2xl sm:text-3xl font-semibold mb-1">
            你好，{user?.nickname} 👋
          </h1>
          <p className="text-sm sm:text-base text-white/80 max-w-lg">{user?.bio}</p>

          {quote && (
            <div className="mt-5 inline-flex items-start gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 max-w-lg">
              <Quote className="h-4 w-4 text-accent-300 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-serif-cn italic">{quote.text}</p>
                <p className="text-[11px] text-white/60 mt-0.5">— {quote.author}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 数据概览 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="累计成长"
          value={formatMinutes(overview?.totalGrowthMinutes ?? 0)}
          color="primary"
          sparkline={[20, 35, 28, 45, 50, 68, 75]}
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="完成任务"
          value={`${overview?.completedTasksCount ?? 0} 项`}
          color="mint"
          sparkline={[5, 8, 6, 10, 12, 15, 18]}
        />
        <StatCard
          icon={<Compass className="h-4 w-4" />}
          label="测评次数"
          value={`${overview?.assessmentCount ?? 0} 次`}
          color="accent"
          sparkline={[1, 1, 2, 2, 3, 3, 3]}
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="优势强化"
          value={`${overview?.strengthProgress ?? 0}%`}
          color="amber"
          sparkline={[55, 60, 62, 68, 72, 78, 82]}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 今日待办 */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <SectionTitle
              title="今日待办"
              subtitle={`${todayTasks.length} 项任务等待你的推进`}
              icon={<CheckCircle2 className="h-5 w-5" />}
              action={
                <Link to="/growth">
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    全部目标
                  </Button>
                </Link>
              }
            />
            {todayTasks.length === 0 ? (
              <EmptyState
                title="今日任务已清空"
                description="保持节奏，或前往成长路径规划下一阶段任务。"
                action={
                  <Link to="/growth">
                    <Button size="sm" variant="outline">查看目标</Button>
                  </Link>
                }
              />
            ) : (
              <div className="space-y-2">
                {todayTasks.map((task) => {
                  const goal = goals.find((g) =>
                    g.milestones.some((m) => m.tasks.some((t) => t.id === task.id))
                  );
                  return (
                    <TaskItem
                      key={task.id}
                      task={task}
                      goalTitle={goal?.title}
                      goalCategory={goal?.category}
                      onToggle={completeTask}
                    />
                  );
                })}
              </div>
            )}
          </Card>

          {/* 推荐实践 */}
          <Card>
            <SectionTitle
              title="为你推荐"
              subtitle="基于你的优势画像匹配的实践项目"
              icon={<Sparkles className="h-5 w-5" />}
              action={
                <Link to="/practice">
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    更多
                  </Button>
                </Link>
              }
            />
            <div className="space-y-3">
              {practices.map((p) => (
                <Link
                  key={p.id}
                  to={`/practice/${p.id}`}
                  className="block group rounded-xl p-3 border border-ink-100 dark:border-ink-800 hover:border-primary-200 hover:shadow-soft transition-all"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm text-ink-800 dark:text-ink-100 truncate group-hover:text-primary-600">
                          {p.title}
                        </h4>
                        <Badge color="primary">{p.matchScore}% 适配</Badge>
                      </div>
                      <p className="text-xs text-ink-500 mt-0.5">
                        {PRACTICE_CATEGORY_LABELS[p.category]} · {formatMinutes(p.estimatedMinutes)}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-ink-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        {/* 右侧：优势概览 + AI 入口 */}
        <div className="space-y-4">
          {profile && (
            <Card>
              <SectionTitle
                title="我的优势"
                subtitle={`v${profile.version} · ${new Date(profile.generatedAt).toLocaleDateString("zh-CN")}`}
                icon={<Compass className="h-5 w-5" />}
                action={
                  <Link to="/assessment/report/ar_003">
                    <Button variant="ghost" size="sm">查看</Button>
                  </Link>
                }
              />
              <div className="space-y-2.5">
                {profile.topStrengths.slice(0, 3).map((s, i) => (
                  <div key={s.name} className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700 text-xs font-semibold dark:bg-primary-900/30 dark:text-primary-300">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-ink-700 dark:text-ink-200 flex-1 truncate">
                      {s.name}
                    </span>
                    <span className="font-display text-sm font-semibold text-primary-600">
                      {s.score}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="bg-gradient-cool dark:bg-ink-800 border-primary-100 dark:border-primary-900/30">
            <div className="text-center py-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-hero text-white shadow-glow mb-3">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-serif-cn text-base font-semibold text-ink-800 dark:text-ink-100 mb-1">
                有成长困惑？
              </h3>
              <p className="text-xs text-ink-600 dark:text-ink-400 mb-3">
                让优伴 AI 帮你拆解、复盘、答疑
              </p>
              <Link to="/ai-companion">
                <Button size="sm" className="w-full">开始对话</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "primary" | "accent" | "mint" | "amber";
  sparkline: number[];
}

function StatCard({ icon, label, value, color, sparkline }: StatCardProps) {
  const colorMap = {
    primary: { bg: "bg-primary-50 dark:bg-primary-900/20", text: "text-primary-600", spark: "#2563EB" },
    accent: { bg: "bg-accent-50 dark:bg-accent-900/20", text: "text-accent-600", spark: "#F97316" },
    mint: { bg: "bg-mint-50 dark:bg-mint-500/10", text: "text-mint-600", spark: "#10B981" },
    amber: { bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-600", spark: "#F59E0B" },
  };
  const c = colorMap[color];
  return (
    <Card className="p-4" padded={false}>
      <div className="flex items-center justify-between mb-2">
        <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-lg", c.bg, c.text)}>
          {icon}
        </span>
        <MiniSparkline data={sparkline} color={c.spark} width={48} height={20} />
      </div>
      <div className="font-display text-xl sm:text-2xl font-semibold text-ink-800 dark:text-ink-100">
        {value}
      </div>
      <div className="text-xs text-ink-500 mt-0.5">{label}</div>
    </Card>
  );
}
