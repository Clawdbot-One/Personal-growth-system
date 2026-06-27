import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Share2,
  Download,
  Sparkles,
  Lightbulb,
  Compass,
  TrendingUp,
  AlertCircle,
  Target,
} from "lucide-react";
import { useAssessmentStore } from "@/store/assessmentStore";
import { RadarChart } from "@/components/charts/RadarChart";
import { StrengthCard } from "@/components/assessment/StrengthCard";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { DIMENSION_LABELS, DIMENSION_COLORS, formatDate, formatSeconds } from "@/lib/utils";

export default function AssessmentReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentResult, loading, loadResult } = useAssessmentStore();

  useEffect(() => {
    if (id) loadResult(id);
  }, [id, loadResult]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!currentResult) {
    return (
      <EmptyState
        title="报告不存在"
        description="该测评报告可能已被删除，或链接有误。"
        action={<Button onClick={() => navigate("/assessment")}>返回测评中心</Button>}
      />
    );
  }

  const dims = currentResult.dimensions;
  const dimEntries = Object.entries(dims) as Array<[keyof typeof dims, number]>;
  const sortedDims = dimEntries.sort((a, b) => b[1] - a[1]);

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-6">
      {/* 顶部操作 */}
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/assessment")} leftIcon={<ArrowLeft className="h-4 w-4" />}>
          返回测评中心
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<Share2 className="h-4 w-4" />}>
            分享
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Download className="h-4 w-4" />}>
            导出 PDF
          </Button>
        </div>
      </div>

      {/* 报告头部 */}
      <Card className="relative overflow-hidden bg-gradient-cool dark:bg-ink-800 border-primary-100 dark:border-primary-900/30">
        <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-primary-200/40 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-accent-200/30 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Badge color="primary" size="md">
              {currentResult.mode === "quick" ? "快速精简版" : currentResult.mode === "professional" ? "专业完整版" : "深度访谈版"}
            </Badge>
            <Badge color="gray">{formatDate(currentResult.createdAt, "YYYY-MM-DD")}</Badge>
            <Badge color="gray">用时 {formatSeconds(currentResult.durationSeconds)}</Badge>
          </div>
          <h1 className="font-serif-cn text-2xl sm:text-3xl font-semibold text-ink-800 dark:text-ink-100 mb-2">
            你的优势画像报告
          </h1>
          <p className="text-sm text-ink-600 dark:text-ink-300 max-w-xl">
            基于四维动态测评生成，识别你的核心优势与潜在盲区，匹配最适合的发展方向。
          </p>
        </div>
      </Card>

      {/* 四维雷达 */}
      <Card>
        <SectionTitle
          title="四维优势雷达"
          subtitle="天赋 / 技能 / 性格 / 价值观 的量化呈现"
          icon={<RadarMini />}
        />
        <div className="grid sm:grid-cols-2 gap-6 items-center">
          <div className="flex justify-center">
            <RadarChart dimensions={dims} size={300} />
          </div>
          <div className="space-y-2">
            {sortedDims.map(([key, value], i) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-xs text-ink-500 w-16 shrink-0">
                  {DIMENSION_LABELS[key]}
                </span>
                <div className="flex-1 h-2 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${value}%`,
                      background: DIMENSION_COLORS[key],
                    }}
                  />
                </div>
                <span
                  className="font-display text-sm font-semibold w-8 text-right"
                  style={{ color: DIMENSION_COLORS[key] }}
                >
                  {value}
                </span>
                {i === 0 && <Badge color="amber" size="sm">最强</Badge>}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* TOP5 优势 */}
      <Card>
        <SectionTitle
          title="TOP 5 核心优势"
          subtitle="每个优势配定义、行为表现、典型场景与强化建议"
          icon={<Sparkles className="h-5 w-5" />}
        />
        <div className="space-y-2">
          {currentResult.topStrengths.map((s, i) => (
            <StrengthCard key={s.name} strength={s} rank={i + 1} />
          ))}
        </div>
      </Card>

      {/* 盲区提示 */}
      <Card className="border-amber-200 dark:border-amber-500/20 bg-amber-50/40 dark:bg-amber-500/5">
        <SectionTitle
          title="盲区与成长提示"
          subtitle="识别相对短板，给出扬长避短的策略"
          icon={<AlertCircle className="h-5 w-5 text-amber-600" />}
        />
        <ul className="space-y-2">
          {currentResult.blindSpots.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-ink-700 dark:text-ink-200">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-semibold mt-0.5">
                {i + 1}
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* 适配方向 */}
      <Card>
        <SectionTitle
          title="适配方向推荐"
          subtitle="基于优势画像匹配的职业与发展方向"
          icon={<Compass className="h-5 w-5" />}
        />
        <div className="grid sm:grid-cols-2 gap-3">
          {currentResult.recommendedDirections.map((d, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 p-3 rounded-xl border border-ink-100 dark:border-ink-800 hover:border-primary-200 hover:bg-primary-50/30 transition-colors"
            >
              <Target className="h-4 w-4 text-primary-600 mt-0.5 shrink-0" />
              <span className="text-sm text-ink-700 dark:text-ink-200">{d}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* 行动 CTA */}
      <Card className="bg-gradient-hero text-white border-0">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-serif-cn text-lg font-semibold">把优势转化为成长路径</h3>
              <p className="text-sm text-white/80">基于报告，让 AI 帮你拆解第一个可执行目标</p>
            </div>
          </div>
          <Link to="/growth">
            <Button variant="secondary" rightIcon={<ArrowLeft className="h-4 w-4 rotate-180" />}>
              创建成长目标
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

function RadarMini() {
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600">
      <Compass className="h-5 w-5" />
    </span>
  );
}
