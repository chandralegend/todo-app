"use client";

import Link from "next/link";
import { ListPlus } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { BentoCard } from "@/components/ui/bento-card";
import { PillButton } from "@/components/ui/pill-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";

interface NewListContentProps {
  createListAction: (formData: FormData) => Promise<void>;
}

export function NewListContent({
  createListAction,
}: NewListContentProps) {
  return (
    <AppShell>
      <div className="max-w-lg">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="rounded-full border border-border p-2.5">
              <ListPlus className="size-5 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">New List</h1>
              <p className="text-sm text-muted-foreground">
                Create a list to organize your tasks
              </p>
            </div>
          </div>
        </div>

        <BentoCard interactive={false} className="p-6">
          <form action={createListAction} className="space-y-5">
            <Field>
              <FieldLabel htmlFor="name">List Name *</FieldLabel>
              <Input
                id="name"
                name="name"
                placeholder="Work Tasks"
                required
                className="h-10"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="description">
                Description (optional)
              </FieldLabel>
              <Textarea
                id="description"
                name="description"
                placeholder="What is this list for?"
                rows={3}
                className="resize-none"
              />
            </Field>

            <div className="flex items-center gap-3 pt-1">
              <PillButton type="submit">Create List</PillButton>
              <Link href="/">
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
