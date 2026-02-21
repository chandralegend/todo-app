import { Skeleton } from "@/components/ui/skeleton";

export function ListViewSkeleton() {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-3 w-3" />
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-3 w-3" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Header card skeleton */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Skeleton className="h-6 w-48 mb-1" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>
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

      {/* Table skeleton */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-b border-border bg-muted/30">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-10 hidden sm:block" />
          <Skeleton className="h-3 w-16 hidden md:block" />
          <Skeleton className="h-3 w-8 hidden sm:block" />
          <Skeleton className="h-3 w-10 hidden lg:block" />
        </div>
        {/* Rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-5 w-16 rounded-full hidden sm:block" />
            <Skeleton className="h-5 w-14 rounded-full hidden md:block" />
            <Skeleton className="h-3 w-16 hidden sm:block" />
            <div className="hidden lg:flex gap-1">
              <Skeleton className="h-4 w-10 rounded-full" />
              <Skeleton className="h-4 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
