import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listAccessibleWhere } from "@/lib/permissions";
import { RecurrenceContent } from "@/components/admin/recurrence-content";

export default async function RecurrenceAdminPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const logs = await (prisma as any).recurrenceRunLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // Sidebar lists
  const taskLists = await prisma.taskList.findMany({
    where: listAccessibleWhere(session.user.id),
    select: {
      id: true,
      name: true,
      _count: { select: { instances: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const sidebarLists = taskLists.map((l: { id: string; name: string; _count: { instances: number } }) => ({
    id: l.id,
    name: l.name,
    taskCount: l._count.instances,
  }));

  // Compute stats
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

  return (
    <RecurrenceContent
      logs={serializedLogs}
      stats={{
        totalRuns,
        lastRun: lastRun ? lastRun.toISOString() : null,
        createdToday,
      }}
      sidebarLists={sidebarLists}
    />
  );
}
