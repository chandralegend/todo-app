"use client";

import Link from "next/link";
import { Repeat } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { BentoCard } from "@/components/ui/bento-card";
import { PillButton } from "@/components/ui/pill-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";

interface NewTaskContentProps {
  list: { id: string; name: string };
  createTaskAction: (formData: FormData) => Promise<void>;
}

const importanceOptions = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
const statusOptions = ["DRAFT", "TODO", "IN_PROGRESS", "COMPLETED", "FAILED"] as const;
const recurrenceOptions = ["DAILY", "WEEKLY", "MONTHLY", "CUSTOM"] as const;

export function NewTaskContent({
  list,
  createTaskAction,
}: NewTaskContentProps) {
  return (
    <AppShell>
      <div className="max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">New Task</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Add a task to{" "}
            <span className="font-medium text-foreground">{list.name}</span>
          </p>
        </div>

        <BentoCard interactive={false} className="p-6">
          <form action={createTaskAction} className="space-y-5">
            <input type="hidden" name="listId" value={list.id} />

            {/* Description */}
            <Field>
              <FieldLabel htmlFor="description">Description *</FieldLabel>
              <Textarea
                id="description"
                name="description"
                placeholder="What needs to be done?"
                rows={3}
                required
                className="resize-none"
              />
            </Field>

            {/* Deadline */}
            <Field>
              <FieldLabel htmlFor="deadlineAt">Deadline (optional)</FieldLabel>
              <Input
                id="deadlineAt"
                name="deadlineAt"
                type="datetime-local"
                className="h-10"
              />
            </Field>

            {/* Importance + Status row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="importance">Importance</FieldLabel>
                <select
                  id="importance"
                  name="importance"
                  defaultValue="MEDIUM"
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm cursor-pointer"
                >
                  {importanceOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>

              <Field>
                <FieldLabel htmlFor="status">Initial Status</FieldLabel>
                <select
                  id="status"
                  name="status"
                  defaultValue="TODO"
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm cursor-pointer"
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Tags */}
            <Field>
              <FieldLabel htmlFor="tags">Tags (comma separated)</FieldLabel>
              <Input
                id="tags"
                name="tags"
                placeholder="work, urgent, code"
                className="h-10"
              />
            </Field>

            <Separator />

            {/* Recurrence */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Repeat className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Recurrence</span>
              </div>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  name="isRecurring"
                  className="size-4 accent-primary"
                />
                Make this a recurring task
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="recurrenceFrequency">
                    Frequency
                  </FieldLabel>
                  <select
                    id="recurrenceFrequency"
                    name="recurrenceFrequency"
                    defaultValue="DAILY"
                    className="h-10 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm cursor-pointer"
                  >
                    {recurrenceOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="recurrenceInterval">
                    Every N units
                  </FieldLabel>
                  <Input
                    id="recurrenceInterval"
                    name="recurrenceInterval"
                    type="number"
                    min={1}
                    defaultValue={1}
                    className="h-10"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="recurrenceStartDate">
                    Start Date
                  </FieldLabel>
                  <Input
                    id="recurrenceStartDate"
                    name="recurrenceStartDate"
                    type="date"
                    className="h-10"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="recurrenceEndDate">
                    End Date (optional)
                  </FieldLabel>
                  <Input
                    id="recurrenceEndDate"
                    name="recurrenceEndDate"
                    type="date"
                    className="h-10"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="recurrenceTime">
                    Time of Day (optional)
                  </FieldLabel>
                  <Input
                    id="recurrenceTime"
                    name="recurrenceTime"
                    type="time"
                    className="h-10"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="recurrenceWeekday">
                    Weekday (weekly)
                  </FieldLabel>
                  <select
                    id="recurrenceWeekday"
                    name="recurrenceWeekday"
                    defaultValue={new Date().getDay()}
                    className="h-10 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm cursor-pointer"
                  >
                    <option value={0}>Sunday</option>
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                  </select>
                </Field>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
              <PillButton type="submit">Create Task</PillButton>
              <Link href={`/lists/${list.id}`}>
                <PillButton type="button" variant="outline" showArrow={false}>
                  Cancel
                </PillButton>
              </Link>
            </div>
          </form>
        </BentoCard>
      </div>
    </AppShell>
  );
}
