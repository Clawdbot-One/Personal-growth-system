import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Save, X } from "lucide-react";
import { useAssessmentStore } from "@/store/assessmentStore";
import { QuestionCard } from "@/components/assessment/QuestionCard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn, formatSeconds } from "@/lib/utils";

export default function AssessmentQuiz() {
  const { mode = "quick" } = useParams<{ mode: "quick" | "professional" }>();
  const navigate = useNavigate();
  const {
    questions,
    currentIndex,
    answers,
    loading,
    submitting,
    startedAt,
    startAssessment,
    resumeIfNeeded,
    answer,
    next,
    prev,
    submit,
    reset,
  } = useAssessmentStore();

  const [elapsed, setElapsed] = useState(0);
  const [confirmExit, setConfirmExit] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);

  // 初始化：尝试续答，否则启动新模式
  useEffect(() => {
    const resumed = resumeIfNeeded();
    if (!resumed || (mode && useAssessmentStore.getState().mode !== mode)) {
      startAssessment(mode);
    }
  }, [mode, startAssessment, resumeIfNeeded]);

  // 计时器
  useEffect(() => {
    if (!startedAt) return;
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startedAt]);

  // 自动保存提示（每次答题后 1.5s 显示）
  useEffect(() => {
    if (Object.keys(answers).length === 0) return;
    setAutoSaved(false);
    const t = setTimeout(() => setAutoSaved(true), 800);
    return () => clearTimeout(t);
  }, [answers]);

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const answeredCount = Object.keys(answers).length;
  const progress = questions.length ? (answeredCount / questions.length) * 100 : 0;

  const handleSubmit = async () => {
    const result = await submit();
    if (result) {
      navigate(`/assessment/report/${result.id}`);
    }
  };

  const handleExit = () => {
    reset();
    navigate("/assessment");
  };

  if (loading || !currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-12" />
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-12">
      {/* 顶部进度条 */}
      <div className="sticky top-16 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-ink-50/80 dark:bg-ink-950/80 backdrop-blur-md border-b border-ink-100 dark:border-ink-800 mb-6">
        <div className="flex items-center justify-between gap-3 mb-2">
          <button
            onClick={() => setConfirmExit(true)}
            className="inline-flex items-center gap-1 text-xs text-ink-500 hover:text-ink-700 dark:hover:text-ink-300"
          >
            <X className="h-3.5 w-3.5" /> 退出
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-500">
              已答 {answeredCount}/{questions.length}
            </span>
            <span className="text-[10px] text-ink-400">·</span>
            <span className="text-xs font-mono text-primary-600">
              {formatSeconds(elapsed)}
            </span>
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 自动保存提示 */}
      {autoSaved && (
        <div className="fixed top-20 right-4 z-30 inline-flex items-center gap-1.5 text-xs bg-mint-50 text-mint-600 px-3 py-1.5 rounded-full border border-mint-100 shadow-soft animate-fade-in-up">
          <Save className="h-3 w-3" /> 进度已自动保存
        </div>
      )}

      {/* 题目卡片 */}
      <div key={currentQuestion.id} className="animate-fade-in-up">
        <QuestionCard
          question={currentQuestion}
          index={currentIndex}
          total={questions.length}
          selected={answers[currentQuestion.id]}
          onAnswer={answer}
        />
      </div>

      {/* 答题导航 */}
      <div className="flex items-center justify-between mt-8 gap-3">
        <Button
          variant="outline"
          onClick={prev}
          disabled={currentIndex === 0}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          上一题
        </Button>

        {/* 题目导航点 */}
        <div className="hidden sm:flex items-center gap-1.5">
          {questions.map((q, i) => {
            const answered = answers[q.id] !== undefined;
            const isCurrent = i === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => useAssessmentStore.getState().goTo(i)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  isCurrent
                    ? "w-6 bg-primary-600"
                    : answered
                    ? "w-2 bg-primary-400"
                    : "w-2 bg-ink-200 dark:bg-ink-700 hover:bg-ink-300"
                )}
                aria-label={`跳到第 ${i + 1} 题`}
              />
            );
          })}
        </div>

        {isLast ? (
          <Button
            variant="secondary"
            onClick={handleSubmit}
            loading={submitting}
            rightIcon={<Check className="h-4 w-4" />}
          >
            生成报告
          </Button>
        ) : (
          <Button
            onClick={next}
            disabled={answers[currentQuestion.id] === undefined}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            下一题
          </Button>
        )}
      </div>

      {/* 退出确认 */}
      <Modal
        open={confirmExit}
        onClose={() => setConfirmExit(false)}
        title="确定退出测评？"
        description="你的答题进度已自动保存，下次可以继续作答。"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmExit(false)}>
              继续答题
            </Button>
            <Button variant="danger" onClick={handleExit}>
              确认退出
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-600 dark:text-ink-300">
          当前进度：已答 {answeredCount} / {questions.length} 题
        </p>
      </Modal>
    </div>
  );
}
