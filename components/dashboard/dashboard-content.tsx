"use client";

import Link from "next/link";
import {
  CalendarCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ListTodo,
  Plus,
  ArrowRight,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/ui/stat-card";
import { BentoCard, BentoGrid } from "@/components/ui/bento-card";
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

type SidebarListItem = {
  id: string;
  name: string;
  taskCount: number;
};

interface DashboardContentProps {
  userName: string;
  stats: {
    today: number;
    overdue: number;
    inProgress: number;
    completedThisWeek: number;
  };
  lists: ListSummary[];
  sidebarLists: SidebarListItem[];
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardContent({
  userName,
  stats,
  lists,
  sidebarLists,
}: DashboardContentProps) {
  const greeting = getGreeting();

  return (
    <AppShell lists={sidebarLists}>
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {greeting}, {userName}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here&apos;s your overview for today
        </p>
      </div>

      {/* Summary stat cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          label="Today"
          value={stats.today}
          description="tasks due"
          icon={CalendarCheck}
        />
        <StatCard
          label="Overdue"
          value={stats.overdue}
          description="tasks"
          icon={AlertTriangle}
          className={stats.overdue > 0 ? "border-destructive/40" : undefined}
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          description="tasks"
          icon={Clock}
        />
        <StatCard
          label="Completed"
          value={stats.completedThisWeek}
          description="this week"
          icon={CheckCircle2}
        />
      </div>

      {/* Lists section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">My Lists</h2>
        <Link
          href="/lists/new"
          className="text-sm text-primary hover:text-primary/80 inline-flex items-center gap-1 transition-colors"
        >
          View All <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {/* Lists grid or empty state */}
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
        <BentoGrid className="lg:grid-cols-2 xl:grid-cols-3">
          {lists.map((list) => (
            <Link key={list.id} href={`/lists/${list.id}`} className="block">
              <BentoCard
                accent={list.overdue > 0 ? "destructive" : "none"}
                className="h-full flex flex-col justify-between"
              >
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-base text-foreground leading-tight line-clamp-1">
                      {list.name}
                    </h3>
                    {!list.isOwner && (
                      <Badge variant="outline" className="text-[0.6rem] ml-2 shrink-0">
                        {list.role}
                      </Badge>
                    )}
                  </div>
                  {list.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {list.description}
                    </p>
                  )}

                  {/* Stats row */}
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                    <span>{list.taskCount} tasks</span>
                    {list.overdue > 0 && (
                      <span className="text-destructive font-medium">
                        {list.overdue} overdue
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress + tags */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <ProgressRing value={list.progress} size="sm" />
                    <span className="text-sm text-muted-foreground">
                      {list.progress}% complete
                    </span>
                  </div>

                  {list.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {list.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[0.65rem] text-muted-foreground bg-muted px-2 py-0.5 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer CTA */}
                <div className="mt-4 pt-3 border-t border-border">
                  <span className="text-sm text-primary font-medium inline-flex items-center gap-1">
                    Open <ArrowRight className="size-3.5" />
                  </span>
                </div>
              </BentoCard>
            </Link>
          ))}

          {/* New list card */}
          <Link href="/lists/new" className="block">
            <BentoCard className="h-full flex flex-col items-center justify-center text-center border-dashed min-h-[200px]">
              <div className="rounded-full border border-border p-3 mb-3">
                <Plus className="size-5 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-base text-foreground mb-1">
                New List
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create a new list to organize your tasks
              </p>
              <PillButton size="sm" variant="primary">
                Create
              </PillButton>
            </BentoCard>
          </Link>
        </BentoGrid>
      )}
    </AppShell>
  );
}
