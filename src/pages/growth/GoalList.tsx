import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Target, Sparkles } from "lucide-react";
import { useGoalStore } from "@/store/goalStore";
import { GoalCard } from "@/components/growth/GoalCard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { GoalCategory, GoalStatus } from "@/types";
import { GOAL_CATEGORY_LABELS, GOAL_CATEGORY_ICONS, cn } from "@/lib/utils";

const statusFilters: { value: GoalStatus | "all"; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "active", label: "进行中" },
  { value: "completed", label: "已完成" },
  { value: "paused", label: "已暂停" },
];

export default function GoalList() {
  const navigate = useNavigate();
  const { goals, loading, loadGoals, addGoal } = useGoalStore();
  const [filter, setFilter] = useState<GoalStatus | "all">("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // 表单状态
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "career" as GoalCategory,
    expectedPeriodWeeks: 12,
    expectedOutcome: "",
    currentBaseline: "",
    priority: 2 as 1 | 2 | 3,
  });

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const filtered = goals.filter((g) => filter === "all" || g.status === filter);

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setCreating(true);
    try {
      const newGoal = await addGoal(form);
      setCreateOpen(false);
      setForm({
        title: "",
        description: "",
        category: "career",
        expectedPeriodWeeks: 12,
        expectedOutcome: "",
        currentBaseline: "",
        priority: 2,
      });
      navigate(`/growth/${newGoal.id}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif-cn text-2xl font-semibold text-ink-800 dark:text-ink-100 mb-1">
            成长路径
          </h1>
          <p className="text-sm text-ink-500">
            管理你的多维度成长目标，让 AI 帮你拆解为可执行的行动
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
          新建目标
        </Button>
      </div>

      {/* 状态筛选 */}
      <div className="flex items-center gap-2 flex-wrap">
        {statusFilters.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              filter === s.value
                ? "bg-primary-600 text-white shadow-soft"
                : "bg-white dark:bg-ink-900 text-ink-600 dark:text-ink-300 border border-ink-100 dark:border-ink-800 hover:border-primary-200"
            )}
          >
            {s.label}
            <span className="ml-1 opacity-70">
              {s.value === "all" ? goals.length : goals.filter((g) => g.status === s.value).length}
            </span>
          </button>
        ))}
      </div>

      {/* 目标列表 */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="还没有成长目标"
          description="创建你的第一个目标，AI 会基于你的优势画像自动拆解为可执行的行动路径。"
          action={
            <Button onClick={() => setCreateOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
              创建目标
            </Button>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((g) => (
            <GoalCard key={g.id} goal={g} />
          ))}
        </div>
      )}

      {/* 新建目标弹窗 */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="新建成长目标"
        description="填写目标信息，AI 会基于你的优势画像自动拆解"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreate} loading={creating} disabled={!form.title.trim()}>
              创建并让 AI 拆解
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="目标标题" required>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="例如：3 个月内转型产品经理"
              className="input"
            />
          </FormField>

          <FormField label="目标描述">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="详细描述你的目标，包括动机、背景、约束条件..."
              rows={3}
              className="input resize-none"
            />
          </FormField>

          <div className="grid sm:grid-cols-2 gap-3">
            <FormField label="目标分类">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as GoalCategory })}
                className="input"
              >
                {Object.entries(GOAL_CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {GOAL_CATEGORY_ICONS[k]} {v}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="预期周期（周）">
              <input
                type="number"
                min={1}
                max={52}
                value={form.expectedPeriodWeeks}
                onChange={(e) => setForm({ ...form, expectedPeriodWeeks: Number(e.target.value) })}
                className="input"
              />
            </FormField>
          </div>

          <FormField label="期望成果">
            <input
              value={form.expectedOutcome}
              onChange={(e) => setForm({ ...form, expectedOutcome: e.target.value })}
              placeholder="例如：独立负责一个产品模块 0-1"
              className="input"
            />
          </FormField>

          <FormField label="当前基础">
            <input
              value={form.currentBaseline}
              onChange={(e) => setForm({ ...form, currentBaseline: e.target.value })}
              placeholder="例如：5 年设计经验，缺商业与数据视角"
              className="input"
            />
          </FormField>

          <FormField label="优先级">
            <div className="flex gap-2">
              {[1, 2, 3].map((p) => (
                <button
                  key={p}
                  onClick={() => setForm({ ...form, priority: p as 1 | 2 | 3 })}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-all",
                    form.priority === p
                      ? p === 1
                        ? "border-red-400 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                        : p === 2
                        ? "border-primary-400 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300"
                        : "border-ink-300 bg-ink-50 text-ink-600 dark:bg-ink-800 dark:text-ink-300"
                      : "border-ink-100 dark:border-ink-800 text-ink-500 hover:border-ink-200"
                  )}
                >
                  {p === 1 ? "高" : p === 2 ? "中" : "低"}
                </button>
              ))}
            </div>
          </FormField>

          {/* AI 提示 */}
          <div className="rounded-xl bg-gradient-cool dark:bg-ink-800 p-3 flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-primary-600 mt-0.5 shrink-0" />
            <p className="text-xs text-ink-600 dark:text-ink-300">
              创建后，AI 会读取你的优势画像，自动拆解为 3-4 个里程碑与月/周/日任务，并匹配学习资源。
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink-600 dark:text-ink-300 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
