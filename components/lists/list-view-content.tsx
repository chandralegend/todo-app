"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ClipboardList, Plus, ArrowUpDown, Search } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { BentoCard } from "@/components/ui/bento-card";
import { PillButton } from "@/components/ui/pill-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ImportanceBadge } from "@/components/ui/importance-badge";
import { CircularDate } from "@/components/ui/circular-date";
import { ProgressRing } from "@/components/ui/progress-ring";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

type TaskStatus = "DRAFT" | "TODO" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
type Importance = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

type SerializedTask = {
  id: string;
  descriptionSnapshot: string;
  status: TaskStatus;
  importanceSnapshot: Importance;
  deadlineAt: string | null;
  tagsSnapshot: string[];
  occurrenceDate: string;
};

type ListInfo = {
  id: string;
  name: string;
  description: string | null;
  totalTasks: number;
  overdueCount: number;
  completedCount: number;
  progress: number;
};

type SidebarListItem = {
  id: string;
  name: string;
  taskCount: number;
};

interface ListViewContentProps {
  list: ListInfo;
  tasks: SerializedTask[];
  allowedStatuses: Record<string, string[]>;
  canWrite: boolean;
  sidebarLists: SidebarListItem[];
  currentFilters: {
    status: string;
    importance: string;
    due: string;
    sort: string;
    tag: string;
  };
  updateTaskStatusAction: (formData: FormData) => Promise<void>;
}

const duePills = [
  { value: "all", label: "All" },
  { value: "today", label: "Today" },
  { value: "overdue", label: "Overdue" },
  { value: "upcoming", label: "Upcoming" },
];

function isOverdue(deadlineAt: string | null, status: string): boolean {
  if (!deadlineAt) return false;
  if (status === "COMPLETED" || status === "FAILED") return false;
  return new Date(deadlineAt) < new Date();
}

function formatDue(deadlineAt: string | null): string {
  if (!deadlineAt) return "No deadline";
  const d = new Date(deadlineAt);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < -1) return `${Math.abs(diffDays)} days overdue`;
  if (diffDays === -1) return "1 day overdue";
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays <= 7) return `Due in ${diffDays} days`;
  return `Due ${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

export function ListViewContent({
  list,
  tasks,
  allowedStatuses,
  canWrite,
  sidebarLists,
  currentFilters,
  updateTaskStatusAction,
}: ListViewContentProps) {
  const router = useRouter();
  const pathname = usePathname();

  function buildFilterUrl(overrides: Partial<typeof currentFilters>) {
    const merged = { ...currentFilters, ...overrides };
    const params = new URLSearchParams();
    if (merged.status !== "ALL") params.set("status", merged.status);
    if (merged.importance !== "ALL")
      params.set("importance", merged.importance);
    if (merged.due !== "all") params.set("due", merged.due);
    if (merged.sort !== "created_desc") params.set("sort", merged.sort);
    if (merged.tag) params.set("tag", merged.tag);
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  const hasActiveFilters =
    currentFilters.status !== "ALL" ||
    currentFilters.importance !== "ALL" ||
    currentFilters.tag !== "";

  return (
    <AppShell
      lists={sidebarLists}
      breadcrumbOverrides={{ [list.id]: list.name }}
    >
      {/* List header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{list.name}</h1>
            {list.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {list.description}
              </p>
            )}
          </div>
          {canWrite && (
            <Link href={`/lists/${list.id}/tasks/new`}>
              <PillButton size="sm">
                <Plus className="size-3.5" /> New Task
              </PillButton>
            </Link>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
          <span>{list.totalTasks} tasks</span>
          <span className="text-border">|</span>
          {list.overdueCount > 0 && (
            <>
              <span className="text-destructive font-medium">
                {list.overdueCount} overdue
              </span>
              <span className="text-border">|</span>
            </>
          )}
          <div className="flex items-center gap-2">
            <ProgressRing value={list.progress} size="sm" showLabel={false} />
            <span>{list.progress}% complete</span>
          </div>
        </div>
      </div>

      {/* Due filter pills */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {duePills.map((pill) => (
          <button
            key={pill.value}
            onClick={() => router.push(buildFilterUrl({ due: pill.value }))}
            className={`rounded-full px-4 py-1.5 text-xs font-medium border transition-colors cursor-pointer ${
              currentFilters.due === pill.value
                ? "bg-foreground text-background border-foreground"
                : "bg-card text-foreground border-border hover:bg-muted"
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Active filters + sort row */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {currentFilters.status !== "ALL" && (
            <span className="filter-chip inline-flex items-center gap-1.5 rounded-full border border-foreground bg-foreground text-background px-3 py-1 text-xs font-medium">
              <span className="opacity-60">Status:</span>
              {currentFilters.status.replace("_", " ")}
              <button
                onClick={() => router.push(buildFilterUrl({ status: "ALL" }))}
                className="ml-0.5 hover:opacity-70 cursor-pointer"
              >
                x
              </button>
            </span>
          )}
          {currentFilters.importance !== "ALL" && (
            <span className="filter-chip inline-flex items-center gap-1.5 rounded-full border border-foreground bg-foreground text-background px-3 py-1 text-xs font-medium">
              <span className="opacity-60">Importance:</span>
              {currentFilters.importance}
              <button
                onClick={() =>
                  router.push(buildFilterUrl({ importance: "ALL" }))
                }
                className="ml-0.5 hover:opacity-70 cursor-pointer"
              >
                x
              </button>
            </span>
          )}
          {currentFilters.tag && (
            <span className="filter-chip inline-flex items-center gap-1.5 rounded-full border border-foreground bg-foreground text-background px-3 py-1 text-xs font-medium">
              <span className="opacity-60">Tag:</span>
              #{currentFilters.tag}
              <button
                onClick={() => router.push(buildFilterUrl({ tag: "" }))}
                className="ml-0.5 hover:opacity-70 cursor-pointer"
              >
                x
              </button>
            </span>
          )}
          {hasActiveFilters && (
            <button
              onClick={() =>
                router.push(
                  buildFilterUrl({
                    status: "ALL",
                    importance: "ALL",
                    tag: "",
                  })
                )
              }
              className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Clear all
            </button>
          )}

          {/* Add filter dropdown trigger */}
          <FilterDropdown
            currentFilters={currentFilters}
            onApply={(overrides) => router.push(buildFilterUrl(overrides))}
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="size-3.5 text-muted-foreground" />
          <select
            value={currentFilters.sort}
            onChange={(e) =>
              router.push(buildFilterUrl({ sort: e.target.value }))
            }
            className="h-8 rounded-lg border border-border bg-card px-2.5 py-1 text-xs cursor-pointer"
          >
            <option value="created_desc">Newest</option>
            <option value="deadline_asc">Deadline</option>
            <option value="importance_desc">Importance</option>
          </select>
        </div>
      </div>

      {/* Task cards */}
      {tasks.length === 0 ? (
        <EmptyState
          icon={hasActiveFilters ? Search : ClipboardList}
          title={hasActiveFilters ? "No tasks match" : "No tasks yet"}
          description={
            hasActiveFilters
              ? "Try adjusting your filters to find tasks."
              : "Add a task to get started!"
          }
          action={
            hasActiveFilters ? (
              <Button
                variant="outline"
                onClick={() =>
                  router.push(
                    buildFilterUrl({
                      status: "ALL",
                      importance: "ALL",
                      due: "all",
                      tag: "",
                    })
                  )
                }
              >
                Clear Filters
              </Button>
            ) : canWrite ? (
              <Link href={`/lists/${list.id}/tasks/new`}>
                <PillButton>Add Task</PillButton>
              </Link>
            ) : null
          }
        />
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const overdue = isOverdue(task.deadlineAt, task.status);
            const deadline = task.deadlineAt
              ? new Date(task.deadlineAt)
              : null;

            return (
              <BentoCard
                key={task.id}
                accent={overdue ? "destructive" : "none"}
                interactive={false}
                className="p-4"
              >
                <div className="flex items-start gap-4">
                  {/* Circular date */}
                  {deadline && (
                    <CircularDate
                      date={deadline}
                      overdue={overdue}
                      size="md"
                      className="hidden sm:flex shrink-0"
                    />
                  )}

                  {/* Task content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h3
                        className={`text-sm font-medium leading-snug ${
                          task.status === "COMPLETED"
                            ? "line-through text-muted-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {task.descriptionSnapshot}
                      </h3>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <ImportanceBadge
                          importance={task.importanceSnapshot}
                        />
                      </div>
                    </div>

                    {/* Deadline text (visible on mobile when no circular date) */}
                    {deadline && (
                      <p
                        className={`text-xs mt-1 ${
                          overdue
                            ? "text-destructive font-medium"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatDue(task.deadlineAt)}
                      </p>
                    )}

                    {/* Tags */}
                    {task.tagsSnapshot.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {task.tagsSnapshot.map((tag) => (
                          <button
                            key={tag}
                            onClick={() =>
                              router.push(buildFilterUrl({ tag }))
                            }
                            className="text-[0.65rem] text-muted-foreground bg-muted px-2 py-0.5 rounded-full hover:bg-muted/80 transition-colors cursor-pointer"
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Status row */}
                    <div className="flex items-center gap-2 mt-3">
                      <StatusBadge status={task.status} />

                      {canWrite && (
                        <form
                          action={updateTaskStatusAction}
                          className="flex items-center gap-1.5 ml-auto"
                        >
                          <input
                            type="hidden"
                            name="taskId"
                            value={task.id}
                          />
                          <select
                            name="status"
                            defaultValue={task.status}
                            className="h-7 rounded-lg border border-border bg-card px-2 py-0.5 text-xs cursor-pointer"
                          >
                            {(allowedStatuses[task.id] ?? []).map(
                              (option: string) => (
                                <option key={option} value={option}>
                                  {option.replace("_", " ")}
                                </option>
                              )
                            )}
                          </select>
                          <Button
                            type="submit"
                            size="sm"
                            variant="outline"
                            className="h-7 px-2.5 text-xs"
                          >
                            Update
                          </Button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </BentoCard>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

/* ---- Filter dropdown inline ---- */

function FilterDropdown({
  currentFilters,
  onApply,
}: {
  currentFilters: { status: string; importance: string; tag: string };
  onApply: (overrides: { status?: string; importance?: string; tag?: string }) => void;
}) {
  const statusOptions = [
    "DRAFT", "TODO", "IN_PROGRESS", "COMPLETED", "FAILED",
  ];
  const importanceOptions = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

  return (
    <details className="relative">
      <summary className="text-xs text-primary hover:text-primary/80 cursor-pointer select-none font-medium">
        + Add Filter
      </summary>
      <div className="absolute top-full left-0 mt-1 z-50 w-56 rounded-xl border border-border bg-card p-3 shadow-lg">
        <div className="space-y-3">
          <div>
            <p className="text-[0.65rem] uppercase tracking-widest text-muted-foreground mb-1.5">
              Status
            </p>
            <div className="flex flex-wrap gap-1">
              {statusOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => onApply({ status: s })}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                    currentFilters.status === s
                      ? "bg-foreground text-background border-foreground"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[0.65rem] uppercase tracking-widest text-muted-foreground mb-1.5">
              Importance
            </p>
            <div className="flex flex-wrap gap-1">
              {importanceOptions.map((i) => (
                <button
                  key={i}
                  onClick={() => onApply({ importance: i })}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                    currentFilters.importance === i
                      ? "bg-foreground text-background border-foreground"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </details>
  );
}
