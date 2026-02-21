"use client";

import React from "react";
import { Activity, Clock, Zap, AlertCircle, CheckCircle2 } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/ui/stat-card";
import { BentoCard } from "@/components/ui/bento-card";
import { EmptyState } from "@/components/ui/empty-state";

type SerializedLog = {
  id: string;
  createdAt: string;
  status: string;
  templatesScanned: number;
  attempted: number;
  generated: number;
  duplicateOrExisting: number;
  windowStart: string;
  windowEnd: string;
  errorMessage: string | null;
};

interface RecurrenceContentProps {
  logs: SerializedLog[];
  stats: {
    totalRuns: number;
    lastRun: string | null;
    createdToday: number;
  };
}

function formatTimeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export function RecurrenceContent({
  logs,
  stats,
}: RecurrenceContentProps) {
  return (
    <AppShell>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Recurrence Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor automated task generation. Trigger:{" "}
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
            GET /api/cron/recurrence
          </code>
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 mb-8">
        <StatCard
          label="Total Runs"
          value={stats.totalRuns}
          icon={Activity}
        />
        <StatCard
          label="Last Run"
          value={stats.lastRun ? formatTimeAgo(stats.lastRun) : "Never"}
          icon={Clock}
        />
        <StatCard
          label="Created Today"
          value={stats.createdToday}
          description="instances"
          icon={Zap}
        />
      </div>

      {/* Logs table */}
      {logs.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No recurrence runs yet"
          description="Runs will appear here after the cron endpoint is triggered."
        />
      ) : (
        <BentoCard interactive={false} className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Templates
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Generated
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Existing
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Window
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-foreground font-medium">
                          {new Date(log.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="text-muted-foreground ml-1">
                          {new Date(log.createdAt).toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                            log.status === "SUCCESS"
                              ? "text-status-completed"
                              : "text-destructive"
                          }`}
                        >
                          {log.status === "SUCCESS" ? (
                            <CheckCircle2 className="size-3.5" />
                          ) : (
                            <AlertCircle className="size-3.5" />
                          )}
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {log.templatesScanned}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">
                        {log.generated}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        {log.duplicateOrExisting}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {new Date(log.windowStart).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                        {" - "}
                        {new Date(log.windowEnd).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                    {log.errorMessage && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-2 text-xs text-destructive bg-destructive/5"
                        >
                          {log.errorMessage}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </BentoCard>
      )}
    </AppShell>
  );
}
