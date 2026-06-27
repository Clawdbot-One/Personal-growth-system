import { Check, Clock, Circle } from "lucide-react";
import type { Task } from "@/types";
import { cn, formatMinutes, formatDate } from "@/lib/utils";
import { GOAL_CATEGORY_LABELS } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  goalTitle?: string;
  goalCategory?: string;
  onToggle?: (taskId: string) => void;
  compact?: boolean;
}

export function TaskItem({ task, goalTitle, goalCategory, onToggle, compact }: TaskItemProps) {
  const completed = task.status === "completed";

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-xl border p-3 transition-all",
        completed
          ? "bg-mint-50/50 dark:bg-mint-500/5 border-mint-100 dark:border-mint-500/20"
          : "bg-white dark:bg-ink-900 border-ink-100 dark:border-ink-800 hover:border-primary-200 hover:shadow-soft"
      )}
    >
      <button
        onClick={() => onToggle?.(task.id)}
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
          completed
            ? "bg-mint-500 border-mint-500 text-white"
            : "border-ink-300 hover:border-primary-500 hover:bg-primary-50"
        )}
        aria-label={completed ? "标记为未完成" : "标记为已完成"}
      >
        {completed ? <Check className="h-3 w-3" /> : <Circle className="h-2 w-2 opacity-0 group-hover:opacity-40" />}
      </button>

      <div className="flex-1 min-w-0">
        <div
          className={cn(
            "text-sm font-medium",
            completed
              ? "text-ink-500 line-through dark:text-ink-400"
              : "text-ink-800 dark:text-ink-100"
          )}
        >
          {task.content}
        </div>
        {!compact && (
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[11px] text-ink-500">
              <Clock className="h-3 w-3" />
              {formatMinutes(task.estimatedMinutes)}
            </span>
            <span className="text-[11px] text-ink-400">·</span>
            <span className="text-[11px] text-ink-500">
              {task.status === "completed" && task.completedAt
                ? `完成于 ${formatDate(task.completedAt, "MM-DD")}`
                : `截止 ${formatDate(task.dueDate, "MM-DD")}`}
            </span>
            {goalCategory && (
              <>
                <span className="text-[11px] text-ink-400">·</span>
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300">
                  {GOAL_CATEGORY_LABELS[goalCategory] ?? goalCategory}
                </span>
              </>
            )}
            {goalTitle && (
              <>
                <span className="text-[11px] text-ink-400">·</span>
                <span className="text-[11px] text-ink-500 truncate max-w-[140px]">{goalTitle}</span>
              </>
            )}
          </div>
        )}
      </div>

      <span
        className={cn(
          "shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-medium",
          task.granularity === "day"
            ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
            : task.granularity === "week"
            ? "bg-accent-50 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300"
            : "bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300"
        )}
      >
        {task.granularity === "day" ? "今日" : task.granularity === "week" ? "本周" : "本月"}
      </span>
    </div>
  );
}
