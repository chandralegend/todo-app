"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ClipboardList, Plus, ArrowUpDown, Search, List, LayoutGrid } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { BentoCard } from "@/components/ui/bento-card";
import { PillButton } from "@/components/ui/pill-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ImportanceBadge } from "@/components/ui/importance-badge";
import { CircularDate } from "@/components/ui/circular-date";
import { ProgressRing } from "@/components/ui/progress-ring";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { FilterChip, FilterChipGroup } from "@/components/ui/filter-chip";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TaskEditSheet } from "@/components/lists/task-edit-sheet";
import { KanbanBoard } from "@/components/lists/kanban-board";
import { QuickAddDialog } from "@/components/lists/quick-add-dialog";

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

interface ListViewContentProps {
  list: ListInfo;
  tasks: SerializedTask[];
  allowedStatuses: Record<string, string[]>;
  canWrite: boolean;
  currentFilters: {
    status: string;
    importance: string;
    due: string;
    sort: string;
    tag: string;
  };
  updateTaskStatusAction: (formData: FormData) => Promise<void>;
  editTaskAction: (formData: FormData) => Promise<void>;
  deleteTaskAction: (formData: FormData) => Promise<void>;
  quickCreateTaskAction: (formData: FormData) => Promise<void>;
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
  currentFilters,
  updateTaskStatusAction,
  editTaskAction,
  deleteTaskAction,
  quickCreateTaskAction,
}: ListViewContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [editingTask, setEditingTask] = useState<SerializedTask | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

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
    <AppShell>
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
            <div className="flex items-center gap-2">
              <PillButton size="sm" onClick={() => setQuickAddOpen(true)}>
                <Plus className="size-3.5" /> Quick Add
              </PillButton>
              <Link href={`/lists/${list.id}/tasks/new`}>
                <PillButton size="sm" variant="outline" showArrow={false}>
                  Full Form
                </PillButton>
              </Link>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
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
      <FilterChipGroup className="mb-4">
        {duePills.map((pill) => (
          <button
            key={pill.value}
            onClick={() => router.push(buildFilterUrl({ due: pill.value }))}
            className="cursor-pointer"
          >
            <FilterChip
              label={pill.label}
              active={currentFilters.due === pill.value}
            />
          </button>
        ))}
      </FilterChipGroup>

      {/* Active filters + sort row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <FilterChipGroup>
          {currentFilters.status !== "ALL" && (
            <FilterChip
              label="Status:"
              value={currentFilters.status.replace("_", " ")}
              active
              onRemove={() => router.push(buildFilterUrl({ status: "ALL" }))}
            />
          )}
          {currentFilters.importance !== "ALL" && (
            <FilterChip
              label="Importance:"
              value={currentFilters.importance}
              active
              onRemove={() => router.push(buildFilterUrl({ importance: "ALL" }))}
            />
          )}
          {currentFilters.tag && (
            <FilterChip
              label="Tag:"
              value={`#${currentFilters.tag}`}
              active
              onRemove={() => router.push(buildFilterUrl({ tag: "" }))}
            />
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
              className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer py-2 px-1"
            >
              Clear all
            </button>
          )}

          {/* Add filter dropdown trigger */}
          <FilterDropdown
            currentFilters={currentFilters}
            onApply={(overrides) => router.push(buildFilterUrl(overrides))}
          />
        </FilterChipGroup>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="size-3.5 text-muted-foreground" />
          <select
            value={currentFilters.sort}
            onChange={(e) =>
              router.push(buildFilterUrl({ sort: e.target.value }))
            }
            className="h-10 sm:h-8 rounded-lg border border-border bg-card px-2.5 py-1 text-sm sm:text-xs cursor-pointer"
          >
            <option value="created_desc">Newest</option>
            <option value="deadline_asc">Deadline</option>
            <option value="importance_desc">Importance</option>
          </select>
        </div>
      </div>

      {/* View toggle tabs */}
      <Tabs defaultValue="list">
        <TabsList className="mb-4">
          <TabsTrigger value="list">
            <List className="size-3.5" />
            List
          </TabsTrigger>
          <TabsTrigger value="board">
            <LayoutGrid className="size-3.5" />
            Board
          </TabsTrigger>
        </TabsList>

        {/* List View */}
        <TabsContent value="list">
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
            <div className="space-y-3 max-w-3xl">
              {tasks.map((task) => {
                const overdue = isOverdue(task.deadlineAt, task.status);
                const deadline = task.deadlineAt
                  ? new Date(task.deadlineAt)
                  : null;

                return (
                  <BentoCard
                    key={task.id}
                    accent={overdue ? "destructive" : task.status === "COMPLETED" ? "success" : "none"}
                    className={`flex items-start gap-4 !p-4 ${task.status === "COMPLETED" ? "opacity-70" : ""}`}
                    onClick={() => {
                      setEditingTask(task);
                      setSheetOpen(true);
                    }}
                  >
                    {/* Circular date */}
                    {deadline && (
                      <CircularDate
                        date={deadline}
                        overdue={overdue}
                        className="hidden sm:flex shrink-0"
                      />
                    )}

                    {/* Task content — matches /design task card */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className={`font-semibold text-sm ${
                            task.status === "COMPLETED"
                              ? "line-through text-muted-foreground"
                              : ""
                          }`}
                        >
                          {task.descriptionSnapshot}
                        </h4>
                        <ImportanceBadge importance={task.importanceSnapshot} />
                      </div>

                      {/* Due text */}
                      {deadline && (
                        <p
                          className={`text-xs mt-0.5 ${
                            overdue
                              ? "text-destructive font-medium"
                              : "text-muted-foreground"
                          }`}
                        >
                          {formatDue(task.deadlineAt)}
                        </p>
                      )}

                      {/* Tags + StatusBadge inline — matches /design */}
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {task.tagsSnapshot.map((tag) => (
                          <button
                            key={tag}
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(buildFilterUrl({ tag }));
                            }}
                            className="cursor-pointer"
                          >
                            <Badge variant="secondary">#{tag}</Badge>
                          </button>
                        ))}
                        <StatusBadge status={task.status} className="ml-auto" />
                      </div>
                    </div>
                  </BentoCard>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Board (Kanban) View */}
        <TabsContent value="board">
          {tasks.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No tasks yet"
              description="Add a task to see it on the board."
              action={
                canWrite ? (
                  <Link href={`/lists/${list.id}/tasks/new`}>
                    <PillButton>Add Task</PillButton>
                  </Link>
                ) : null
              }
            />
          ) : (
            <KanbanBoard
              tasks={tasks}
              updateTaskStatusAction={updateTaskStatusAction}
              onTaskClick={(task) => {
                setEditingTask(task);
                setSheetOpen(true);
              }}
            />
          )}
        </TabsContent>
      </Tabs>
      {/* Quick Add Dialog */}
      <QuickAddDialog
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
        listId={list.id}
        createTaskAction={quickCreateTaskAction}
      />

      {/* Task Edit Sheet */}
      <TaskEditSheet
        task={editingTask}
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setEditingTask(null);
        }}
        allowedStatuses={editingTask ? (allowedStatuses[editingTask.id] ?? []) : []}
        canWrite={canWrite}
        editTaskAction={editTaskAction}
        deleteTaskAction={deleteTaskAction}
      />
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
      <summary className="text-xs text-primary hover:text-primary/80 cursor-pointer select-none font-medium py-2 px-1">
        + Add Filter
      </summary>
      <div className="absolute top-full left-0 mt-1 z-50 w-56 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-card p-3 shadow-lg">
        <div className="space-y-3">
          <div>
            <p className="text-[0.65rem] uppercase tracking-widest text-muted-foreground mb-1.5">
              Status
            </p>
            <div className="flex flex-wrap gap-1.5">
              {statusOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => onApply({ status: s })}
                  className="cursor-pointer"
                >
                  <FilterChip
                    label={s.replace("_", " ")}
                    active={currentFilters.status === s}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[0.65rem] uppercase tracking-widest text-muted-foreground mb-1.5">
              Importance
            </p>
            <div className="flex flex-wrap gap-1.5">
              {importanceOptions.map((i) => (
                <button
                  key={i}
                  onClick={() => onApply({ importance: i })}
                  className="cursor-pointer"
                >
                  <FilterChip
                    label={i}
                    active={currentFilters.importance === i}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </details>
  );
}
