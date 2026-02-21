"use client";

import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/ui/progress-ring";

interface TaskListItem {
  id: string;
  name: string;
  description: string | null;
  totalTasks: number;
  completedTasks: number;
}

export function TaskListsResult({ data }: { data: TaskListItem[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        No task lists found.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {data.map((list) => {
        const progress =
          list.totalTasks > 0
            ? Math.round((list.completedTasks / list.totalTasks) * 100)
            : 0;
        return (
          <div
            key={list.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
          >
            <ProgressRing value={progress} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{list.name}</p>
              {list.description && (
                <p className="text-xs text-muted-foreground truncate">
                  {list.description}
                </p>
              )}
            </div>
            <Badge variant="secondary" className="text-[0.65rem] shrink-0">
              {list.completedTasks}/{list.totalTasks}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}

interface TaskItem {
  id: string;
  description: string;
  status: string;
  importance: string;
  deadline: string | null;
  tags: string[];
}

export function TasksInListResult({
  data,
}: {
  data: { list: string; tasks: TaskItem[] };
}) {
  if (!data?.tasks || data.tasks.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        No tasks found in {data?.list ?? "this list"}.
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">
        {data.list} ({data.tasks.length})
      </p>
      {data.tasks.map((task) => (
        <TaskRow key={task.id} task={task} />
      ))}
    </div>
  );
}

function TaskRow({ task }: { task: TaskItem }) {
  const importanceColor: Record<string, string> = {
    LOW: "text-muted-foreground",
    MEDIUM: "text-foreground",
    HIGH: "text-amber-600",
    CRITICAL: "text-red-600",
  };

  return (
    <div className="flex items-start gap-2 rounded-md border border-border bg-card px-3 py-2">
      <StatusDot status={task.status} />
      <div className="flex-1 min-w-0">
        <p className="text-xs leading-snug">{task.description}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className={`text-[0.6rem] font-medium ${importanceColor[task.importance] ?? ""}`}
          >
            {task.importance}
          </span>
          {task.deadline && (
            <span className="text-[0.6rem] text-muted-foreground">
              {new Date(task.deadline).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    TODO: "bg-blue-500",
    IN_PROGRESS: "bg-amber-500",
    COMPLETED: "bg-emerald-500",
    FAILED: "bg-red-500",
    DRAFT: "bg-gray-400",
  };

  return (
    <span
      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${colors[status] ?? "bg-gray-400"}`}
    />
  );
}
