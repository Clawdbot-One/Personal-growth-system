import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Compass, Target, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { pickAvatarGradient } from "@/config/theme";

const steps = [
  {
    icon: Compass,
    title: "发现你的天赋优势",
    desc: "通过 3 种模式测评，识别你的核心优势、盲区与适配方向",
    color: "from-primary-500 to-primary-700",
    illustration: "compass",
  },
  {
    icon: Target,
    title: "AI 拆解成长路径",
    desc: "结合优势画像，自动拆解为里程碑、月/周/日任务",
    color: "from-accent-500 to-amber-500",
    illustration: "target",
  },
  {
    icon: Sparkles,
    title: "全程 AI 陪伴执行",
    desc: "对话答疑、周期复盘、激励提醒，让成长不再孤单",
    color: "from-mint-500 to-mint-600",
    illustration: "sparkles",
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState("");

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      navigate("/assessment");
    }
  };

  const skip = () => navigate("/");

  const current = steps[step];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-hero flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl" />
      </div>

      <button
        onClick={skip}
        className="absolute top-6 right-6 text-xs text-white/70 hover:text-white transition-colors"
      >
        跳过 →
      </button>

      <div className="relative w-full max-w-md">
        {/* 进度指示 */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i <= step ? "w-8 bg-white" : "w-1.5 bg-white/30"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-center text-white"
          >
            {/* 插画 */}
            <div className="relative mx-auto mb-8 h-40 w-40">
              <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${current.color} blur-2xl opacity-40`} />
              <div className={`relative h-40 w-40 rounded-3xl bg-gradient-to-br ${current.color} flex items-center justify-center shadow-lift`}>
                <Icon className="h-20 w-20 text-white" />
                <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-accent-500 flex items-center justify-center ring-4 ring-white/20">
                  <Check className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>

            <h2 className="font-serif-cn text-2xl font-semibold mb-3">
              {current.title}
            </h2>
            <p className="text-sm text-white/80 mb-8 leading-relaxed max-w-sm mx-auto">
              {current.desc}
            </p>

            {/* 最后一步：昵称 */}
            {step === steps.length - 1 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-6"
              >
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="输入你的昵称开始"
                  className="w-full px-4 py-3 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/50 text-center focus:outline-none focus:bg-white/20 focus:border-white/40"
                />
              </motion.div>
            )}

            <Button
              onClick={next}
              size="lg"
              variant="secondary"
              className="w-full"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              {step === steps.length - 1 ? "开始第一次测评" : "下一步"}
            </Button>

            {step < steps.length - 1 && (
              <button
                onClick={skip}
                className="mt-4 text-xs text-white/60 hover:text-white/80"
              >
                稍后再说
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
