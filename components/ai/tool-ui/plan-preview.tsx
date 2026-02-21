"use client";

import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";

interface PlanInput {
  selectedTaskIds: string[];
  reasoning: string;
}

interface PlanPreviewProps {
  input: PlanInput;
  state: string;
  onAccept: () => void;
  onReject: () => void;
}

export function PlanPreview({
  input,
  state,
  onAccept,
  onReject,
}: PlanPreviewProps) {
  const isWaiting = state === "input-available";

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="bg-muted/50 px-3 py-2 border-b border-border">
        <p className="text-xs font-medium">Daily Focus Plan</p>
      </div>
      <div className="p-3 space-y-2">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {input.reasoning}
        </p>
        <p className="text-xs text-muted-foreground">
          {input.selectedTaskIds.length} task(s) selected for today
        </p>

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
