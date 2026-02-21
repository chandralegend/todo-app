import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { listAccessibleWhere } from "@/lib/permissions";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Fetch lists with task counts
  const taskLists = await prisma.taskList.findMany({
    where: listAccessibleWhere(userId),
    include: {
      _count: {
        select: { templates: true, instances: true },
      },
      instances: {
        select: {
          status: true,
          deadlineAt: true,
          tagsSnapshot: true,
        },
      },
      members: {
        where: { userId },
        select: { role: true },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Compute stats
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  let todayCount = 0;
  let overdueCount = 0;
  let inProgressCount = 0;
  let completedThisWeekCount = 0;

  // Get start of this week (Monday)
  const startOfWeek = new Date(now);
  const dayOfWeek = startOfWeek.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startOfWeek.setDate(startOfWeek.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const allInstances = taskLists.flatMap((l) => l.instances);
  for (const inst of allInstances) {
    if (inst.status === "IN_PROGRESS") inProgressCount++;
    if (inst.status === "COMPLETED") {
      completedThisWeekCount++;
    }
    if (inst.deadlineAt) {
      const dl = new Date(inst.deadlineAt);
      if (dl >= startOfToday && dl < endOfToday && inst.status !== "COMPLETED" && inst.status !== "FAILED") {
        todayCount++;
      }
      if (dl < now && inst.status !== "COMPLETED" && inst.status !== "FAILED") {
        overdueCount++;
      }
    }
  }

  const listsForDashboard = taskLists.map((l) => {
    const total = l.instances.length;
    const completed = l.instances.filter((i) => i.status === "COMPLETED").length;
    const overdue = l.instances.filter(
      (i) =>
        i.deadlineAt &&
        new Date(i.deadlineAt) < now &&
        i.status !== "COMPLETED" &&
        i.status !== "FAILED"
    ).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Collect unique tags (max 4)
    const tagSet = new Set<string>();
    for (const inst of l.instances) {
      for (const tag of inst.tagsSnapshot) {
        tagSet.add(tag);
        if (tagSet.size >= 4) break;
      }
      if (tagSet.size >= 4) break;
    }

    return {
      id: l.id,
      name: l.name,
      description: l.description,
      taskCount: total,
      overdue,
      progress,
      tags: Array.from(tagSet),
      isOwner: l.ownerUserId === userId,
      role: l.ownerUserId === userId ? "OWNER" : l.members[0]?.role ?? "VIEWER",
    };
  });

  return (
    <DashboardContent
      stats={{
        today: todayCount,
        overdue: overdueCount,
        inProgress: inProgressCount,
        completedThisWeek: completedThisWeekCount,
      }}
      lists={listsForDashboard}
    />
  );
}
