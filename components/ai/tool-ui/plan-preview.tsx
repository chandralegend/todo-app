"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Loader2, CalendarClock, Sun } from "lucide-react";

interface PlanTask {
  id: string;
  description: string;
  importance: string;
  deadline?: string | null;
  listName?: string;
}

interface PlanInput {
  tasks: PlanTask[];
  reasoning: string;
}

interface PlanPreviewProps {
  input: PlanInput | undefined;
  state: string;
  onAccept: () => void;
  onReject: () => void;
}

const importanceColor: Record<string, string> = {
  LOW: "text-muted-foreground",
  MEDIUM: "text-foreground",
  HIGH: "text-amber-600",
  CRITICAL: "text-red-600",
};

export function PlanPreview({
  input,
  state,
  onAccept,
  onReject,
}: PlanPreviewProps) {
  const isWaiting = state === "input-available";
  const tasks = input?.tasks ?? [];

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="bg-muted/50 px-3 py-2 border-b border-border flex items-center gap-2">
        <Sun className="size-3.5 text-amber-500" />
        <p className="text-xs font-medium">Daily Focus Plan</p>
        <Badge variant="secondary" className="text-[0.6rem] ml-auto">
          {tasks.length} task{tasks.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      <div className="p-3 space-y-2.5">
        {/* Reasoning */}
        {input?.reasoning && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {input.reasoning}
          </p>
        )}

        {/* Task list */}
        {tasks.length > 0 && (
          <div className="space-y-1.5">
            {tasks.map((task, i) => (
              <div
                key={task.id}
                className="flex items-start gap-2.5 rounded-md border border-border bg-background px-3 py-2"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[0.6rem] font-semibold text-primary mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-snug">{task.description}</p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {task.listName && (
                      <Badge
                        variant="secondary"
                        className="text-[0.55rem] py-0"
                      >
                        {task.listName}
                      </Badge>
                    )}
                    <span
                      className={`text-[0.55rem] font-medium ${importanceColor[task.importance] ?? ""}`}
                    >
                      {task.importance}
                    </span>
                    {task.deadline && (
                      <span className="flex items-center gap-0.5 text-[0.55rem] text-muted-foreground">
                        <CalendarClock className="size-2.5" />
                        {new Date(task.deadline).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        {isWaiting && (
          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={onAccept}
            >
              <Check className="size-3" />
              Accept Plan
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1"
              onClick={onReject}
            >
              <X className="size-3" />
              Reject
            </Button>
          </div>
        )}

        {/* Status indicators */}
        {state === "output-available" && (
          <div className="flex items-center gap-1.5 pt-1 text-emerald-600">
            <Check className="size-3.5" />
            <span className="text-xs font-medium">Plan accepted</span>
          </div>
        )}

        {state === "output-error" && (
          <div className="flex items-center gap-1.5 pt-1 text-red-600">
            <X className="size-3.5" />
            <span className="text-xs font-medium">Plan rejected</span>
          </div>
        )}

        {state === "input-streaming" && (
          <div className="flex items-center gap-1.5 pt-1 text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            <span className="text-xs">Preparing plan...</span>
          </div>
        )}
      </div>
    </div>
  );
}
