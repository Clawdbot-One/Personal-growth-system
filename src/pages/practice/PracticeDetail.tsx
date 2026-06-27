import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  BarChart3,
  CheckCircle2,
  ListChecks,
  Lightbulb,
  Target,
  Sparkles,
  ImagePlus,
  Eye,
  Lock,
} from "lucide-react";
import { fetchPracticeById, checkIn } from "@/services/practiceService";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { DonutProgress } from "@/components/charts/DonutProgress";
import {
  PRACTICE_CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  formatMinutes,
  cn,
} from "@/lib/utils";
import type { PracticeProject } from "@/types";

export default function PracticeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [practice, setPractice] = useState<PracticeProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ content: "", reflection: "", isPublic: false });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchPracticeById(id).then((p) => {
      setPractice(p ?? null);
      setLoading(false);
    });
  }, [id]);

  const handleCheckIn = async () => {
    if (!practice || !form.content.trim()) return;
    setSubmitting(true);
    try {
      await checkIn({
        projectId: practice.id,
        content: form.content,
        reflection: form.reflection,
        isPublic: form.isPublic,
      });
      setCheckInOpen(false);
      setForm({ content: "", reflection: "", isPublic: false });
      // 简单反馈
      alert("打卡成功！已为你累积成长积分 +20");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!practice) {
    return (
      <EmptyState
        title="实践项目不存在"
        description="该项目可能已下架，或链接有误。"
        action={<Button onClick={() => navigate("/practice")}>返回实践库</Button>}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12 space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate("/practice")} leftIcon={<ArrowLeft className="h-4 w-4" />}>
        返回实践库
      </Button>

      {/* 头部 */}
      <Card className="relative overflow-hidden">
        <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-accent-100/40 blur-3xl" />
        <div className="relative">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge color="gray" size="md">{PRACTICE_CATEGORY_LABELS[practice.category]}</Badge>
                <Badge color={practice.difficulty === 1 ? "mint" : practice.difficulty === 2 ? "primary" : "accent"}>
                  {DIFFICULTY_LABELS[practice.difficulty]}
                </Badge>
                <Badge color="amber">{practice.checkInsCount} 人打卡</Badge>
              </div>
              <h1 className="font-serif-cn text-xl sm:text-2xl font-semibold text-ink-800 dark:text-ink-100 mb-2">
                {practice.title}
              </h1>
              <p className="text-sm text-ink-600 dark:text-ink-300 leading-relaxed">
                {practice.description}
              </p>
            </div>
            {practice.matchScore && (
              <div className="shrink-0 text-center">
                <DonutProgress
                  value={practice.matchScore}
                  size={64}
                  strokeWidth={6}
                  label="%"
                  color="#10B981"
                />
                <div className="text-[10px] text-ink-500 mt-1">适配度</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-ink-100 dark:border-ink-800">
            <InfoBlock icon={<Clock className="h-4 w-4" />} label="参考时长" value={formatMinutes(practice.estimatedMinutes)} />
            <InfoBlock icon={<BarChart3 className="h-4 w-4" />} label="难度" value={DIFFICULTY_LABELS[practice.difficulty]} />
            <InfoBlock icon={<CheckCircle2 className="h-4 w-4" />} label="打卡人数" value={`${practice.checkInsCount} 人`} />
          </div>
        </div>
      </Card>

      {/* 适配优势 */}
      <Card>
        <SectionTitle title="适配优势" subtitle="以下优势在该实践中能被显著强化" icon={<Sparkles className="h-5 w-5" />} />
        <div className="flex flex-wrap gap-2">
          {practice.suitableStrengths.map((s) => (
            <span
              key={s}
              className="px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium"
            >
              {s}
            </span>
          ))}
        </div>
      </Card>

      {/* 操作步骤 */}
      <Card>
        <SectionTitle title="操作步骤" subtitle="按顺序推进，每步完成都是一次小里程碑" icon={<ListChecks className="h-5 w-5" />} />
        <div className="relative">
          <div className="absolute left-4 top-2 bottom-2 w-px bg-ink-200 dark:bg-ink-700" />
          <ol className="space-y-3">
            {practice.steps.map((step, i) => (
              <li key={i} className="relative pl-12">
                <div className="absolute left-0 top-0 h-8 w-8 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center text-xs font-semibold border border-primary-100 dark:border-primary-900/40">
                  {i + 1}
                </div>
                <p className="text-sm text-ink-700 dark:text-ink-200 pt-1.5 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </Card>

      {/* 能力提升点 */}
      <Card>
        <SectionTitle title="能力提升点" subtitle="完成后你将获得这些能力的强化" icon={<Lightbulb className="h-5 w-5" />} />
        <div className="grid sm:grid-cols-2 gap-2">
          {practice.skillPoints.map((sp) => (
            <div key={sp} className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50/50 dark:bg-amber-500/10">
              <Lightbulb className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span className="text-sm text-ink-700 dark:text-ink-200">{sp}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* 成果标准 */}
      <Card className="bg-gradient-cool dark:bg-ink-800 border-primary-100 dark:border-primary-900/30">
        <SectionTitle title="成果输出标准" subtitle="这是检验你完成质量的标尺" icon={<Target className="h-5 w-5" />} />
        <p className="text-sm text-ink-700 dark:text-ink-200 leading-relaxed font-medium">
          {practice.outcomeStandard}
        </p>
      </Card>

      {/* 打卡 CTA */}
      <div className="sticky bottom-4 lg:bottom-6 z-10">
        <Card className="bg-white dark:bg-ink-900 shadow-lift border-primary-200 dark:border-primary-900/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-serif-cn font-semibold text-ink-800 dark:text-ink-100 text-sm">
                完成了这个实践？
              </h3>
              <p className="text-xs text-ink-500 mt-0.5">打卡沉淀成果，自动更新成长档案 +20 积分</p>
            </div>
            <Button onClick={() => setCheckInOpen(true)} leftIcon={<CheckCircle2 className="h-4 w-4" />}>
              立即打卡
            </Button>
          </div>
        </Card>
      </div>

      {/* 打卡弹窗 */}
      <Modal
        open={checkInOpen}
        onClose={() => setCheckInOpen(false)}
        title="实践打卡"
        description={practice.title}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCheckInOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCheckIn} loading={submitting} disabled={!form.content.trim()}>
              提交打卡
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-600 dark:text-ink-300 mb-1.5">
              成果内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="描述你完成了什么、产出了什么..."
              rows={4}
              className="input resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-600 dark:text-ink-300 mb-1.5">
              心得反思
            </label>
            <textarea
              value={form.reflection}
              onChange={(e) => setForm({ ...form, reflection: e.target.value })}
              placeholder="这次实践你学到了什么？哪些优势被强化了？"
              rows={3}
              className="input resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-600 dark:text-ink-300 mb-1.5">
              附图（可选）
            </label>
            <button className="w-full py-6 rounded-xl border-2 border-dashed border-ink-200 dark:border-ink-700 text-ink-400 hover:border-primary-300 hover:text-primary-500 transition-colors flex flex-col items-center gap-1">
              <ImagePlus className="h-6 w-6" />
              <span className="text-xs">点击上传图片</span>
            </button>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-ink-50 dark:bg-ink-800">
            <button
              onClick={() => setForm({ ...form, isPublic: !form.isPublic })}
              className={cn(
                "relative h-5 w-9 rounded-full transition-colors",
                form.isPublic ? "bg-primary-600" : "bg-ink-300 dark:bg-ink-700"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                  form.isPublic ? "translate-x-4" : "translate-x-0.5"
                )}
              />
            </button>
            <div className="flex-1">
              <div className="text-xs font-medium text-ink-700 dark:text-ink-200 flex items-center gap-1">
                {form.isPublic ? <Eye className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                {form.isPublic ? "公开到社区" : "仅自己可见"}
              </div>
              <div className="text-[10px] text-ink-500">优质公开内容有机会被推荐到首页</div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function InfoBlock({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-ink-50 dark:bg-ink-800 text-ink-500 mb-1.5">
        {icon}
      </div>
      <div className="text-[10px] text-ink-500">{label}</div>
      <div className="text-xs font-medium text-ink-700 dark:text-ink-200 mt-0.5">{value}</div>
    </div>
  );
}
