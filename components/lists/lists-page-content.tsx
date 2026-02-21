"use client";

import Link from "next/link";
import { ListTodo, Plus, AlertTriangle } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PillButton } from "@/components/ui/pill-button";
import { ProgressRing } from "@/components/ui/progress-ring";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

type ListSummary = {
  id: string;
  name: string;
  description: string | null;
  taskCount: number;
  overdue: number;
  progress: number;
  tags: string[];
  role: string;
};

interface ListsPageContentProps {
  lists: ListSummary[];
}

export function ListsPageContent({ lists }: ListsPageContentProps) {
  return (
    <AppShell
      action={
        <Link href="/lists/new">
          <PillButton size="sm">
            <Plus className="size-3.5" /> New List
          </PillButton>
        </Link>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight">My Lists</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            All your task lists in one place.
          </p>
        </div>

        {lists.length === 0 ? (
          <EmptyState
            icon={ListTodo}
            title="No lists yet"
            description="Create your first list to start organizing your tasks."
            action={
              <Link href="/lists/new">
                <PillButton>Create List</PillButton>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {lists.map((list) => (
              <Link key={list.id} href={`/lists/${list.id}`} className="block group">
                <div className="rounded-2xl border border-border bg-card p-5 h-full flex gap-4 items-start transition-colors hover:border-primary/30">
                  {/* Left content */}
                  <div className="flex-1 min-w-0 space-y-2.5">
                    <div>
                      <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors">
                        {list.name}
                      </h3>
                      {list.description && (
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                          {list.description}
                        </p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        {list.taskCount} {list.taskCount === 1 ? "task" : "tasks"}
                      </span>
                      {list.overdue > 0 && (
                        <span className="inline-flex items-center gap-1 text-destructive font-medium">
                          <AlertTriangle className="size-3" />
                          {list.overdue} overdue
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    {list.tags.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap">
                        {list.tags.slice(0, 4).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[0.65rem]">
                            #{tag}
                          </Badge>
                        ))}
                        {list.tags.length > 4 && (
                          <span className="text-[0.65rem] text-muted-foreground">
                            +{list.tags.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: progress ring */}
                  <div className="shrink-0">
                    <ProgressRing value={list.progress} size="md" />
                  </div>
                </div>
              </Link>
            ))}

            {/* New list card */}
            <Link href="/lists/new" className="block">
              <div className="rounded-2xl border border-dashed border-border bg-card p-5 flex flex-col items-center justify-center text-center h-full min-h-[140px] gap-3 transition-colors hover:border-primary/30">
                <div className="rounded-full border border-border p-3">
                  <Plus className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">New List</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Create &amp; organize tasks
                  </p>
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
