import { NavLink, useLocation } from "react-router-dom";
import { MOBILE_TAB_ITEMS } from "@/config/nav";
import { cn } from "@/lib/utils";

export function MobileTabBar() {
  const location = useLocation();
  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className={cn(
        "lg:hidden fixed bottom-0 inset-x-0 z-30",
        "bg-white/95 dark:bg-ink-900/95 backdrop-blur-md",
        "border-t border-ink-100 dark:border-ink-800",
        "pb-[env(safe-area-inset-bottom)]"
      )}
    >
      <div className="grid grid-cols-5">
        {MOBILE_TAB_ITEMS.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center gap-0.5 py-2 text-[11px]"
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg transition-all",
                  active
                    ? "bg-primary-600 text-white shadow-soft scale-105"
                    : "text-ink-500 dark:text-ink-400"
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className={cn(active ? "text-primary-600 font-medium" : "text-ink-500")}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
