"use client";

import { useState } from "react";
import { ChevronDown, Repeat } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: string;
  createTaskAction: (formData: FormData) => Promise<void>;
}

const importanceOptions = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
const statusOptions = ["DRAFT", "TODO", "IN_PROGRESS", "COMPLETED", "FAILED"] as const;
const recurrenceOptions = ["DAILY", "WEEKLY", "MONTHLY", "CUSTOM"] as const;

export function QuickAddDialog({
  open,
  onOpenChange,
  listId,
  createTaskAction,
}: AddTaskDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMore, setShowMore] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      await createTaskAction(formData);
      onOpenChange(false);
      setShowMore(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) setShowMore(false);
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
          <DialogDescription>
            Create a new task. Expand for more options like status, recurrence, and scheduling.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="listId" value={listId} />

          {/* Description */}
          <Field>
            <FieldLabel htmlFor="add-description">Description *</FieldLabel>
            <Textarea
              id="add-description"
              name="description"
              placeholder="What needs to be done?"
              rows={2}
              required
              autoFocus
              className="resize-none"
            />
          </Field>

          {/* Deadline + Importance (always visible) */}
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="add-deadline">Deadline</FieldLabel>
              <Input
                id="add-deadline"
                name="deadlineAt"
                type="datetime-local"
                className="h-10"
              />
            </Field>

            <Field>
              <FieldLabel>Importance</FieldLabel>
              <Select name="importance" defaultValue="MEDIUM">
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
          </div>

          {/* Tags */}
          <Field>
            <FieldLabel htmlFor="add-tags">Tags</FieldLabel>
            <Input
              id="add-tags"
              name="tags"
              placeholder="work, urgent (comma separated)"
              className="h-10"
            />
          </Field>

          {/* Expand toggle */}
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
          >
            <ChevronDown
              className={`size-3.5 transition-transform ${showMore ? "rotate-180" : ""}`}
            />
            {showMore ? "Less options" : "More options"}
          </button>

          {/* Expandable section */}
          {showMore && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <Separator />

              {/* Status */}
              <Field>
                <FieldLabel>Initial Status</FieldLabel>
                <Select name="status" defaultValue="TODO">
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {/* Recurrence */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Repeat className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Recurrence</span>
                </div>

                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox name="isRecurring" value="on" />
                  Make this a recurring task
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel>Frequency</FieldLabel>
                    <Select name="recurrenceFrequency" defaultValue="DAILY">
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {recurrenceOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="add-interval">Every N units</FieldLabel>
                    <Input
                      id="add-interval"
                      name="recurrenceInterval"
                      type="number"
                      min={1}
                      defaultValue={1}
                      className="h-10"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="add-start">Start Date</FieldLabel>
                    <Input
                      id="add-start"
                      name="recurrenceStartDate"
                      type="date"
                      className="h-10"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="add-end">End Date</FieldLabel>
                    <Input
                      id="add-end"
                      name="recurrenceEndDate"
                      type="date"
                      className="h-10"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="add-time">Time of Day</FieldLabel>
                    <Input
                      id="add-time"
                      name="recurrenceTime"
                      type="time"
                      className="h-10"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Weekday (weekly)</FieldLabel>
                    <Select name="recurrenceWeekday" defaultValue={String(new Date().getDay())}>
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sunday</SelectItem>
                        <SelectItem value="1">Monday</SelectItem>
                        <SelectItem value="2">Tuesday</SelectItem>
                        <SelectItem value="3">Wednesday</SelectItem>
                        <SelectItem value="4">Thursday</SelectItem>
                        <SelectItem value="5">Friday</SelectItem>
                        <SelectItem value="6">Saturday</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* Hidden defaults when collapsed */}
          {!showMore && <input type="hidden" name="status" value="TODO" />}

          <DialogFooter>
            <PillButton
              type="button"
              variant="outline"
              size="sm"
              showArrow={false}
              onClick={() => {
                onOpenChange(false);
                setShowMore(false);
              }}
            >
              Cancel
            </PillButton>
            <PillButton type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Task"}
            </PillButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
