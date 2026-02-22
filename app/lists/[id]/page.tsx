import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canTransitionStatus, getAllowedTaskStatuses } from "@/lib/task-status";
import { canWriteList, getListAccess } from "@/lib/permissions";
import { ListViewContent } from "@/components/lists/list-view-content";
import { parseTags, serializeTags } from "@/lib/array-fields";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    status?: string;
    importance?: string;
    due?: string;
    tag?: string;
    sort?: string;
  }>;
};

const statusOptions = [
  "ALL", "DRAFT", "TODO", "IN_PROGRESS", "COMPLETED", "FAILED",
] as const;
const importanceOptions = [
  "ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL",
] as const;
const dueOptions = ["all", "today", "overdue", "upcoming"] as const;
const sortOptions = [
  "created_desc", "deadline_asc", "importance_desc",
] as const;

export default async function ListPage({ params, searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;
  const filters = await searchParams;

  const statusFilter = statusOptions.includes(
    (filters.status ?? "ALL") as (typeof statusOptions)[number]
  )
    ? (filters.status ?? "ALL")
    : "ALL";
  const importanceFilter = importanceOptions.includes(
    (filters.importance ?? "ALL") as (typeof importanceOptions)[number]
  )
    ? (filters.importance ?? "ALL")
    : "ALL";
  const dueFilter = dueOptions.includes(
    (filters.due ?? "all") as (typeof dueOptions)[number]
  )
    ? (filters.due ?? "all")
    : "all";
  const sortFilter = sortOptions.includes(
    (filters.sort ?? "created_desc") as (typeof sortOptions)[number]
  )
    ? (filters.sort ?? "created_desc")
    : "created_desc";
  const tagFilter = (filters.tag ?? "").trim().toLowerCase();

  const access = await getListAccess(session.user.id, id);
  if (!access) {
    notFound();
  }

  const list = await prisma.taskList.findFirst({
    where: { id, isArchived: false },
    select: { id: true, name: true, description: true },
  });

  if (!list) {
    notFound();
  }

  // Date filters
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const whereClause: any = { taskListId: id };
  /* eslint-enable @typescript-eslint/no-explicit-any */

  if (statusFilter !== "ALL") {
    whereClause.status = statusFilter;
  }
  if (importanceFilter !== "ALL") {
    whereClause.importanceSnapshot = importanceFilter;
  }
  if (tagFilter) {
    whereClause.tagsSnapshot = { contains: tagFilter };
  }
  if (dueFilter === "today") {
    whereClause.deadlineAt = { gte: startOfToday, lt: endOfToday };
  } else if (dueFilter === "overdue") {
    whereClause.deadlineAt = { lt: now };
    if (!whereClause.status) {
      whereClause.status = { notIn: ["COMPLETED", "FAILED"] };
    }
  } else if (dueFilter === "upcoming") {
    whereClause.deadlineAt = { gte: endOfToday };
  }

  const orderByClause =
    sortFilter === "deadline_asc"
      ? [{ deadlineAt: "asc" as const }, { createdAt: "desc" as const }]
      : sortFilter === "importance_desc"
        ? [
            { importanceSnapshot: "desc" as const },
            { createdAt: "desc" as const },
          ]
        : [{ createdAt: "desc" as const }];

  const tasks = await prisma.taskInstance.findMany({
    where: whereClause,
    take: 50,
    orderBy: orderByClause,
  });

  // List-wide stats (unfiltered)
  const allTasks = await prisma.taskInstance.findMany({
    where: { taskListId: id },
    select: { status: true, deadlineAt: true, tagsSnapshot: true },
  });

  const totalTasks = allTasks.length;
  const overdueCount = allTasks.filter(
    (t: { status: string; deadlineAt: Date | null; tagsSnapshot: string | null }) =>
      t.deadlineAt &&
      new Date(t.deadlineAt) < now &&
      t.status !== "COMPLETED" &&
      t.status !== "FAILED"
  ).length;
  const completedCount = allTasks.filter(
    (t: { status: string }) => t.status === "COMPLETED"
  ).length;
  const progress =
    totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Collect unique tags (max 8)
  const tagSet = new Set<string>();
  for (const t of allTasks) {
    for (const tag of parseTags(t.tagsSnapshot)) {
      tagSet.add(tag);
      if (tagSet.size >= 8) break;
    }
    if (tagSet.size >= 8) break;
  }
  const allTags = Array.from(tagSet);

  const canWrite = canWriteList(access.role);
  const allowedStatuses: Record<string, string[]> = {};
  for (const t of tasks) {
    allowedStatuses[t.id] = getAllowedTaskStatuses(t.status);
  }

  const serializedTasks = tasks.map((t) => ({
    id: t.id,
    descriptionSnapshot: t.descriptionSnapshot,
    status: t.status,
    importanceSnapshot: t.importanceSnapshot,
    deadlineAt: t.deadlineAt ? t.deadlineAt.toISOString() : null,
    tagsSnapshot: parseTags(t.tagsSnapshot),
    occurrenceDate: t.occurrenceDate.toISOString(),
  }));

  async function updateTaskStatus(formData: FormData) {
    "use server";

    const currentSession = await auth();
    if (!currentSession?.user) {
      redirect("/login");
    }

    const taskId = String(formData.get("taskId") ?? "");
    const nextStatus = String(formData.get("status") ?? "TODO");

    if (!taskId) return;

    const listAccess = await getListAccess(currentSession.user.id, id);
    if (!listAccess || !canWriteList(listAccess.role)) return;

    const task = await prisma.taskInstance.findFirst({
      where: { id: taskId, taskListId: id },
      select: { id: true, status: true },
    });

    if (!task) return;

    const status = nextStatus as
      | "DRAFT"
      | "TODO"
      | "IN_PROGRESS"
      | "COMPLETED"
      | "FAILED";

    if (!canTransitionStatus(task.status, status)) return;

    const nowDate = new Date();
    await prisma.taskInstance.update({
      where: { id: task.id },
      data:
        status === "IN_PROGRESS"
          ? { status, startedAt: nowDate }
          : status === "COMPLETED"
            ? {
                status,
                completedAt: nowDate,
                completedByUserId: currentSession.user.id,
                failedAt: null,
                failedByUserId: null,
              }
            : status === "FAILED"
              ? {
                  status,
                  failedAt: nowDate,
                  failedByUserId: currentSession.user.id,
                  completedAt: null,
                  completedByUserId: null,
                }
              : {
                  status,
                  completedAt: null,
                  completedByUserId: null,
                  failedAt: null,
                  failedByUserId: null,
                },
    });

    revalidatePath(`/lists/${id}`);
  }

  async function editTask(formData: FormData) {
    "use server";

    const currentSession = await auth();
    if (!currentSession?.user) {
      redirect("/login");
    }

    const taskId = String(formData.get("taskId") ?? "");
    if (!taskId) return;

    const listAccess = await getListAccess(currentSession.user.id, id);
    if (!listAccess || !canWriteList(listAccess.role)) return;

    const task = await prisma.taskInstance.findFirst({
      where: { id: taskId, taskListId: id },
      select: { id: true, status: true },
    });
    if (!task) return;

    const description = String(formData.get("description") ?? "").trim();
    const deadlineAtStr = String(formData.get("deadlineAt") ?? "").trim();
    const importance = String(formData.get("importance") ?? "MEDIUM") as
      | "LOW"
      | "MEDIUM"
      | "HIGH"
      | "CRITICAL";
    const newStatus = String(formData.get("status") ?? task.status) as
      | "DRAFT"
      | "TODO"
      | "IN_PROGRESS"
      | "COMPLETED"
      | "FAILED";
    const tagsStr = String(formData.get("tags") ?? "").trim();
    const tags = tagsStr
      ? tagsStr.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
      : [];

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const updateData: any = {
      descriptionSnapshot: description || undefined,
      importanceSnapshot: importance,
      tagsSnapshot: serializeTags(tags),
      deadlineAt: deadlineAtStr ? new Date(deadlineAtStr) : null,
    };
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Handle status change if different
    if (newStatus !== task.status && canTransitionStatus(task.status, newStatus)) {
      const nowDate = new Date();
      updateData.status = newStatus;
      if (newStatus === "IN_PROGRESS") {
        updateData.startedAt = nowDate;
      } else if (newStatus === "COMPLETED") {
        updateData.completedAt = nowDate;
        updateData.completedByUserId = currentSession.user.id;
        updateData.failedAt = null;
        updateData.failedByUserId = null;
      } else if (newStatus === "FAILED") {
        updateData.failedAt = nowDate;
        updateData.failedByUserId = currentSession.user.id;
        updateData.completedAt = null;
        updateData.completedByUserId = null;
      } else {
        updateData.completedAt = null;
        updateData.completedByUserId = null;
        updateData.failedAt = null;
        updateData.failedByUserId = null;
      }
    }

    await prisma.taskInstance.update({
      where: { id: task.id },
      data: updateData,
    });

    revalidatePath(`/lists/${id}`);
  }

  async function deleteTask(formData: FormData) {
    "use server";

    const currentSession = await auth();
    if (!currentSession?.user) {
      redirect("/login");
    }

    const taskId = String(formData.get("taskId") ?? "");
    if (!taskId) return;

    const listAccess = await getListAccess(currentSession.user.id, id);
    if (!listAccess || !canWriteList(listAccess.role)) return;

    const task = await prisma.taskInstance.findFirst({
      where: { id: taskId, taskListId: id },
      select: { id: true },
    });
    if (!task) return;

    await prisma.taskInstance.delete({
      where: { id: task.id },
    });

    revalidatePath(`/lists/${id}`);
  }

  async function quickCreateTask(formData: FormData) {
    "use server";

    const currentSession = await auth();
    if (!currentSession?.user) {
      redirect("/login");
    }

    const listAccess = await getListAccess(currentSession.user.id, id);
    if (!listAccess || !canWriteList(listAccess.role)) return;

    const description = String(formData.get("description") ?? "").trim();
    if (!description) return;

    const deadlineAtStr = String(formData.get("deadlineAt") ?? "").trim();
    const importance = String(formData.get("importance") ?? "MEDIUM") as
      | "LOW"
      | "MEDIUM"
      | "HIGH"
      | "CRITICAL";
    const status = String(formData.get("status") ?? "TODO") as
      | "DRAFT"
      | "TODO"
      | "IN_PROGRESS"
      | "COMPLETED"
      | "FAILED";
    const tagsStr = String(formData.get("tags") ?? "").trim();
    const tags = tagsStr
      ? tagsStr.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
      : [];

    const nowDate = new Date();

    // Create template
    const template = await prisma.taskTemplate.create({
      data: {
        taskListId: id,
        createdByUserId: currentSession.user.id,
        description,
        importance,
        templateStatus: status,
        tags: serializeTags(tags),
      },
    });

    // Create instance
    await prisma.taskInstance.create({
      data: {
        taskTemplateId: template.id,
        taskListId: id,
        occurrenceDate: nowDate,
        deadlineAt: deadlineAtStr ? new Date(deadlineAtStr) : null,
        descriptionSnapshot: description,
        importanceSnapshot: importance,
        tagsSnapshot: serializeTags(tags),
        status,
      },
    });

    revalidatePath(`/lists/${id}`);
  }

  return (
    <ListViewContent
      list={{
        id: list.id,
        name: list.name,
        description: list.description,
        totalTasks,
        overdueCount,
        completedCount,
        progress,
        tags: allTags,
      }}
      tasks={serializedTasks}
      allowedStatuses={allowedStatuses}
      canWrite={canWrite}
      currentFilters={{
        status: statusFilter,
        importance: importanceFilter,
        due: dueFilter,
        sort: sortFilter,
        tag: tagFilter,
      }}
      updateTaskStatusAction={updateTaskStatus}
      editTaskAction={editTask}
      deleteTaskAction={deleteTask}
      quickCreateTaskAction={quickCreateTask}
    />
  );
}
