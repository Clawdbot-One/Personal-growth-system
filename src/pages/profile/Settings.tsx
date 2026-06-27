import { useState } from "react";
import { User, Bell, Palette, Shield, Download, LogOut, Moon, Sun, Type, Trash2 } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export default function Settings() {
  const { user, isDark, toggleTheme } = useUserStore();
  const [notifications, setNotifications] = useState({
    task: true,
    review: true,
    practice: false,
    weekly: true,
  });
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md");

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="font-serif-cn text-2xl font-semibold text-ink-800 dark:text-ink-100 mb-1">
          账号设置
        </h1>
        <p className="text-sm text-ink-500">管理个人信息、偏好与隐私</p>
      </div>

      {/* 基础信息 */}
      <Card>
        <SectionTitle title="基础信息" icon={<User className="h-5 w-5" />} />
        <div className="space-y-3">
          <Field label="昵称" value={user.nickname} />
          <Field label="手机号" value={user.phone} />
          <Field label="邮箱" value={user.email ?? "未绑定"} />
          <Field label="个人简介" value={user.bio} multiline />
        </div>
        <Button variant="outline" size="sm" className="mt-3">
          编辑信息
        </Button>
      </Card>

      {/* 偏好设置 */}
      <Card>
        <SectionTitle title="偏好设置" icon={<Palette className="h-5 w-5" />} />

        {/* 主题模式 */}
        <div className="flex items-center justify-between py-3 border-b border-ink-100 dark:border-ink-800">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-ink-100 dark:bg-ink-800 flex items-center justify-center">
              {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </div>
            <div>
              <div className="text-sm font-medium text-ink-800 dark:text-ink-100">主题模式</div>
              <div className="text-xs text-ink-500">切换浅色 / 深色主题</div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={toggleTheme}>
            切换到 {isDark ? "浅色" : "深色"}
          </Button>
        </div>

        {/* 字体大小 */}
        <div className="flex items-center justify-between py-3 border-b border-ink-100 dark:border-ink-800">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-ink-100 dark:bg-ink-800 flex items-center justify-center">
              <Type className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-medium text-ink-800 dark:text-ink-100">字体大小</div>
              <div className="text-xs text-ink-500">调整阅读舒适度</div>
            </div>
          </div>
          <div className="flex gap-1">
            {(["sm", "md", "lg"] as const).map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                  fontSize === size
                    ? "bg-primary-600 text-white"
                    : "bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300"
                )}
              >
                {size === "sm" ? "小" : size === "md" ? "中" : "大"}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* 提醒设置 */}
      <Card>
        <SectionTitle title="提醒设置" icon={<Bell className="h-5 w-5" />} />
        <div className="space-y-1">
          {[
            { key: "task" as const, label: "任务提醒", desc: "每日任务到期前推送" },
            { key: "review" as const, label: "复盘提醒", desc: "每周日 / 月末触发" },
            { key: "practice" as const, label: "实践打卡提醒", desc: "推荐实践与未完成打卡" },
            { key: "weekly" as const, label: "周报推送", desc: "每周一发送成长数据周报" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2.5">
              <div>
                <div className="text-sm font-medium text-ink-800 dark:text-ink-100">{item.label}</div>
                <div className="text-xs text-ink-500">{item.desc}</div>
              </div>
              <ToggleSwitch
                checked={notifications[item.key]}
                onChange={(v) => setNotifications({ ...notifications, [item.key]: v })}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* 隐私与安全 */}
      <Card>
        <SectionTitle title="隐私与安全" icon={<Shield className="h-5 w-5" />} />
        <div className="space-y-2">
          <ActionRow icon={<Shield className="h-4 w-4" />} label="修改密码" desc="上次修改：30 天前" />
          <ActionRow icon={<LogOut className="h-4 w-4" />} label="登录设备管理" desc="当前共 2 台设备" badge="查看" />
          <ActionRow icon={<Download className="h-4 w-4" />} label="导出我的数据" desc="下载全部个人数据" badge="导出" />
        </div>
      </Card>

      {/* 危险操作 */}
      <Card className="border-red-200 dark:border-red-500/20">
        <SectionTitle title="账号操作" icon={<Trash2 className="h-5 w-5 text-red-500" />} />
        <div className="space-y-2">
          <button
            onClick={() => alert("数据重置功能演示：将清空所有成长数据（不可恢复）")}
            className="w-full text-left p-3 rounded-xl border border-red-100 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/5 transition-colors"
          >
            <div className="text-sm font-medium text-red-700 dark:text-red-400">重置所有数据</div>
            <div className="text-xs text-ink-500 mt-0.5">清空测评、目标、对话记录，重新开始</div>
          </button>
          <button
            onClick={() => alert("账号注销功能演示：将永久删除账号与所有数据")}
            className="w-full text-left p-3 rounded-xl border border-red-100 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/5 transition-colors"
          >
            <div className="text-sm font-medium text-red-700 dark:text-red-400">注销账号</div>
            <div className="text-xs text-ink-500 mt-0.5">永久删除账号与全部数据，不可恢复</div>
          </button>
        </div>
      </Card>

      <div className="text-center text-xs text-ink-400 pt-4">
        优伴 AI v1.0.0 · 发现天赋 · 精准成长
      </div>
    </div>
  );
}

function Field({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-ink-100 dark:border-ink-800 last:border-0">
      <div className="text-xs text-ink-500 w-20 shrink-0 pt-0.5">{label}</div>
      <div className={cn("text-sm text-ink-700 dark:text-ink-200 flex-1", multiline && "leading-relaxed")}>
        {value}
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 rounded-full transition-colors shrink-0",
        checked ? "bg-primary-600" : "bg-ink-300 dark:bg-ink-700"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

function ActionRow({
  icon,
  label,
  desc,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  badge?: string;
}) {
  return (
    <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors text-left">
      <div className="h-8 w-8 rounded-lg bg-ink-100 dark:bg-ink-800 flex items-center justify-center text-ink-600 dark:text-ink-300">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-ink-800 dark:text-ink-100">{label}</div>
        <div className="text-xs text-ink-500">{desc}</div>
      </div>
      {badge && (
        <Badge color="gray" size="sm">{badge}</Badge>
      )}
    </button>
  );
}
