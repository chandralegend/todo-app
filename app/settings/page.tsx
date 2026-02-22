import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma, getDatabasePath } from "@/lib/prisma";
import { getAllSettings } from "@/lib/settings";
import { SettingsContent } from "@/components/settings/settings-content";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // Fetch recurrence logs for the Recurrence tab
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const logs = await (prisma as any).recurrenceRunLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const totalRuns = logs.length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastRun = logs.length > 0 ? (logs[0] as any).createdAt : null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createdToday = logs.reduce((sum: number, log: any) => {
    const logDate = new Date(log.createdAt);
    const today = new Date();
    if (
      logDate.getDate() === today.getDate() &&
      logDate.getMonth() === today.getMonth() &&
      logDate.getFullYear() === today.getFullYear()
    ) {
      return sum + (log.generated ?? 0);
    }
    return sum;
  }, 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serializedLogs = logs.map((log: any) => ({
    id: log.id,
    createdAt: log.createdAt.toISOString(),
    status: log.status,
    templatesScanned: log.templatesScanned,
    attempted: log.attempted,
    generated: log.generated,
    duplicateOrExisting: log.duplicateOrExisting,
    windowStart: log.windowStart.toISOString(),
    windowEnd: log.windowEnd.toISOString(),
    errorMessage: log.errorMessage,
  }));

  // Get resolved database path
  const dbUrl = getDatabasePath();

  // Fetch app settings from database
  const appSettings = await getAllSettings();

  // Mask the API key for display (only show last 4 chars)
  const hasApiKey = !!appSettings.openai_api_key;
  const maskedApiKey = hasApiKey
    ? `sk-...${appSettings.openai_api_key.slice(-4)}`
    : "";

  return (
    <SettingsContent
      user={{
        name: session.user.name ?? "",
        email: session.user.email ?? "",
      }}
      recurrence={{
        logs: serializedLogs,
        stats: {
          totalRuns,
          lastRun: lastRun ? lastRun.toISOString() : null,
          createdToday,
        },
      }}
      databaseUrl={dbUrl}
      appSettings={{
        cursorEnabled: appSettings.cursor_enabled !== "false", // default true
        hasApiKey,
        maskedApiKey,
        dbMode: (appSettings.db_mode as "local" | "cloud") || "local",
        cloudDbUrl: appSettings.cloud_db_url || "",
      }}
    />
  );
}
