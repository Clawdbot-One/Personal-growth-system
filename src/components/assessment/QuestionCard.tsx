import { Check } from "lucide-react";
import type { AssessmentQuestion } from "@/types";
import { cn, DIMENSION_LABELS, DIMENSION_COLORS } from "@/lib/utils";

interface QuestionCardProps {
  question: AssessmentQuestion;
  index: number;
  total: number;
  selected?: number | string;
  onAnswer: (questionId: string, value: number | string) => void;
}

export function QuestionCard({
  question,
  index,
  total,
  selected,
  onAnswer,
}: QuestionCardProps) {
  const dimColor = DIMENSION_COLORS[question.dimension];
  const dimLabel = DIMENSION_LABELS[question.dimension];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <span
          className="text-[11px] px-2 py-0.5 rounded-md font-medium"
          style={{
            background: `${dimColor}1A`,
            color: dimColor,
          }}
        >
          {dimLabel}
        </span>
        <span className="text-[11px] text-ink-500">
          第 {index + 1} / {total} 题
        </span>
      </div>

      <h2 className="font-serif-cn text-xl sm:text-2xl font-semibold text-ink-800 dark:text-ink-100 leading-relaxed">
        {question.stem}
      </h2>

      <div className="space-y-2.5">
        {question.options?.map((opt, i) => {
          const isSelected = selected === opt.value;
          return (
            <button
              key={i}
              onClick={() => onAnswer(question.id, opt.value)}
              className={cn(
                "group w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all",
                isSelected
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                  : "border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 hover:border-primary-300 hover:bg-primary-50/50"
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all",
                  isSelected
                    ? "bg-primary-600 text-white"
                    : "bg-ink-100 text-ink-500 group-hover:bg-primary-100 group-hover:text-primary-600 dark:bg-ink-800"
                )}
              >
                {isSelected ? <Check className="h-4 w-4" /> : String.fromCharCode(65 + i)}
              </span>
              <span
                className={cn(
                  "text-sm flex-1",
                  isSelected
                    ? "text-primary-700 dark:text-primary-300 font-medium"
                    : "text-ink-700 dark:text-ink-200"
                )}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
