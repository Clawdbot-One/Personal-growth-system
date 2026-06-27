import { NavLink } from "react-router-dom";
import { ArrowUpRight, Target } from "lucide-react";
import type { GrowthGoal } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DonutProgress } from "@/components/charts/DonutProgress";
import { GOAL_CATEGORY_LABELS, GOAL_CATEGORY_ICONS, cn } from "@/lib/utils";

interface GoalCardProps {
  goal: GrowthGoal;
}

const statusLabels: Record<string, { label: string; color: "primary" | "mint" | "amber" | "gray" }> = {
  active: { label: "进行中", color: "primary" },
  completed: { label: "已完成", color: "mint" },
  paused: { label: "已暂停", color: "amber" },
  abandoned: { label: "已放弃", color: "gray" },
};

export function GoalCard({ goal }: GoalCardProps) {
  const status = statusLabels[goal.status];
  const completedMilestones = goal.milestones.filter((m) => m.status === "completed").length;

  return (
    <NavLink to={`/growth/${goal.id}`} className="block">
      <Card hover className="group cursor-pointer h-full">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl">{GOAL_CATEGORY_ICONS[goal.category]}</span>
            <div className="min-w-0">
              <h3 className="font-serif-cn font-semibold text-ink-800 dark:text-ink-100 leading-snug truncate">
                {goal.title}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] text-ink-500">
                  {GOAL_CATEGORY_LABELS[goal.category]}
                </span>
                <span className="text-[11px] text-ink-400">·</span>
                <span className="text-[11px] text-ink-500">{goal.expectedPeriodWeeks} 周</span>
              </div>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-ink-400 group-hover:text-primary-600 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
        </div>

        <p className="text-sm text-ink-600 dark:text-ink-400 line-clamp-2 mb-4 leading-relaxed">
          {goal.description}
        </p>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge color={status.color}>{status.label}</Badge>
            <span className="text-[11px] text-ink-500">
              {completedMilestones}/{goal.milestones.length} 阶段
            </span>
          </div>
          <DonutProgress
            value={goal.progress}
            size={48}
            strokeWidth={5}
            label="%"
            color={goal.progress >= 80 ? "#10B981" : goal.progress >= 40 ? "#2563EB" : "#F97316"}
          />
        </div>

        <div className="mt-3 pt-3 border-t border-ink-100 dark:border-ink-800 flex items-center gap-2 text-[11px] text-ink-500">
          <Target className="h-3 w-3" />
          <span className="truncate">{goal.expectedOutcome}</span>
        </div>
      </Card>
    </NavLink>
  );
}
