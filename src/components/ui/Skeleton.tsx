import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  rounded?: "md" | "lg" | "full";
}

const roundedClass = {
  md: "rounded-md",
  lg: "rounded-xl",
  full: "rounded-full",
};

export function Skeleton({ className, rounded = "md" }: SkeletonProps) {
  return <div className={cn("skeleton", roundedClass[rounded], className)} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
      <Skeleton className="h-5 w-2/3 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-4/5 mb-4" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" rounded="full" />
        <Skeleton className="h-6 w-16" rounded="full" />
      </div>
    </div>
  );
}
