"use client";

import React, { useState } from "react";
import {
  Activity,
  Clock,
  Zap,
  AlertCircle,
  CheckCircle2,
  Key,
  Database,
  Brain,
  Lock,
  Eye,
  EyeOff,
  Save,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/ui/stat-card";
import { BentoCard } from "@/components/ui/bento-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// ---------- Types ----------

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

interface SettingsContentProps {
  user: { name: string; email: string };
  recurrence: {
    logs: SerializedLog[];
    stats: {
      totalRuns: number;
      lastRun: string | null;
      createdToday: number;
    };
  };
  databaseUrl: string;
}

// ---------- Helpers ----------

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

// ---------- Sub-components ----------

function ChangePasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to change password");
        return;
      }
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <BentoCard interactive={false}>
      <div className="flex items-center gap-2 mb-4">
        <Lock className="size-4 text-coral" />
        <h3 className="font-semibold text-sm">Change Password</h3>
      </div>
      <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
        <div className="space-y-1.5">
          <Label htmlFor="current-password" className="text-xs">
            Current Password
          </Label>
          <div className="relative">
            <Input
              id="current-password"
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="pr-9"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showCurrent ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-password" className="text-xs">
            New Password
          </Label>
          <div className="relative">
            <Input
              id="new-password"
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="pr-9"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showNew ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm-password" className="text-xs">
            Confirm New Password
          </Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-xs font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
        >
          <Save className="size-3.5" />
          {loading ? "Saving..." : "Update Password"}
        </button>
      </form>
    </BentoCard>
  );
}

function ApiKeySection() {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    // Store in localStorage for client-side usage
    // The server-side key is set via .env
    if (apiKey.trim()) {
      localStorage.setItem("openai-api-key", apiKey.trim());
      toast.success("API key saved to local storage");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <BentoCard interactive={false}>
      <div className="flex items-center gap-2 mb-4">
        <Brain className="size-4 text-coral" />
        <h3 className="font-semibold text-sm">OpenAI API Key</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Set your OpenAI API key for AI features. This is stored in your browser&apos;s local storage.
        For server-side configuration, set <code className="bg-muted px-1 py-0.5 rounded text-[0.65rem]">OPENAI_API_KEY</code> in your <code className="bg-muted px-1 py-0.5 rounded text-[0.65rem]">.env</code> file.
      </p>
      <form onSubmit={handleSave} className="space-y-4 max-w-sm">
        <div className="space-y-1.5">
          <Label htmlFor="api-key" className="text-xs">
            API Key
          </Label>
          <div className="relative">
            <Input
              id="api-key"
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="pr-9 font-mono text-xs"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showKey ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-xs font-medium hover:bg-foreground/90 transition-colors"
        >
          {saved ? <CheckCircle2 className="size-3.5" /> : <Key className="size-3.5" />}
          {saved ? "Saved" : "Save Key"}
        </button>
      </form>
    </BentoCard>
  );
}

function DatabaseSection({ databaseUrl }: { databaseUrl: string }) {
  return (
    <BentoCard interactive={false}>
      <div className="flex items-center gap-2 mb-4">
        <Database className="size-4 text-coral" />
        <h3 className="font-semibold text-sm">Database</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        The database URL is configured via environment variable. In the desktop app, it defaults to your user data directory.
      </p>
      <div className="space-y-1.5 max-w-lg">
        <Label className="text-xs">DATABASE_URL</Label>
        <Input
          value={databaseUrl}
          readOnly
          className="font-mono text-xs bg-muted"
        />
        <p className="text-[0.65rem] text-muted-foreground">
          To change, update <code className="bg-muted px-1 py-0.5 rounded">DATABASE_URL</code> in your <code className="bg-muted px-1 py-0.5 rounded">.env</code> file and restart the app.
        </p>
      </div>
    </BentoCard>
  );
}

function RecurrenceSection({
  logs,
  stats,
}: {
  logs: SerializedLog[];
  stats: { totalRuns: number; lastRun: string | null; createdToday: number };
}) {
  return (
    <>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 mb-6">
        <StatCard label="Total Runs" value={stats.totalRuns} icon={Activity} />
        <StatCard
          label="Last Run"
          value={stats.lastRun ? formatTimeAgo(stats.lastRun) : "Never"}
          icon={Clock}
        />
        <StatCard label="Created Today" value={stats.createdToday} description="instances" icon={Zap} />
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Recurring task generation runs automatically via the Electron cron scheduler (hourly).
        Manual trigger:{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-[0.65rem] font-mono">
          GET /api/cron/recurrence
        </code>
      </p>

      {logs.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No recurrence runs yet"
          description="Runs will appear here after the cron scheduler triggers."
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
                            log.status === "SUCCESS" ? "text-status-completed" : "text-destructive"
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
                      <td className="px-4 py-3 text-right tabular-nums">{log.templatesScanned}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">{log.generated}</td>
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
                        <td colSpan={6} className="px-4 py-2 text-xs text-destructive bg-destructive/5">
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
    </>
  );
}

// ---------- Main Component ----------

export function SettingsContent({ user, recurrence, databaseUrl }: SettingsContentProps) {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account, integrations, and app configuration.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="ai">AI</TabsTrigger>
          <TabsTrigger value="recurrence">Recurrence</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <BentoCard interactive={false}>
            <h3 className="font-semibold text-sm mb-3">Account</h3>
            <div className="grid gap-3 max-w-sm">
              <div className="space-y-1.5">
                <Label className="text-xs">Name</Label>
                <Input value={user.name} readOnly className="bg-muted" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email</Label>
                <Input value={user.email} readOnly className="bg-muted" />
              </div>
            </div>
          </BentoCard>

          <ChangePasswordSection />
          <DatabaseSection databaseUrl={databaseUrl} />
        </TabsContent>

        {/* AI Tab */}
        <TabsContent value="ai" className="space-y-6">
          <ApiKeySection />
        </TabsContent>

        {/* Recurrence Tab */}
        <TabsContent value="recurrence" className="space-y-6">
          <RecurrenceSection logs={recurrence.logs} stats={recurrence.stats} />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
