import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageList, getListAccess } from "@/lib/permissions";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const access = await getListAccess(session.user.id, id);

  if (!access) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const list = await prisma.taskList.findFirst({
    where: { id, isArchived: false },
    select: {
      id: true,
      name: true,
      owner: {
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
        },
      },
      members: {
        select: {
          id: true,
          role: true,
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              displayName: true,
            },
          },
        },
      },
    },
  });

  if (!list) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    list,
    currentRole: access.role,
  });
}

export async function POST(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const access = await getListAccess(session.user.id, id);
  if (!access || !canManageList(access.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const role = String(body?.role ?? "VIEWER").toUpperCase();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  if (!["EDITOR", "VIEWER"].includes(role)) {
    return NextResponse.json({ error: "Role must be EDITOR or VIEWER" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const list = await prisma.taskList.findFirst({
    where: { id },
    select: { ownerUserId: true },
  });

  if (!list) {
    return NextResponse.json({ error: "List not found" }, { status: 404 });
  }

  if (list.ownerUserId === user.id) {
    return NextResponse.json({ error: "Owner already has access" }, { status: 400 });
  }

  const member = await prisma.taskListMember.upsert({
    where: {
      taskListId_userId: {
        taskListId: id,
        userId: user.id,
      },
    },
    update: {
      role: role as "EDITOR" | "VIEWER",
    },
    create: {
      taskListId: id,
      userId: user.id,
      role: role as "EDITOR" | "VIEWER",
    },
    select: {
      id: true,
      role: true,
      user: {
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
        },
      },
    },
  });

  return NextResponse.json({ member });
}
