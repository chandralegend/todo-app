"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PillButton } from "@/components/ui/pill-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { ImportanceBadge } from "@/components/ui/importance-badge";
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

interface TaskEditSheetProps {
  task: SerializedTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allowedStatuses: string[];
  canWrite: boolean;
  editTaskAction: (formData: FormData) => Promise<void>;
  deleteTaskAction: (formData: FormData) => Promise<void>;
}

const importanceOptions: Importance[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

function formatDateForInput(isoString: string | null): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  // Format as YYYY-MM-DDTHH:MM for datetime-local
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function TaskEditSheet({
  task,
  open,
  onOpenChange,
  allowedStatuses,
  canWrite,
  editTaskAction,
  deleteTaskAction,
}: TaskEditSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!task) return null;

  async function handleEdit(formData: FormData) {
    setIsSubmitting(true);
    try {
      await editTaskAction(formData);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(formData: FormData) {
    setIsSubmitting(true);
    try {
      await deleteTaskAction(formData);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Task Details</SheetTitle>
          <SheetDescription>
            {canWrite ? "Edit task fields and save changes." : "View task details."}
          </SheetDescription>
        </SheetHeader>

        {/* Current status + importance display */}
        <div className="flex items-center gap-2 px-4">
          <StatusBadge status={task.status} />
          <ImportanceBadge importance={task.importanceSnapshot} />
        </div>

        {canWrite ? (
          <form key={task.id} action={handleEdit} className="flex-1 flex flex-col">
            <div className="flex-1 space-y-4 px-4 py-2">
              <input type="hidden" name="taskId" value={task.id} />

              {/* Description */}
              <Field>
                <FieldLabel htmlFor="edit-description">Description</FieldLabel>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={task.descriptionSnapshot}
                  rows={3}
                  required
                  className="resize-none"
                />
              </Field>

              {/* Deadline */}
              <Field>
                <FieldLabel htmlFor="edit-deadline">Deadline</FieldLabel>
                <Input
                  id="edit-deadline"
                  name="deadlineAt"
                  type="datetime-local"
                  defaultValue={formatDateForInput(task.deadlineAt)}
                  className="h-10"
                />
              </Field>

              {/* Importance + Status row */}
              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel>Importance</FieldLabel>
                  <Select name="importance" defaultValue={task.importanceSnapshot}>
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {importanceOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel>Status</FieldLabel>
                  <Select name="status" defaultValue={task.status}>
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {allowedStatuses.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              {/* Tags */}
              <Field>
                <FieldLabel htmlFor="edit-tags">Tags (comma separated)</FieldLabel>
                <Input
                  id="edit-tags"
                  name="tags"
                  defaultValue={task.tagsSnapshot.join(", ")}
                  placeholder="work, urgent, code"
                  className="h-10"
                />
              </Field>
            </div>

            <SheetFooter className="border-t border-border">
              <div className="flex items-center justify-between w-full">
                {/* Delete button */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-4 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Task</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this task. This action cannot
                        be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <form action={handleDelete}>
                        <input type="hidden" name="taskId" value={task.id} />
                        <AlertDialogAction
                          type="submit"
                          variant="destructive"
                        >
                          Delete
                        </AlertDialogAction>
                      </form>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Save / Cancel */}
                <div className="flex items-center gap-2">
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
                    {isSubmitting ? "Saving..." : "Save"}
                  </PillButton>
                </div>
              </div>
            </SheetFooter>
          </form>
        ) : (
          /* Read-only view */
          <div className="flex-1 space-y-4 px-4 py-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">
                Description
              </p>
              <p className="text-sm text-foreground">{task.descriptionSnapshot}</p>
            </div>
            {task.deadlineAt && (
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">
                  Deadline
                </p>
                <p className="text-sm text-foreground">
                  {new Date(task.deadlineAt).toLocaleString()}
                </p>
              </div>
            )}
            {task.tagsSnapshot.length > 0 && (
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">
                  Tags
                </p>
                <p className="text-sm text-foreground">
                  {task.tagsSnapshot.map((t) => `#${t}`).join(", ")}
                </p>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
