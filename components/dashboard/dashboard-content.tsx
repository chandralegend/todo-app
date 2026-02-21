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
import { Progress } from "@/components/ui/progress";
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
                  {/* List card — matches /design "List Cards" section exactly */}
                  <div className="rounded-2xl border border-border bg-card p-4 bento-card cursor-pointer h-full">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-sm">{list.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {list.taskCount} tasks
                          {list.overdue > 0 && (
                            <> &middot; <span className="text-destructive">{list.overdue} overdue</span></>
                          )}
                        </p>
                      </div>
                      <ProgressRing value={list.progress} size="sm" />
                    </div>
                    <Progress value={list.progress} className="mt-3" />
                    <p className="text-[0.6rem] text-muted-foreground mt-0.5">
                      {list.progress}% complete
                    </p>
                    {list.tags.length > 0 && (
                      <div className="mt-2 flex gap-1 flex-wrap">
                        {list.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">#{tag}</Badge>
                        ))}
                      </div>
                    )}
                    <PillButton size="sm" className="mt-3">Open</PillButton>
                  </div>
                </Link>
              ))}

              {/* New list card — matches /design */}
              <Link href="/lists/new" className="block">
                <div className="rounded-2xl border border-dashed border-border bg-card p-4 flex flex-col items-center justify-center text-center h-full min-h-[180px]">
                  <div className="rounded-full border border-border p-3 mb-2">
                    <Plus className="size-5 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-sm">New List</h3>
                  <p className="text-[0.6rem] text-muted-foreground mt-0.5">Organize tasks</p>
                  <PillButton size="sm" variant="outline" className="mt-2">Create</PillButton>
                </div>
              </Link>
            </BentoGrid>
          )}
        </section>
      </div>
    </AppShell>
  );
}
