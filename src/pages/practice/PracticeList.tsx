import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, Sparkles, Clock, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { fetchPractices } from "@/services/practiceService";
import { useUserStore } from "@/store/userStore";
import {
  PRACTICE_CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  formatMinutes,
  cn,
} from "@/lib/utils";
import type { PracticeProject, PracticeCategory } from "@/types";

const categoryFilters: { value: PracticeCategory | "all"; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "workplace", label: "职场应用" },
  { value: "side-project", label: "副业探索" },
  { value: "skill", label: "技能练习" },
  { value: "project", label: "项目实战" },
  { value: "habit", label: "习惯养成" },
];

const difficultyFilters = [
  { value: 0, label: "全部难度" },
  { value: 1, label: "入门" },
  { value: 2, label: "进阶" },
  { value: 3, label: "挑战" },
];

export default function PracticeList() {
  const navigate = useNavigate();
  const { profile } = useUserStore();
  const [practices, setPractices] = useState<PracticeProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<PracticeCategory | "all">("all");
  const [difficulty, setDifficulty] = useState(0);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchPractices({
      category: category === "all" ? undefined : category,
      difficulty: difficulty || undefined,
      keyword: keyword || undefined,
    }).then((list) => {
      setPractices(list);
      setLoading(false);
    });
  }, [category, difficulty, keyword]);

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-warm dark:bg-ink-800 p-6 border border-accent-100 dark:border-accent-900/30">
        <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-accent-200/40 blur-2xl" />
        <div className="relative">
          <Badge color="accent" size="md" className="mb-2">
            <Sparkles className="h-3 w-3" /> 优势落地实践库
          </Badge>
          <h1 className="font-serif-cn text-2xl font-semibold text-ink-800 dark:text-ink-100 mb-1">
            把优势转化为行动
          </h1>
          <p className="text-sm text-ink-600 dark:text-ink-300 max-w-xl">
            每个实践项目都标注了适配优势、操作步骤与成果标准。完成打卡后自动更新成长档案。
          </p>
        </div>
      </div>

      {/* 搜索 + 筛选 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索实践项目、标签..."
            className="input pl-9"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <SlidersHorizontal className="h-4 w-4 text-ink-400 shrink-0" />
          {difficultyFilters.map((d) => (
            <button
              key={d.value}
              onClick={() => setDifficulty(d.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                difficulty === d.value
                  ? "bg-primary-600 text-white shadow-soft"
                  : "bg-white dark:bg-ink-900 text-ink-600 dark:text-ink-300 border border-ink-100 dark:border-ink-800 hover:border-primary-200"
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* 分类标签 */}
      <div className="flex items-center gap-2 flex-wrap">
        {categoryFilters.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              category === c.value
                ? "bg-accent-500 text-white shadow-soft"
                : "bg-white dark:bg-ink-900 text-ink-600 dark:text-ink-300 border border-ink-100 dark:border-ink-800 hover:border-accent-200"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* 我的优势提示 */}
      {profile && (
        <div className="rounded-xl bg-primary-50 dark:bg-primary-900/20 p-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary-600 shrink-0" />
          <p className="text-xs text-ink-600 dark:text-ink-300">
            你的核心优势：<span className="font-medium text-primary-700 dark:text-primary-300">
              {profile.topStrengths.slice(0, 3).map((s) => s.name).join("、")}
            </span>
            ，下方已按适配度排序推荐。
          </p>
        </div>
      )}

      {/* 实践卡片网格 */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : practices.length === 0 ? (
        <EmptyState
          title="没有找到匹配的实践"
          description="试试调整筛选条件，或清除关键词重新查看。"
          action={
            <Button
              variant="outline"
              onClick={() => {
                setCategory("all");
                setDifficulty(0);
                setKeyword("");
              }}
            >
              重置筛选
            </Button>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {practices.map((p) => (
            <PracticeCard key={p.id} practice={p} onClick={() => navigate(`/practice/${p.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}

interface PracticeCardProps {
  practice: PracticeProject;
  onClick: () => void;
}

function PracticeCard({ practice, onClick }: PracticeCardProps) {
  const diffColor =
    practice.difficulty === 1
      ? "mint"
      : practice.difficulty === 2
      ? "primary"
      : "accent";

  return (
    <Card hover className="cursor-pointer h-full flex flex-col" onClick={onClick}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <Badge color="gray" size="sm">{PRACTICE_CATEGORY_LABELS[practice.category]}</Badge>
        {practice.matchScore && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-ink-500">适配度</span>
            <span className="font-display text-sm font-semibold text-primary-600">
              {practice.matchScore}%
            </span>
          </div>
        )}
      </div>

      <h3 className="font-serif-cn font-semibold text-ink-800 dark:text-ink-100 mb-2 leading-snug line-clamp-2">
        {practice.title}
      </h3>

      <p className="text-xs text-ink-600 dark:text-ink-400 line-clamp-2 mb-3 flex-1">
        {practice.description}
      </p>

      <div className="flex flex-wrap gap-1 mb-3">
        {practice.tags.slice(0, 3).map((t) => (
          <span
            key={t}
            className="text-[10px] px-1.5 py-0.5 rounded bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-400"
          >
            #{t}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-ink-100 dark:border-ink-800">
        <div className="flex items-center gap-3 text-[11px] text-ink-500">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatMinutes(practice.estimatedMinutes)}
          </span>
          <span className="inline-flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            {DIFFICULTY_LABELS[practice.difficulty]}
          </span>
        </div>
        <Badge color={diffColor} size="sm">
          {practice.checkInsCount} 人打卡
        </Badge>
      </div>
    </Card>
  );
}
