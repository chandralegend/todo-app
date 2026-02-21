"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ClipboardList,
  Plus,
  ArrowUpDown,
  Search,
  List,
  LayoutGrid,
  ArrowLeft,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PillButton } from "@/components/ui/pill-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ImportanceBadge } from "@/components/ui/importance-badge";
import { CircularDate } from "@/components/ui/circular-date";
import { Progress } from "@/components/ui/progress";
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

  if (diffDays < -1) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays === -1) return "1d overdue";
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7) return `In ${diffDays} days`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
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
      <div className="space-y-5">
        {/* ── Header card ── */}
        <div className="rounded-2xl border border-border bg-card p-5">
          {/* Back link + actions row */}
          <div className="flex items-center justify-between gap-4 mb-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              Dashboard
            </Link>
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

          {/* Title + description */}
          <h1 className="text-xl font-bold tracking-tight">{list.name}</h1>
          {list.description && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {list.description}
            </p>
          )}

          {/* Stats row + progress bar */}
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <ClipboardList className="size-3.5" />
                {list.totalTasks} {list.totalTasks === 1 ? "task" : "tasks"}
              </span>
              {list.overdueCount > 0 && (
                <span className="inline-flex items-center gap-1.5 text-sm text-destructive font-medium">
                  <AlertTriangle className="size-3.5" />
                  {list.overdueCount} overdue
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <CheckCircle2 className="size-3.5" />
                {list.completedCount} done
              </span>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Progress</span>
                <span className="text-xs font-semibold">{list.progress}%</span>
              </div>
              <Progress value={list.progress} />
            </div>
          </div>
        </div>

        {/* ── Toolbar: due pills + sort + view toggle ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Left: due pills */}
          <FilterChipGroup>
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

          {/* Right: sort */}
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

        {/* Active filters row (only when filters are applied) */}
        {(hasActiveFilters) && (
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
              className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer py-1 px-1"
            >
              Clear all
            </button>
            <FilterDropdown
              currentFilters={currentFilters}
              onApply={(overrides) => router.push(buildFilterUrl(overrides))}
            />
          </FilterChipGroup>
        )}

        {/* "+ Add Filter" when no active filters */}
        {!hasActiveFilters && (
          <FilterChipGroup>
            <FilterDropdown
              currentFilters={currentFilters}
              onApply={(overrides) => router.push(buildFilterUrl(overrides))}
            />
          </FilterChipGroup>
        )}

        {/* ── Task content area ── */}
        <Tabs defaultValue="list">
          <TabsList className="mb-3">
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
                    <PillButton onClick={() => setQuickAddOpen(true)}>
                      <Plus className="size-3.5" /> Add Task
                    </PillButton>
                  ) : null
                }
              />
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => {
                  const overdue = isOverdue(task.deadlineAt, task.status);
                  const deadline = task.deadlineAt
                    ? new Date(task.deadlineAt)
                    : null;

                  return (
                    <div
                      key={task.id}
                      onClick={() => {
                        setEditingTask(task);
                        setSheetOpen(true);
                      }}
                      className={`group rounded-xl border bg-card px-4 py-3 cursor-pointer transition-colors hover:bg-muted/40 ${
                        overdue
                          ? "border-l-[3px] border-l-destructive border-t-border border-r-border border-b-border"
                          : task.status === "COMPLETED"
                            ? "border-border opacity-60"
                            : "border-border"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Date circle (desktop) */}
                        {deadline && (
                          <CircularDate
                            date={deadline}
                            overdue={overdue}
                            className="hidden sm:flex shrink-0 mt-0.5"
                          />
                        )}

                        {/* Main content */}
                        <div className="flex-1 min-w-0">
                          {/* Row 1: title + badges */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4
                              className={`font-medium text-sm leading-snug ${
                                task.status === "COMPLETED"
                                  ? "line-through text-muted-foreground"
                                  : ""
                              }`}
                            >
                              {task.descriptionSnapshot}
                            </h4>
                            <ImportanceBadge importance={task.importanceSnapshot} />
                            <StatusBadge status={task.status} className="ml-auto" />
                          </div>

                          {/* Row 2: due + tags */}
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {deadline && (
                              <span
                                className={`inline-flex items-center gap-1 text-xs ${
                                  overdue
                                    ? "text-destructive font-medium"
                                    : "text-muted-foreground"
                                }`}
                              >
                                <Clock className="size-3" />
                                {formatDue(task.deadlineAt)}
                              </span>
                            )}
                            {task.tagsSnapshot.map((tag) => (
                              <button
                                key={tag}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(buildFilterUrl({ tag }));
                                }}
                                className="cursor-pointer"
                              >
                                <Badge variant="secondary" className="text-[0.65rem]">
                                  #{tag}
                                </Badge>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
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
                    <PillButton onClick={() => setQuickAddOpen(true)}>
                      <Plus className="size-3.5" /> Add Task
                    </PillButton>
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
      </div>

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
      <summary className="text-xs text-primary hover:text-primary/80 cursor-pointer select-none font-medium py-1 px-1">
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
