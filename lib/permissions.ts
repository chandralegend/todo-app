import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ListAccess = {
  listId: string;
  role: UserRole;
};

export async function getListAccess(userId: string, listId: string): Promise<ListAccess | null> {
  const list = await prisma.taskList.findFirst({
    where: {
      id: listId,
      isArchived: false,
      OR: [
        { ownerUserId: userId },
        {
          members: {
            some: {
              userId,
            },
          },
        },
      ],
    },
    select: {
      id: true,
      ownerUserId: true,
      members: {
        where: { userId },
        select: { role: true },
        take: 1,
      },
    },
  });

  if (!list) {
    return null;
  }

  const role = list.ownerUserId === userId ? "OWNER" : list.members[0]?.role;
  if (!role) {
    return null;
  }

  return {
    listId: list.id,
    role,
  };
}

export function canReadList(role: UserRole): boolean {
  return role === "OWNER" || role === "EDITOR" || role === "VIEWER";
}

export function canWriteList(role: UserRole): boolean {
  return role === "OWNER" || role === "EDITOR";
}

export function canManageList(role: UserRole): boolean {
  return role === "OWNER";
}

export function listAccessibleWhere(userId: string) {
  return {
    isArchived: false,
    OR: [
      { ownerUserId: userId },
      {
        members: {
          some: {
            userId,
          },
        },
      },
    ],
  };
}
