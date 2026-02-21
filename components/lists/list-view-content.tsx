"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ClipboardList,
  Plus,
  ArrowUpDown,
  Search,
  List,
  LayoutGrid,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PillButton } from "@/components/ui/pill-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ImportanceBadge } from "@/components/ui/importance-badge";
import { ProgressRing } from "@/components/ui/progress-ring";
import { CircularDate } from "@/components/ui/circular-date";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { FilterChip, FilterChipGroup } from "@/components/ui/filter-chip";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskEditDialog } from "@/components/lists/task-edit-sheet";
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
  tags: string[];
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
  if (!deadlineAt) return "\u2014";
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

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
      breadcrumbOverrides={{ [list.id]: list.name }}
      action={
        canWrite ? (
          <PillButton size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="size-3.5" /> Add Task
          </PillButton>
        ) : undefined
      }
    >
      <div className="space-y-5">
        {/* ── Header card ── */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-6">
            {/* Left: title, description, stats, tags */}
            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <h1 className="text-xl font-bold tracking-tight">{list.name}</h1>
                {list.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {list.description}
                  </p>
                )}
              </div>

              {/* Stats */}
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

              {/* Tags */}
              {list.tags.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {list.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => router.push(buildFilterUrl({ tag }))}
                      className="cursor-pointer"
                    >
                      <Badge variant="secondary" className="text-[0.65rem]">
                        #{tag}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: large progress ring */}
            <div className="shrink-0">
              <ProgressRing value={list.progress} size="lg" />
            </div>
          </div>
        </div>

        {/* ── Toolbar: due pills + add filter + sort ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
            {/* +Add Filter inline with pills */}
            <FilterDropdown
              currentFilters={currentFilters}
              onApply={(overrides) => router.push(buildFilterUrl(overrides))}
            />
          </FilterChipGroup>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="size-3.5 text-muted-foreground" />
            <Select
              value={currentFilters.sort}
              onValueChange={(value) =>
                router.push(buildFilterUrl({ sort: value }))
              }
            >
              <SelectTrigger className="h-8 w-[120px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_desc">Newest</SelectItem>
                <SelectItem value="deadline_asc">Deadline</SelectItem>
                <SelectItem value="importance_desc">Importance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active filters */}
        {hasActiveFilters && (
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
          </FilterChipGroup>
        )}

        {/* ── Content tabs ── */}
        <Tabs defaultValue="table">
          <TabsList className="mb-3">
            <TabsTrigger value="table">
              <List className="size-3.5" />
              Table
            </TabsTrigger>
            <TabsTrigger value="board">
              <LayoutGrid className="size-3.5" />
              Board
            </TabsTrigger>
          </TabsList>

          {/* Table View */}
          <TabsContent value="table">
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
                    <PillButton onClick={() => setAddOpen(true)}>
                      <Plus className="size-3.5" /> Add Task
                    </PillButton>
                  ) : null
                }
              />
            ) : (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground w-10 hidden sm:table-cell">
                          {/* Date column */}
                        </th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Task
                        </th>
                        <th className="text-left px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                          Status
                        </th>
                        <th className="text-left px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                          Importance
                        </th>
                        <th className="text-left px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                          Due
                        </th>
                        <th className="text-left px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                          Tags
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task) => {
                        const overdue = isOverdue(task.deadlineAt, task.status);
                        const dateForCircle = task.deadlineAt
                          ? new Date(task.deadlineAt)
                          : new Date(task.occurrenceDate);
                        return (
                          <tr
                            key={task.id}
                            onClick={() => {
                              setEditingTask(task);
                              setDialogOpen(true);
                            }}
                            className={`border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-muted/40 ${
                              task.status === "COMPLETED" ? "opacity-60" : ""
                            } ${overdue ? "bg-destructive/[0.03]" : ""}`}
                          >
                            {/* Circular date */}
                            <td className="pl-4 pr-1 py-3 hidden sm:table-cell">
                              <CircularDate
                                date={dateForCircle}
                                overdue={overdue}
                                size="xs"
                              />
                            </td>
                            {/* Task name */}
                            <td className="px-4 sm:pl-2 py-3 max-w-[300px]">
                              <p
                                className={`font-medium text-sm leading-snug truncate ${
                                  task.status === "COMPLETED"
                                    ? "line-through text-muted-foreground"
                                    : ""
                                }`}
                              >
                                {task.descriptionSnapshot}
                              </p>
                              {/* Mobile: show status + due inline */}
                              <div className="flex items-center gap-2 mt-1 sm:hidden">
                                <StatusBadge status={task.status} />
                                {task.deadlineAt && (
                                  <span
                                    className={`text-xs ${
                                      overdue
                                        ? "text-destructive font-medium"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    {formatDue(task.deadlineAt)}
                                  </span>
                                )}
                              </div>
                            </td>
                            {/* Status */}
                            <td className="px-3 py-3 hidden sm:table-cell">
                              <StatusBadge status={task.status} />
                            </td>
                            {/* Importance */}
                            <td className="px-3 py-3 hidden md:table-cell">
                              <ImportanceBadge importance={task.importanceSnapshot} />
                            </td>
                            {/* Due */}
                            <td className="px-3 py-3 hidden sm:table-cell whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1 text-xs ${
                                  overdue
                                    ? "text-destructive font-medium"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {overdue && <Clock className="size-3" />}
                                {formatDue(task.deadlineAt)}
                              </span>
                            </td>
                            {/* Tags */}
                            <td className="px-3 py-3 hidden lg:table-cell">
                              <div className="flex gap-1 flex-wrap">
                                {task.tagsSnapshot.slice(0, 3).map((tag) => (
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
                                {task.tagsSnapshot.length > 3 && (
                                  <span className="text-[0.65rem] text-muted-foreground">
                                    +{task.tagsSnapshot.length - 3}
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
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
                    <PillButton onClick={() => setAddOpen(true)}>
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
                  setDialogOpen(true);
                }}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Task Dialog */}
      <QuickAddDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        listId={list.id}
        createTaskAction={quickCreateTaskAction}
      />

      {/* Task Edit Dialog */}
      <TaskEditDialog
        task={editingTask}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
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
