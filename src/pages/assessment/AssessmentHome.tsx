import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Check, Lock, ChevronRight, History, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { assessmentModes } from "@/services/assessmentService";
import { useAssessmentStore } from "@/store/assessmentStore";
import { formatDate, cn } from "@/lib/utils";

const modeStyles = {
  quick: {
    gradient: "from-primary-500 to-primary-700",
    ring: "ring-primary-100 dark:ring-primary-900/30",
    glow: "bg-primary-400/30",
  },
  professional: {
    gradient: "from-accent-500 to-amber-500",
    ring: "ring-accent-100 dark:ring-accent-900/30",
    glow: "bg-accent-400/30",
  },
  interview: {
    gradient: "from-ink-700 to-ink-900",
    ring: "ring-ink-200 dark:ring-ink-700",
    glow: "bg-ink-500/30",
  },
};

export default function AssessmentHome() {
  const navigate = useNavigate();
  const { history, loading, loadHistory, startAssessment } = useAssessmentStore();
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleStart = async (mode: "quick" | "professional" | "interview") => {
    if (mode === "interview") {
      // 深度访谈版走对话式（前端原型中跳转到 AI 陪伴并预填）
      navigate("/ai-companion?mode=interview");
      return;
    }
    setSelected(mode);
    await startAssessment(mode);
    navigate(`/assessment/start/${mode}`);
  };

  return (
    <div className="space-y-6">
      {/* 头部介绍 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-cool dark:bg-ink-800 p-6 sm:p-8 border border-primary-100 dark:border-primary-900/30">
        <div className="absolute top-4 right-4 opacity-30 hidden sm:block">
          <Sparkles className="h-20 w-20 text-primary-300" />
        </div>
        <div className="relative">
          <Badge color="primary" size="md" className="mb-3">
            基于盖洛普 + 多元智能理论
          </Badge>
          <h1 className="font-serif-cn text-2xl sm:text-3xl font-semibold text-ink-800 dark:text-ink-100 mb-2">
            发现你的天赋优势
          </h1>
          <p className="text-sm sm:text-base text-ink-600 dark:text-ink-300 max-w-xl">
            通过多维度动态测评，客观识别你的核心优势、潜在盲区与适配方向。断点续答，全程陪伴。
          </p>
        </div>
      </div>

      {/* 模式选择 */}
      <div>
        <h2 className="font-serif-cn text-lg font-semibold text-ink-800 dark:text-ink-100 mb-4">
          选择测评模式
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {assessmentModes.map((mode) => {
            const style = modeStyles[mode.key];
            return (
              <Card
                key={mode.key}
                hover
                className={cn(
                  "relative overflow-hidden flex flex-col",
                  mode.recommended && "ring-2 ring-accent-200 dark:ring-accent-900/40"
                )}
              >
                {mode.recommended && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-accent-500 text-white text-[10px] font-medium px-3 py-1 rounded-bl-lg">
                      推荐
                    </div>
                  </div>
                )}
                {mode.premium && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-ink-800 text-amber-300 text-[10px] font-medium px-3 py-1 rounded-bl-lg inline-flex items-center gap-1">
                      <Lock className="h-2.5 w-2.5" /> Pro
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div
                    className={cn(
                      "relative h-12 w-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-lift",
                      style.gradient
                    )}
                  >
                    <Sparkles className="h-6 w-6" />
                    <div
                      className={cn(
                        "absolute inset-0 rounded-2xl blur-md opacity-50",
                        style.glow
                      )}
                    />
                  </div>
                </div>

                <h3 className="font-serif-cn text-lg font-semibold text-ink-800 dark:text-ink-100">
                  {mode.name}
                </h3>
                <p className="text-sm text-ink-500 dark:text-ink-400 mt-1 mb-4">{mode.subtitle}</p>

                <div className="space-y-1.5 mb-4 text-xs text-ink-600 dark:text-ink-300">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-ink-400" />
                    <span>{mode.duration}</span>
                    <span className="text-ink-400">·</span>
                    <span>{mode.questionCount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-ink-400" />
                    <span>输出：{mode.output}</span>
                  </div>
                </div>

                <ul className="space-y-1 mb-5 flex-1">
                  {mode.features.map((f) => (
                    <li key={f} className="text-xs text-ink-600 dark:text-ink-400 flex items-start gap-1.5">
                      <Check className="h-3 w-3 text-mint-500 mt-1 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={mode.recommended ? "secondary" : "primary"}
                  className="w-full"
                  loading={selected === mode.key}
                  onClick={() => handleStart(mode.key)}
                  rightIcon={<ChevronRight className="h-4 w-4" />}
                >
                  {mode.premium ? "升级解锁" : "立即开始"}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 历史测评 */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-ink-500" />
          <h2 className="font-serif-cn text-lg font-semibold text-ink-800 dark:text-ink-100">
            历史测评记录
          </h2>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <EmptyState
            title="还没有测评记录"
            description="完成你的第一次测评，开启优势成长之旅。"
          />
        ) : (
          <div className="space-y-2">
            {history.map((r) => (
              <Card key={r.id} hover padded={false} className="cursor-pointer" onClick={() => navigate(`/assessment/report/${r.id}`)}>
                <div className="flex items-center gap-4 p-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 shrink-0">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-ink-800 dark:text-ink-100">
                          {r.mode === "quick" ? "快速精简版" : r.mode === "professional" ? "专业完整版" : "深度访谈版"}
                        </span>
                        <Badge color="primary">v{history.length - history.indexOf(r)}</Badge>
                      </div>
                      <p className="text-xs text-ink-500 mt-0.5">
                        {formatDate(r.createdAt, "YYYY-MM-DD HH:mm")} · 用时 {Math.round(r.durationSeconds / 60)} 分钟
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5">
                    {Object.entries(r.dimensions).map(([k, v]) => (
                      <div key={k} className="text-center">
                        <div className="text-[10px] text-ink-500">
                          {k === "talent" ? "天" : k === "skill" ? "技" : k === "personality" ? "性" : "值"}
                        </div>
                        <div className="text-xs font-semibold text-ink-700 dark:text-ink-200">{v}</div>
                      </div>
                    ))}
                  </div>
                  <ChevronRight className="h-4 w-4 text-ink-400" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
