"use client";

import { Check, Plus, ArrowRight, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CreatedTaskResult {
  id: string;
  description: string;
  status: string;
  importance: string;
  deadline: string | null;
  tags: string[];
  listName: string;
  message: string;
}

interface CreatedListResult {
  id: string;
  name: string;
  description: string | null;
  message: string;
}

interface StatusUpdateResult {
  id: string;
  description: string;
  previousStatus: string;
  newStatus: string;
  message: string;
}

interface TodayFocusResult {
  added: Array<{ id: string; description: string }>;
  message: string;
}

interface TodayTaskItem {
  focusId: string;
  taskId: string;
  description: string;
  status: string;
  importance: string;
  deadline: string | null;
  tags: string[];
  listName: string;
  completed: boolean;
  position: number;
}

interface ErrorResult {
  error: string;
}

export function CreatedTaskCard({ data }: { data: CreatedTaskResult | ErrorResult }) {
  if ("error" in data) {
    return <ErrorCard error={data.error} />;
  }
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30 p-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Plus className="size-3.5 text-emerald-600" />
        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
          Task Created
        </span>
      </div>
      <p className="text-xs leading-snug">{data.description}</p>
      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
        <Badge variant="secondary" className="text-[0.6rem]">
          {data.listName}
        </Badge>
        <Badge variant="outline" className="text-[0.6rem]">
          {data.status}
        </Badge>
        <Badge variant="outline" className="text-[0.6rem]">
          {data.importance}
        </Badge>
      </div>
    </div>
  );
}

export function CreatedListCard({ data }: { data: CreatedListResult | ErrorResult }) {
  if ("error" in data) {
    return <ErrorCard error={data.error} />;
  }
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30 p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Plus className="size-3.5 text-emerald-600" />
        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
          List Created
        </span>
      </div>
      <p className="text-sm font-medium">{data.name}</p>
      {data.description && (
        <p className="text-xs text-muted-foreground mt-0.5">{data.description}</p>
      )}
    </div>
  );
}

export function StatusUpdateCard({ data }: { data: StatusUpdateResult | ErrorResult }) {
  if ("error" in data) {
    return <ErrorCard error={data.error} />;
  }
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30 p-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Check className="size-3.5 text-blue-600" />
        <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
          Status Updated
        </span>
      </div>
      <p className="text-xs leading-snug">{data.description}</p>
      <div className="flex items-center gap-1.5 mt-1.5">
        <Badge variant="outline" className="text-[0.6rem]">
          {data.previousStatus}
        </Badge>
        <ArrowRight className="size-3 text-muted-foreground" />
        <Badge variant="secondary" className="text-[0.6rem]">
          {data.newStatus}
        </Badge>
      </div>
    </div>
  );
}

export function TodayFocusCard({ data }: { data: TodayFocusResult | ErrorResult }) {
  if ("error" in data) {
    return <ErrorCard error={data.error} />;
  }
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/30 p-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Check className="size-3.5 text-amber-600" />
        <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
          {data.message}
        </span>
      </div>
      <div className="space-y-1">
        {data.added.map((task) => (
          <p key={task.id} className="text-xs text-muted-foreground">
            - {task.description}
          </p>
        ))}
      </div>
    </div>
  );
}

export function TodayTasksCard({ data }: { data: TodayTaskItem[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        No tasks in today&apos;s focus yet.
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">
        Today&apos;s Focus ({data.length})
      </p>
      {data.map((task) => (
        <div
          key={task.focusId}
          className="flex items-start gap-2 rounded-md border border-border bg-card px-3 py-2"
        >
          <span
            className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
              task.completed
                ? "bg-emerald-500"
                : task.status === "IN_PROGRESS"
                  ? "bg-amber-500"
                  : "bg-blue-500"
            }`}
          />
          <div className="flex-1 min-w-0">
            <p
              className={`text-xs leading-snug ${task.completed ? "line-through text-muted-foreground" : ""}`}
            >
              {task.description}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[0.6rem] text-muted-foreground">
                {task.listName}
              </span>
              {task.deadline && (
                <span className="text-[0.6rem] text-muted-foreground">
                  {new Date(task.deadline).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorCard({ error }: { error: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/30 p-3">
      <div className="flex items-center gap-1.5">
        <AlertCircle className="size-3.5 text-red-600" />
        <span className="text-xs text-red-700 dark:text-red-400">{error}</span>
      </div>
    </div>
  );
}
