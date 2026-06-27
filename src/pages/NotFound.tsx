import { Link } from "react-router-dom";
import { Home, Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-50 dark:bg-ink-950 p-4">
      <div className="text-center">
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-primary-200/40 blur-3xl rounded-full" />
          <div className="relative">
            <div className="font-display text-8xl sm:text-9xl font-bold text-gradient-primary">
              404
            </div>
          </div>
        </div>

        <h1 className="font-serif-cn text-xl font-semibold text-ink-800 dark:text-ink-100 mb-2">
          页面走丢了
        </h1>
        <p className="text-sm text-ink-500 max-w-sm mx-auto mb-6">
          可能是链接有误，或该页面还未上线。让我们带你回到正轨。
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link to="/">
            <Button leftIcon={<Home className="h-4 w-4" />}>回到工作台</Button>
          </Link>
          <Link to="/assessment">
            <Button variant="outline" leftIcon={<Compass className="h-4 w-4" />}>
              去做测评
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
