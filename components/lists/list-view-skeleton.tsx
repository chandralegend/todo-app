import { Skeleton } from "@/components/ui/skeleton";

export function ListViewSkeleton() {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header card skeleton */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-4 mb-3">
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-6 w-48 mb-1" />
        <Skeleton className="h-4 w-64" />
        <div className="flex items-center gap-3 mt-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-14" />
        </div>
        <div className="mt-3">
          <div className="flex justify-between mb-1">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>

      {/* Toolbar skeleton */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-18 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>

      {/* Tabs skeleton */}
      <Skeleton className="h-8 w-36 rounded-lg" />

      {/* Task rows skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card px-4 py-3 flex items-start gap-3">
            <Skeleton className="h-12 w-12 rounded-full hidden sm:block shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-3/5" />
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full ml-auto" />
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-10 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
