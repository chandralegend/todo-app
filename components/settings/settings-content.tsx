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
  Paintbrush,
  Bug,
  HardDrive,
  Cloud,
  Loader2,
  Upload,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/ui/stat-card";
import { BentoCard } from "@/components/ui/bento-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

interface AppSettings {
  cursorEnabled: boolean;
  hasApiKey: boolean;
  maskedApiKey: string;
  dbMode: "local" | "cloud";
  cloudDbUrl: string;
}

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
  appSettings: AppSettings;
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

/** Helper to save a setting via the API */
async function saveSetting(key: string, value: string): Promise<boolean> {
  try {
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function ApiKeySection({ hasApiKey, maskedApiKey }: { hasApiKey: boolean; maskedApiKey: string }) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentMasked, setCurrentMasked] = useState(maskedApiKey);
  const [currentHasKey, setCurrentHasKey] = useState(hasApiKey);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey.trim()) return;
    setSaving(true);
    const ok = await saveSetting("openai_api_key", apiKey.trim());
    setSaving(false);
    if (ok) {
      toast.success("API key saved to database");
      setSaved(true);
      setCurrentHasKey(true);
      setCurrentMasked(`sk-...${apiKey.trim().slice(-4)}`);
      setApiKey("");
      setTimeout(() => setSaved(false), 2000);
    } else {
      toast.error("Failed to save API key");
    }
  }

  async function handleRemove() {
    setSaving(true);
    const ok = await saveSetting("openai_api_key", "");
    setSaving(false);
    if (ok) {
      toast.success("API key removed");
      setCurrentHasKey(false);
      setCurrentMasked("");
    } else {
      toast.error("Failed to remove API key");
    }
  }

  return (
    <BentoCard interactive={false}>
      <div className="flex items-center gap-2 mb-4">
        <Brain className="size-4 text-coral" />
        <h3 className="font-semibold text-sm">OpenAI API Key</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Set your OpenAI API key for AI features. The key is stored securely in your local database.
      </p>

      {currentHasKey && (
        <div className="flex items-center gap-2 mb-4 text-xs">
          <CheckCircle2 className="size-3.5 text-status-completed" />
          <span className="text-muted-foreground">
            Current key: <code className="bg-muted px-1.5 py-0.5 rounded font-mono">{currentMasked}</code>
          </span>
          <button
            type="button"
            onClick={handleRemove}
            disabled={saving}
            className="text-destructive hover:text-destructive/80 underline underline-offset-2 ml-1"
          >
            Remove
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4 max-w-sm">
        <div className="space-y-1.5">
          <Label htmlFor="api-key" className="text-xs">
            {currentHasKey ? "Replace API Key" : "API Key"}
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
          disabled={saving || !apiKey.trim()}
          className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-xs font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
        >
          {saved ? <CheckCircle2 className="size-3.5" /> : <Key className="size-3.5" />}
          {saving ? "Saving..." : saved ? "Saved" : "Save Key"}
        </button>
      </form>
    </BentoCard>
  );
}

function AppearanceSection({ cursorEnabled: initialCursorEnabled }: { cursorEnabled: boolean }) {
  const [cursorEnabled, setCursorEnabled] = useState(initialCursorEnabled);
  const [saving, setSaving] = useState(false);

  async function handleCursorToggle(checked: boolean) {
    setCursorEnabled(checked);
    setSaving(true);
    const ok = await saveSetting("cursor_enabled", checked ? "true" : "false");
    setSaving(false);
    if (ok) {
      toast.success(checked ? "Ant cursor enabled" : "Ant cursor disabled");
      // Dispatch a custom event so the CursorEffect component can react
      window.dispatchEvent(
        new CustomEvent("setting-changed", {
          detail: { key: "cursor_enabled", value: checked ? "true" : "false" },
        })
      );
    } else {
      // Revert on failure
      setCursorEnabled(!checked);
      toast.error("Failed to update setting");
    }
  }

  return (
    <BentoCard interactive={false}>
      <div className="flex items-center gap-2 mb-4">
        <Paintbrush className="size-4 text-coral" />
        <h3 className="font-semibold text-sm">Appearance</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between max-w-sm">
          <div className="space-y-0.5">
            <Label htmlFor="cursor-toggle" className="text-sm font-medium">
              Ant Cursor Trail
            </Label>
            <p className="text-xs text-muted-foreground">
              Show a trail of ants following your cursor
            </p>
          </div>
          <div className="flex items-center gap-2">
            {saving && (
              <span className="text-xs text-muted-foreground animate-pulse">Saving...</span>
            )}
            <Switch
              id="cursor-toggle"
              checked={cursorEnabled}
              onCheckedChange={handleCursorToggle}
              disabled={saving}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Bug className="size-3.5" />
          <span>The ant cursor is a fun Easter egg that adds animated ants following your mouse.</span>
        </div>
      </div>
    </BentoCard>
  );
}

function DatabaseSection({
  databaseUrl,
  initialMode,
  initialCloudUrl,
}: {
  databaseUrl: string;
  initialMode: "local" | "cloud";
  initialCloudUrl: string;
}) {
  const [mode, setMode] = useState<"local" | "cloud">(initialMode);
  const [cloudUrl, setCloudUrl] = useState(initialCloudUrl);
  const [saving, setSaving] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [pushResult, setPushResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleModeChange(newMode: "local" | "cloud") {
    setMode(newMode);
    setSaving(true);
    const ok = await saveSetting("db_mode", newMode);
    setSaving(false);
    if (ok) {
      toast.success(`Database mode set to ${newMode}`);
      if (newMode === "local") {
        setPushResult(null);
      }
    } else {
      setMode(mode); // revert
      toast.error("Failed to update database mode");
    }
  }

  async function handleSaveCloudUrl(e: React.FormEvent) {
    e.preventDefault();
    if (!cloudUrl.trim()) {
      toast.error("Please enter a database URL");
      return;
    }
    setSaving(true);
    const ok = await saveSetting("cloud_db_url", cloudUrl.trim());
    setSaving(false);
    if (ok) {
      toast.success("Cloud database URL saved");
      setPushResult(null);
    } else {
      toast.error("Failed to save database URL");
    }
  }

  async function handlePushSchema() {
    if (!cloudUrl.trim()) {
      toast.error("Please save a database URL first");
      return;
    }
    setPushing(true);
    setPushResult(null);
    try {
      const res = await fetch("/api/settings/push-schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: cloudUrl.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setPushResult({ ok: true, message: data.message || "Schema pushed successfully" });
        toast.success("Schema pushed to cloud database");
      } else {
        setPushResult({ ok: false, message: data.error || "Push failed" });
        toast.error("Schema push failed");
      }
    } catch {
      setPushResult({ ok: false, message: "Network error" });
      toast.error("Network error");
    } finally {
      setPushing(false);
    }
  }

  return (
    <BentoCard interactive={false}>
      <div className="flex items-center gap-2 mb-4">
        <Database className="size-4 text-coral" />
        <h3 className="font-semibold text-sm">Database</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-5">
        Choose where your data is stored. Local uses an embedded SQLite database on this device.
        Cloud lets you connect to an external database.
      </p>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-5">
        <button
          type="button"
          onClick={() => handleModeChange("local")}
          disabled={saving}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer flex-1 max-w-[200px] ${
            mode === "local"
              ? "border-coral bg-coral/5 text-coral"
              : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <HardDrive className="size-4" />
          Local
        </button>
        <button
          type="button"
          onClick={() => handleModeChange("cloud")}
          disabled={saving}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer flex-1 max-w-[200px] ${
            mode === "cloud"
              ? "border-coral bg-coral/5 text-coral"
              : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Cloud className="size-4" />
          Cloud
        </button>
      </div>

      {/* Local mode */}
      {mode === "local" && (
        <div className="space-y-1.5 max-w-lg">
          <Label className="text-xs">Database Path</Label>
          <Input
            value={databaseUrl}
            readOnly
            className="font-mono text-xs bg-muted"
          />
          <p className="text-[0.65rem] text-muted-foreground">
            Managed automatically by the application. Data is stored on this device.
          </p>
        </div>
      )}

      {/* Cloud mode */}
      {mode === "cloud" && (
        <div className="space-y-4 max-w-lg">
          <form onSubmit={handleSaveCloudUrl} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="cloud-db-url" className="text-xs">
                Database URL
              </Label>
              <Input
                id="cloud-db-url"
                type="text"
                value={cloudUrl}
                onChange={(e) => setCloudUrl(e.target.value)}
                placeholder="postgresql://user:pass@host:5432/dbname"
                className="font-mono text-xs"
              />
              <p className="text-[0.65rem] text-muted-foreground">
                Supports PostgreSQL, MySQL, or any Prisma-compatible connection string.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={saving || !cloudUrl.trim()}
                className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-xs font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
              >
                <Save className="size-3.5" />
                {saving ? "Saving..." : "Save URL"}
              </button>
              <button
                type="button"
                onClick={handlePushSchema}
                disabled={pushing || !cloudUrl.trim()}
                className="inline-flex items-center gap-2 rounded-full border border-coral text-coral px-4 py-2 text-xs font-medium hover:bg-coral/5 transition-colors disabled:opacity-50"
              >
                {pushing ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Upload className="size-3.5" />
                )}
                {pushing ? "Pushing..." : "Push Schema"}
              </button>
            </div>
          </form>

          {/* Push result */}
          {pushResult && (
            <div
              className={`rounded-lg border px-3 py-2 text-xs ${
                pushResult.ok
                  ? "border-status-completed/30 bg-status-completed/5 text-status-completed"
                  : "border-destructive/30 bg-destructive/5 text-destructive"
              }`}
            >
              <div className="flex items-start gap-2">
                {pushResult.ok ? (
                  <CheckCircle2 className="size-3.5 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle className="size-3.5 mt-0.5 shrink-0" />
                )}
                <pre className="whitespace-pre-wrap break-all font-mono text-[0.65rem] leading-relaxed">
                  {pushResult.message}
                </pre>
              </div>
            </div>
          )}

          <p className="text-[0.65rem] text-muted-foreground">
            <strong>Push Schema</strong> creates or updates the database tables on your cloud database.
            Run this after connecting a new database or when the app has been updated.
            Requires the app to restart to take effect.
          </p>
        </div>
      )}
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

export function SettingsContent({ user, recurrence, databaseUrl, appSettings }: SettingsContentProps) {
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
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
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
          <DatabaseSection
            databaseUrl={databaseUrl}
            initialMode={appSettings.dbMode}
            initialCloudUrl={appSettings.cloudDbUrl}
          />
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <AppearanceSection cursorEnabled={appSettings.cursorEnabled} />
        </TabsContent>

        {/* AI Tab */}
        <TabsContent value="ai" className="space-y-6">
          <ApiKeySection hasApiKey={appSettings.hasApiKey} maskedApiKey={appSettings.maskedApiKey} />
        </TabsContent>

        {/* Recurrence Tab */}
        <TabsContent value="recurrence" className="space-y-6">
          <RecurrenceSection logs={recurrence.logs} stats={recurrence.stats} />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
