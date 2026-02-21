"use client";

import { AppShell } from "@/components/layout/app-shell";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { ImportanceBadge } from "@/components/ui/importance-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sun, X, Sparkles, Plus } from "lucide-react";
import type { TaskStatus, Importance } from "@prisma/client";
import { toast } from "sonner";
import {
  AddToTodayDialog,
  type AvailableTask,
} from "@/components/today/add-to-today-dialog";

interface TodayTask {
  focusId: string;
  taskId: string;
  description: string;
  status: string;
  importance: string;
  deadline: string | null;
  tags: string[];
  listName: string;
  listId: string;
  completed: boolean;
  position: number;
}

interface TodayContentProps {
  tasks: TodayTask[];
  availableTasks: AvailableTask[];
  completedCount: number;
  totalCount: number;
  progress: number;
  addToFocusAction: (formData: FormData) => Promise<void>;
  toggleFocusCompleteAction: (formData: FormData) => Promise<void>;
  updateTaskStatusAction: (formData: FormData) => Promise<void>;
  removeFocusAction: (formData: FormData) => Promise<void>;
}

export function TodayContent({
  tasks,
  availableTasks,
  completedCount,
  totalCount,
  progress,
  addToFocusAction,
  toggleFocusCompleteAction,
  updateTaskStatusAction,
  removeFocusAction,
}: TodayContentProps) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  async function handleToggleComplete(focusId: string, completed: boolean) {
    const fd = new FormData();
    fd.set("focusId", focusId);
    fd.set("completed", String(completed));
    await toggleFocusCompleteAction(fd);
  }

  async function handleMarkDone(taskId: string) {
    const fd = new FormData();
    fd.set("taskId", taskId);
    fd.set("status", "COMPLETED");
    await updateTaskStatusAction(fd);
  }

  async function handleRemove(focusId: string) {
    const fd = new FormData();
    fd.set("focusId", focusId);
    await removeFocusAction(fd);
    toast.success("Removed from today's focus");
  }

  return (
    <AppShell
      breadcrumbOverrides={{ today: "Today" }}
      action={
        <AddToTodayDialog tasks={availableTasks} addToFocusAction={addToFocusAction}>
          <Button size="sm" className="h-8 text-xs gap-1.5 rounded-full">
            <Plus className="size-3.5" />
            Add Tasks
          </Button>
        </AddToTodayDialog>
      }
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sun className="size-5 text-amber-500" />
            <h1 className="text-lg font-semibold">Today&apos;s Focus</h1>
          </div>
          <p className="text-sm text-muted-foreground">{today}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium">
              {completedCount}/{totalCount}
            </p>
            <p className="text-xs text-muted-foreground">completed</p>
          </div>
          <ProgressRing value={progress} size="md" />
        </div>
      </div>

      {/* Task list */}
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <Sparkles className="size-7 text-muted-foreground" />
          </div>
          <h2 className="text-sm font-medium mb-1">No tasks for today</h2>
          <p className="text-xs text-muted-foreground max-w-[280px]">
            Use the <strong>Add Tasks</strong> button above to pick tasks for
            today, or open the AI assistant to plan your day.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.focusId}
              className={`group flex items-start gap-3 rounded-xl border p-4 transition-colors ${
                task.completed
                  ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20"
                  : "border-border bg-card hover:bg-muted/30"
              }`}
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={() =>
                  handleToggleComplete(task.focusId, task.completed)
                }
                className="mt-0.5"
              />

              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm leading-snug ${
                    task.completed
                      ? "line-through text-muted-foreground"
                      : "text-foreground"
                  }`}
                >
                  {task.description}
                </p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <Badge variant="secondary" className="text-[0.6rem]">
                    {task.listName}
                  </Badge>
                  <StatusBadge status={task.status as TaskStatus} />
                  <ImportanceBadge importance={task.importance as Importance} />
                  {task.deadline && (
                    <span className="text-[0.6rem] text-muted-foreground">
                      Due {new Date(task.deadline).toLocaleDateString()}
                    </span>
                  )}
                  {task.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-[0.6rem]"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                {!task.completed && task.status !== "COMPLETED" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleMarkDone(task.taskId)}
                    title="Mark as completed"
                  >
                    <Sparkles className="size-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-red-600"
                  onClick={() => handleRemove(task.focusId)}
                  title="Remove from today"
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
