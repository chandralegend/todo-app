import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canTransitionStatus } from "@/lib/task-status";
import { listAccessibleWhere } from "@/lib/permissions";
import { TodayContent } from "@/components/today/today-content";

export default async function TodayPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const focusTasks = await prisma.dailyFocus.findMany({
    where: { userId, date: today },
    include: {
      taskInstance: {
        select: {
          id: true,
          descriptionSnapshot: true,
          status: true,
          importanceSnapshot: true,
          deadlineAt: true,
          tagsSnapshot: true,
          taskList: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { position: "asc" },
  });

  const serializedTasks = focusTasks.map((f) => ({
    focusId: f.id,
    taskId: f.taskInstance.id,
    description: f.taskInstance.descriptionSnapshot,
    status: f.taskInstance.status,
    importance: f.taskInstance.importanceSnapshot,
    deadline: f.taskInstance.deadlineAt
      ? f.taskInstance.deadlineAt.toISOString()
      : null,
    tags: f.taskInstance.tagsSnapshot,
    listName: f.taskInstance.taskList.name,
    listId: f.taskInstance.taskList.id,
    completed: f.completed,
    position: f.position,
  }));

  const completedCount = serializedTasks.filter((t) => t.completed).length;
  const totalCount = serializedTasks.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Fetch pending tasks (not already in today's focus) for the "Add Tasks" dialog
  const focusTaskIds = new Set(focusTasks.map((f) => f.taskInstance.id));

  const pendingTasks = await prisma.taskInstance.findMany({
    where: {
      taskList: listAccessibleWhere(userId),
      status: { in: ["TODO", "IN_PROGRESS"] },
    },
    select: {
      id: true,
      descriptionSnapshot: true,
      status: true,
      importanceSnapshot: true,
      deadlineAt: true,
      tagsSnapshot: true,
      taskList: { select: { id: true, name: true } },
    },
    orderBy: [{ importanceSnapshot: "desc" }, { deadlineAt: "asc" }],
    take: 100,
  });

  const availableTasks = pendingTasks
    .filter((t) => !focusTaskIds.has(t.id))
    .map((t) => ({
      id: t.id,
      description: t.descriptionSnapshot,
      status: t.status,
      importance: t.importanceSnapshot,
      deadline: t.deadlineAt ? t.deadlineAt.toISOString() : null,
      tags: t.tagsSnapshot,
      listName: t.taskList.name,
      listId: t.taskList.id,
    }));

  async function addToFocus(formData: FormData) {
    "use server";

    const currentSession = await auth();
    if (!currentSession?.user) {
      redirect("/login");
    }

    const taskIdsStr = String(formData.get("taskIds") ?? "");
    if (!taskIdsStr) return;

    const taskIds = taskIdsStr.split(",").filter(Boolean);
    if (taskIds.length === 0) return;

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    // Get current max position
    const maxPos = await prisma.dailyFocus.findFirst({
      where: { userId: currentSession.user.id, date: todayDate },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    let position = (maxPos?.position ?? -1) + 1;

    for (const taskId of taskIds) {
      try {
        await prisma.dailyFocus.create({
          data: {
            userId: currentSession.user.id,
            taskInstanceId: taskId,
            date: todayDate,
            position: position++,
          },
        });
      } catch {
        // Duplicate — skip
      }
    }

    revalidatePath("/today");
  }

  async function toggleFocusComplete(formData: FormData) {
    "use server";

    const currentSession = await auth();
    if (!currentSession?.user) {
      redirect("/login");
    }

    const focusId = String(formData.get("focusId") ?? "");
    const completed = formData.get("completed") === "true";

    if (!focusId) return;

    const focus = await prisma.dailyFocus.findFirst({
      where: { id: focusId, userId: currentSession.user.id },
      select: { id: true },
    });

    if (!focus) return;

    await prisma.dailyFocus.update({
      where: { id: focus.id },
      data: {
        completed: !completed,
        completedAt: !completed ? new Date() : null,
      },
    });

    revalidatePath("/today");
  }

  async function updateTaskStatus(formData: FormData) {
    "use server";

    const currentSession = await auth();
    if (!currentSession?.user) {
      redirect("/login");
    }

    const taskId = String(formData.get("taskId") ?? "");
    const nextStatus = String(formData.get("status") ?? "TODO");

    if (!taskId) return;

    const task = await prisma.taskInstance.findFirst({
      where: { id: taskId },
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

    revalidatePath("/today");
  }

  async function removeFocus(formData: FormData) {
    "use server";

    const currentSession = await auth();
    if (!currentSession?.user) {
      redirect("/login");
    }

    const focusId = String(formData.get("focusId") ?? "");
    if (!focusId) return;

    const focus = await prisma.dailyFocus.findFirst({
      where: { id: focusId, userId: currentSession.user.id },
      select: { id: true },
    });

    if (!focus) return;

    await prisma.dailyFocus.delete({
      where: { id: focus.id },
    });

    revalidatePath("/today");
  }

  return (
    <TodayContent
      tasks={serializedTasks}
      availableTasks={availableTasks}
      completedCount={completedCount}
      totalCount={totalCount}
      progress={progress}
      addToFocusAction={addToFocus}
      toggleFocusCompleteAction={toggleFocusComplete}
      updateTaskStatusAction={updateTaskStatus}
      removeFocusAction={removeFocus}
    />
  );
}
