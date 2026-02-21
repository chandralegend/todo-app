import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { listAccessibleWhere } from "@/lib/permissions";
import { ListsPageContent } from "@/components/lists/lists-page-content";

export default async function ListsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id;

  const taskLists = await prisma.taskList.findMany({
    where: listAccessibleWhere(userId),
    include: {
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

  const now = new Date();

  const lists = taskLists.map((l) => {
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

    // Collect unique tags (max 6)
    const tagSet = new Set<string>();
    for (const inst of l.instances) {
      for (const tag of inst.tagsSnapshot) {
        tagSet.add(tag);
        if (tagSet.size >= 6) break;
      }
      if (tagSet.size >= 6) break;
    }

    return {
      id: l.id,
      name: l.name,
      description: l.description,
      taskCount: total,
      overdue,
      progress,
      tags: Array.from(tagSet),
      role: l.ownerUserId === userId ? "OWNER" : l.members[0]?.role ?? "VIEWER",
    };
  });

  return <ListsPageContent lists={lists} />;
}
