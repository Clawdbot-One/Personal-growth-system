import { Link } from "react-router-dom";
import {
  Settings,
  Crown,
  Archive,
  ChevronRight,
  Flame,
  Clock,
  Award,
  Sparkles,
  Compass,
  Target,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DonutProgress } from "@/components/charts/DonutProgress";
import { pickAvatarGradient } from "@/config/theme";
import { formatMinutes, formatDate, DIMENSION_LABELS, DIMENSION_COLORS } from "@/lib/utils";
import { mockAssessmentHistory } from "@/mock/assessment";
import { mockGoals } from "@/mock/goal";

export default function ProfileHome() {
  const { user, profile, overview } = useUserStore();

  if (!user) return null;

  const stats = [
    { icon: Flame, label: "连续成长", value: `${user.streakDays} 天`, color: "text-accent-600" },
    { icon: Clock, label: "累计时长", value: formatMinutes(user.totalGrowthMinutes), color: "text-primary-600" },
    { icon: Award, label: "成长积分", value: `${user.points}`, color: "text-amber-600" },
    { icon: Compass, label: "测评次数", value: `${overview?.assessmentCount ?? mockAssessmentHistory.length}`, color: "text-mint-600" },
  ];

  return (
    <div className="space-y-6">
      {/* 个人信息卡 */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-hero" />
        <div className="relative pt-12">
          <div className="flex items-end justify-between gap-3 mb-4">
            <div className="flex items-end gap-3">
              <div
                className="h-20 w-20 rounded-2xl flex items-center justify-center text-white text-2xl font-semibold shadow-lift ring-4 ring-white dark:ring-ink-900"
                style={{ background: pickAvatarGradient(user.id) }}
              >
                {user.nickname.slice(0, 1)}
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-serif-cn text-xl font-semibold text-ink-800 dark:text-ink-100">
                    {user.nickname}
                  </h1>
                  {user.memberLevel === "premium" ? (
                    <Badge color="amber"><Crown className="h-3 w-3" /> Pro</Badge>
                  ) : (
                    <Badge color="gray">免费版</Badge>
                  )}
                </div>
                <p className="text-xs text-ink-500 mt-0.5">
                  {user.phone} · 加入于 {formatDate(user.createdAt)}
                </p>
              </div>
            </div>
            <Link to="/profile/settings">
              <Button variant="outline" size="sm" leftIcon={<Settings className="h-4 w-4" />}>
                设置
              </Button>
            </Link>
          </div>

          <p className="text-sm text-ink-600 dark:text-ink-300 mb-4">{user.bio}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-xl bg-ink-50 dark:bg-ink-800 p-3">
                  <Icon className={`h-4 w-4 mb-1.5 ${s.color}`} />
                  <div className="font-display text-base font-semibold text-ink-800 dark:text-ink-100">
                    {s.value}
                  </div>
                  <div className="text-[11px] text-ink-500">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 优势画像概览 */}
        <Card className="lg:col-span-2">
          <SectionTitle
            title="我的优势画像"
            subtitle={`最新版本 v${profile?.version} · ${profile ? formatDate(profile.generatedAt) : ""}`}
            icon={<Compass className="h-5 w-5" />}
            action={
              <Link to="/assessment/report/ar_003">
                <Button variant="ghost" size="sm">查看完整报告</Button>
              </Link>
            }
          />
          {profile && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                {profile.topStrengths.slice(0, 3).map((s, i) => (
                  <div key={s.name} className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-semibold">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-ink-800 dark:text-ink-100 truncate">
                        {s.name}
                      </div>
                      <div className="text-[10px] text-ink-500">{DIMENSION_LABELS[s.category]}</div>
                    </div>
                    <span className="font-display text-sm font-semibold text-primary-600">{s.score}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {Object.entries(profile.dimensions).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2">
                    <span className="text-xs text-ink-500 w-16 shrink-0">
                      {DIMENSION_LABELS[k]}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${v}%`, background: DIMENSION_COLORS[k] }}
                      />
                    </div>
                    <span className="text-xs font-semibold w-7 text-right" style={{ color: DIMENSION_COLORS[k] }}>
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* 成长概览 */}
        <Card>
          <SectionTitle title="成长概览" icon={<TrendingUp className="h-5 w-5" />} />
          <div className="flex flex-col items-center py-2">
            <DonutProgress
              value={profile?.dimensions.talent ?? 0}
              size={96}
              strokeWidth={8}
              label="%"
              sublabel="优势强化"
              color="#10B981"
            />
            <div className="grid grid-cols-2 gap-2 w-full mt-4 text-center">
              <div className="rounded-lg bg-ink-50 dark:bg-ink-800 p-2">
                <Target className="h-3 w-3 text-primary-500 mx-auto mb-0.5" />
                <div className="text-xs font-semibold text-ink-700 dark:text-ink-200">
                  {mockGoals.length}
                </div>
                <div className="text-[10px] text-ink-500">活跃目标</div>
              </div>
              <div className="rounded-lg bg-ink-50 dark:bg-ink-800 p-2">
                <BookOpen className="h-3 w-3 text-accent-500 mx-auto mb-0.5" />
                <div className="text-xs font-semibold text-ink-700 dark:text-ink-200">
                  {mockGoals.reduce((acc, g) => acc + g.milestones.reduce((a, m) => a + m.tasks.length, 0), 0)}
                </div>
                <div className="text-[10px] text-ink-500">总任务数</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 功能入口 */}
      <div className="grid sm:grid-cols-3 gap-3">
        <Link to="/profile/archive">
          <Card hover className="cursor-pointer h-full">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center">
                <Archive className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-ink-800 dark:text-ink-100">成长档案</div>
                <div className="text-xs text-ink-500">时间线 · 数据可视化</div>
              </div>
              <ChevronRight className="h-4 w-4 text-ink-400" />
            </div>
          </Card>
        </Link>

        <Link to="/profile/membership">
          <Card hover className="cursor-pointer h-full">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Crown className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-ink-800 dark:text-ink-100">会员权益</div>
                <div className="text-xs text-ink-500">升级 Pro · 解锁深度版</div>
              </div>
              <ChevronRight className="h-4 w-4 text-ink-400" />
            </div>
          </Card>
        </Link>

        <Link to="/profile/settings">
          <Card hover className="cursor-pointer h-full">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 flex items-center justify-center">
                <Settings className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-ink-800 dark:text-ink-100">账号设置</div>
                <div className="text-xs text-ink-500">信息 · 偏好 · 隐私</div>
              </div>
              <ChevronRight className="h-4 w-4 text-ink-400" />
            </div>
          </Card>
        </Link>
      </div>

      {/* 会员升级 CTA */}
      {user.memberLevel === "free" && (
        <Card className="relative overflow-hidden bg-gradient-hero text-white border-0">
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-accent-500/30 blur-2xl" />
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-serif-cn text-lg font-semibold">升级优伴 Pro</h3>
                <p className="text-sm text-white/80">解锁深度访谈版测评 + 无限 AI 对话 + 高级报告导出</p>
              </div>
            </div>
            <Link to="/profile/membership">
              <Button variant="secondary" rightIcon={<ChevronRight className="h-4 w-4" />}>
                查看权益
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
