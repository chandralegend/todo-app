"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { PillButton } from "@/components/ui/pill-button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";

interface QuickAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: string;
  createTaskAction: (formData: FormData) => Promise<void>;
}

const importanceOptions = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export function QuickAddDialog({
  open,
  onOpenChange,
  listId,
  createTaskAction,
}: QuickAddDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      await createTaskAction(formData);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Add Task</DialogTitle>
          <DialogDescription>
            Add a new task to this list. Fill in the basics now, edit details later.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="listId" value={listId} />
          <input type="hidden" name="status" value="TODO" />

          {/* Description */}
          <Field>
            <FieldLabel htmlFor="quick-description">What needs to be done?</FieldLabel>
            <Input
              id="quick-description"
              name="description"
              placeholder="e.g., Review pull request #42"
              required
              autoFocus
            />
          </Field>

          {/* Deadline + Importance */}
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="quick-deadline">Deadline</FieldLabel>
              <Input
                id="quick-deadline"
                name="deadlineAt"
                type="datetime-local"
                className="h-10"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="quick-importance">Importance</FieldLabel>
              <select
                id="quick-importance"
                name="importance"
                defaultValue="MEDIUM"
                className="h-10 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm cursor-pointer"
              >
                {importanceOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Tags */}
          <Field>
            <FieldLabel htmlFor="quick-tags">Tags</FieldLabel>
            <Input
              id="quick-tags"
              name="tags"
              placeholder="work, urgent (comma separated)"
              className="h-10"
            />
          </Field>

          <DialogFooter>
            <PillButton
              type="button"
              variant="outline"
              size="sm"
              showArrow={false}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </PillButton>
            <PillButton
              type="submit"
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Task"}
            </PillButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
