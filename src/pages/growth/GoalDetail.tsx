import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Target,
  CheckCircle2,
  Circle,
  Loader2,
  Lock,
  Sparkles,
  Edit3,
} from "lucide-react";
import { useGoalStore } from "@/store/goalStore";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { DonutProgress } from "@/components/charts/DonutProgress";
import { EmptyState } from "@/components/ui/EmptyState";
import { TaskItem } from "@/components/growth/TaskItem";
import {
  GOAL_CATEGORY_LABELS,
  GOAL_CATEGORY_ICONS,
  formatDate,
  cn,
} from "@/lib/utils";
import type { MilestoneStatus } from "@/types";

const milestoneStatusConfig: Record<
  MilestoneStatus,
  { label: string; color: "primary" | "mint" | "gray"; icon: typeof Circle }
> = {
  pending: { label: "待开始", color: "gray", icon: Lock },
  "in-progress": { label: "进行中", color: "primary", icon: Loader2 },
  completed: { label: "已完成", color: "mint", icon: CheckCircle2 },
};

export default function GoalDetail() {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  const { currentGoal, loading, loadGoal, completeTask } = useGoalStore();

  useEffect(() => {
    if (goalId) loadGoal(goalId);
  }, [goalId, loadGoal]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!currentGoal) {
    return (
      <EmptyState
        title="目标不存在"
        description="该目标可能已被删除，或链接有误。"
        action={<Button onClick={() => navigate("/growth")}>返回成长路径</Button>}
      />
    );
  }

  const goal = currentGoal;
  const completedTasks = goal.milestones.flatMap((m) => m.tasks).filter((t) => t.status === "completed").length;
  const totalTasks = goal.milestones.flatMap((m) => m.tasks).length;

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate("/growth")} leftIcon={<ArrowLeft className="h-4 w-4" />}>
        返回成长路径
      </Button>

      {/* 目标概览 */}
      <Card className="relative overflow-hidden">
        <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-primary-100/50 blur-3xl" />
        <div className="relative">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="h-12 w-12 rounded-2xl bg-gradient-cool dark:bg-ink-800 flex items-center justify-center text-2xl shrink-0">
                {GOAL_CATEGORY_ICONS[goal.category]}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge color="primary">{GOAL_CATEGORY_LABELS[goal.category]}</Badge>
                  <Badge color="amber">优先级 {goal.priority === 1 ? "高" : goal.priority === 2 ? "中" : "低"}</Badge>
                  <Badge color={goal.status === "active" ? "primary" : goal.status === "completed" ? "mint" : "gray"}>
                    {goal.status === "active" ? "进行中" : goal.status === "completed" ? "已完成" : goal.status === "paused" ? "已暂停" : "已放弃"}
                  </Badge>
                </div>
                <h1 className="font-serif-cn text-xl sm:text-2xl font-semibold text-ink-800 dark:text-ink-100">
                  {goal.title}
                </h1>
              </div>
            </div>
            <DonutProgress value={goal.progress} size={72} strokeWidth={7} label="%" />
          </div>

          <p className="text-sm text-ink-600 dark:text-ink-300 leading-relaxed mb-4">
            {goal.description}
          </p>

          <div className="grid sm:grid-cols-3 gap-3 text-xs">
            <InfoBlock label="预期周期" value={`${goal.expectedPeriodWeeks} 周`} icon={<Calendar className="h-3 w-3" />} />
            <InfoBlock label="任务进度" value={`${completedTasks} / ${totalTasks} 已完成`} icon={<CheckCircle2 className="h-3 w-3" />} />
            <InfoBlock label="创建时间" value={formatDate(goal.createdAt)} icon={<Calendar className="h-3 w-3" />} />
          </div>

          <div className="mt-4 pt-4 border-t border-ink-100 dark:border-ink-800">
            <div className="text-[11px] font-medium text-ink-500 mb-1">期望成果</div>
            <p className="text-sm text-ink-700 dark:text-ink-200">{goal.expectedOutcome}</p>
            <div className="text-[11px] font-medium text-ink-500 mt-2 mb-1">当前基础</div>
            <p className="text-sm text-ink-700 dark:text-ink-200">{goal.currentBaseline}</p>
          </div>
        </div>
      </Card>

      {/* 里程碑时间线 */}
      <Card>
        <SectionTitle
          title="成长里程碑"
          subtitle="AI 已基于你的优势画像拆解为阶段任务"
          icon={<Target className="h-5 w-5" />}
          action={
            <Button variant="outline" size="sm" leftIcon={<Sparkles className="h-3.5 w-3.5" />}>
              重新拆解
            </Button>
          }
        />

        <div className="relative">
          {/* 时间线竖线 */}
          <div className="absolute left-5 top-2 bottom-2 w-px bg-ink-200 dark:bg-ink-700" />

          <div className="space-y-6">
            {goal.milestones.map((milestone, idx) => {
              const config = milestoneStatusConfig[milestone.status];
              const StatusIcon = config.icon;
              return (
                <div key={milestone.id} className="relative pl-14">
                  {/* 时间线节点 */}
                  <div
                    className={cn(
                      "absolute left-0 top-0 h-10 w-10 rounded-2xl flex items-center justify-center border-2 shadow-soft",
                      milestone.status === "completed"
                        ? "bg-mint-500 border-mint-500 text-white"
                        : milestone.status === "in-progress"
                        ? "bg-primary-50 border-primary-500 text-primary-600 dark:bg-primary-900/30"
                        : "bg-white dark:bg-ink-900 border-ink-200 dark:border-ink-700 text-ink-400"
                    )}
                  >
                    <StatusIcon className={cn("h-4 w-4", milestone.status === "in-progress" && "animate-spin")} />
                  </div>

                  {/* 阶段标题 */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] text-ink-400 font-mono">
                        M{idx + 1}
                      </span>
                      <h3 className="font-serif-cn font-semibold text-ink-800 dark:text-ink-100">
                        {milestone.title}
                      </h3>
                      <Badge color={config.color} size="sm">{config.label}</Badge>
                    </div>
                    <p className="text-xs text-ink-500">
                      <Target className="inline h-3 w-3 mr-1" />
                      验收标准：{milestone.acceptanceCriteria}
                    </p>
                  </div>

                  {/* 任务列表 */}
                  {milestone.tasks.length > 0 ? (
                    <div className="space-y-2">
                      {milestone.tasks.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          goalTitle={goal.title}
                          goalCategory={goal.category}
                          onToggle={completeTask}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-ink-200 dark:border-ink-700 p-4 text-center">
                      <p className="text-xs text-ink-500">该阶段暂无任务，可让 AI 继续细化</p>
                      <Button variant="ghost" size="sm" className="mt-2" leftIcon={<Sparkles className="h-3.5 w-3.5" />}>
                        AI 细化任务
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* AI 教练建议 */}
      <Card className="bg-gradient-cool dark:bg-ink-800 border-primary-100 dark:border-primary-900/30">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-hero flex items-center justify-center text-white shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-serif-cn font-semibold text-ink-800 dark:text-ink-100 mb-1">
              AI 教练建议
            </h3>
            <p className="text-sm text-ink-600 dark:text-ink-300 leading-relaxed">
              基于你的战略思维与学习敏锐度优势，建议本周聚焦在「数据驱动决策」的能力补齐上。
              当前阶段二进度 60%，距离里程碑完成还差 1 个增长假设实验。
              建议今天先与 mentor 对谈一次，明确假设方向再动手，可避免返工。
            </p>
            <Link to="/ai-companion">
              <Button variant="primary" size="sm" className="mt-3">
                与 AI 教练对话
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

function InfoBlock({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-ink-50 dark:bg-ink-800 p-2.5">
      <div className="flex items-center gap-1 text-[10px] text-ink-500 mb-0.5">
        {icon}
        {label}
      </div>
      <div className="text-xs font-medium text-ink-700 dark:text-ink-200">{value}</div>
    </div>
  );
}
