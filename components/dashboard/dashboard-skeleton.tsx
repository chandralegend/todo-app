import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Stat cards skeleton */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-10" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Section header skeleton */}
      <div className="space-y-1">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-3 w-40" />
      </div>

      {/* List cards skeleton */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-1 w-full mt-3 rounded-full" />
            <Skeleton className="h-2 w-16 mt-1" />
            <div className="flex gap-1 mt-2">
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-5 w-10 rounded-full" />
            </div>
            <Skeleton className="h-7 w-16 mt-3 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
