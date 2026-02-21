import { prisma } from "@/lib/prisma";
import { getListAccess } from "@/lib/permissions";

export type TaskContextSnapshot = {
  list: {
    id: string;
    name: string;
    description: string | null;
  };
  tasks: Array<{
    id: string;
    description: string;
    status: string;
    importance: string;
    deadlineAt: string | null;
    tags: string[];
  }>;
};

export async function buildTaskContextForUser(args: {
  userId: string;
  listId: string;
  limit?: number;
}): Promise<TaskContextSnapshot | null> {
  const access = await getListAccess(args.userId, args.listId);
  if (!access) {
    return null;
  }

  const list = await prisma.taskList.findFirst({
    where: {
      id: args.listId,
      isArchived: false,
    },
    select: {
      id: true,
      name: true,
      description: true,
      instances: {
        orderBy: [{ deadlineAt: "asc" }, { createdAt: "desc" }],
        take: args.limit ?? 50,
        select: {
          id: true,
          descriptionSnapshot: true,
          status: true,
          importanceSnapshot: true,
          deadlineAt: true,
          tagsSnapshot: true,
        },
      },
    },
  });

  if (!list) {
    return null;
  }

  return {
    list: {
      id: list.id,
      name: list.name,
      description: list.description,
    },
    tasks: list.instances.map((task) => ({
      id: task.id,
      description: task.descriptionSnapshot,
      status: task.status,
      importance: task.importanceSnapshot,
      deadlineAt: task.deadlineAt ? task.deadlineAt.toISOString() : null,
      tags: task.tagsSnapshot,
    })),
  };
}
