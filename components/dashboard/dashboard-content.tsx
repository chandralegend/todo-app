"use client";

import Link from "next/link";
import {
  CalendarCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ListTodo,
  Plus,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/ui/stat-card";
import { BentoGrid } from "@/components/ui/bento-card";
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
  isOwner: boolean;
  role: string;
};

interface DashboardContentProps {
  stats: {
    today: number;
    overdue: number;
    inProgress: number;
    completedThisWeek: number;
  };
  lists: ListSummary[];
}

export function DashboardContent({ stats, lists }: DashboardContentProps) {
  return (
    <AppShell>
      <div className="space-y-8">
        {/* Stat cards */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Today"
            value={stats.today}
            description="tasks due"
            icon={CalendarCheck}
          />
          <StatCard
            label="Overdue"
            value={stats.overdue}
            description="past deadline"
            icon={AlertTriangle}
            className={stats.overdue > 0 ? "border-destructive/40" : undefined}
          />
          <StatCard
            label="Active"
            value={stats.inProgress}
            description="in progress"
            icon={Clock}
          />
          <StatCard
            label="Done"
            value={stats.completedThisWeek}
            description="this week"
            icon={CheckCircle2}
          />
        </div>

        {/* Lists section */}
        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight">My Lists</h2>
            <p className="text-xs text-muted-foreground">Your task lists at a glance.</p>
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
            <BentoGrid>
              {lists.map((list) => (
                <Link key={list.id} href={`/lists/${list.id}`} className="block">
                  <div className="rounded-2xl border border-border bg-card px-4 py-3.5 bento-card cursor-pointer h-full flex flex-col gap-2.5">
                    {/* Title + progress ring */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base leading-tight truncate">{list.name}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {list.taskCount} {list.taskCount === 1 ? "task" : "tasks"}
                          {list.overdue > 0 && (
                            <> &middot; <span className="text-destructive font-medium">{list.overdue} overdue</span></>
                          )}
                        </p>
                      </div>
                      <ProgressRing value={list.progress} size="sm" />
                    </div>

                    {/* Tags */}
                    {list.tags.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap">
                        {list.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">#{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}

              {/* New list card */}
              <Link href="/lists/new" className="block">
                <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-3.5 flex flex-col items-center justify-center text-center h-full min-h-[140px] gap-2">
                  <div className="rounded-full border border-border p-2.5">
                    <Plus className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">New List</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Create &amp; organize tasks</p>
                  </div>
                </div>
              </Link>
            </BentoGrid>
          )}
        </section>
      </div>
    </AppShell>
  );
}
