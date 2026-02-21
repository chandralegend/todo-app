import { Skeleton } from "@/components/ui/skeleton";

export function ListViewSkeleton() {
  return (
    <div className="animate-in fade-in duration-300">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        </div>
        <div className="flex items-center gap-4 mt-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Filter pills skeleton */}
      <div className="flex items-center gap-2 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-20 rounded-full" />
        ))}
      </div>

      {/* Tabs skeleton */}
      <Skeleton className="h-8 w-40 rounded-lg mb-4" />

      {/* Task cards skeleton — matches /design card layout */}
      <div className="space-y-3 max-w-2xl">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4 flex items-start gap-4">
            <Skeleton className="h-14 w-14 rounded-full hidden sm:block shrink-0" />
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <Skeleton className="h-3 w-24 mt-1" />
              <div className="flex items-center gap-1.5 mt-2">
                <Skeleton className="h-5 w-12 rounded-full" />
                <Skeleton className="h-5 w-10 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full ml-auto" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
