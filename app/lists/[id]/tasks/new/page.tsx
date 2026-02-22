import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateRecurringInstances } from "@/lib/recurrence";
import { canWriteList, getListAccess } from "@/lib/permissions";
import { NewTaskContent } from "@/components/lists/new-task-content";
import { serializeTags, serializeDaysOfWeek } from "@/lib/array-fields";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function NewTaskPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  const access = await getListAccess(session.user.id, id);
  if (!access || !canWriteList(access.role)) {
    notFound();
  }

  const list = await prisma.taskList.findFirst({
    where: { id, isArchived: false },
    select: { id: true, name: true },
  });

  if (!list) {
    notFound();
  }

  async function createTask(formData: FormData) {
    "use server";

    const currentSession = await auth();
    if (!currentSession?.user) {
      redirect("/login");
    }

    const listId = String(formData.get("listId") ?? "");
    const description = String(formData.get("description") ?? "").trim();
    const deadlineRaw = String(formData.get("deadlineAt") ?? "").trim();
    const importance = String(formData.get("importance") ?? "MEDIUM");
    const status = String(formData.get("status") ?? "TODO");
    const tagsRaw = String(formData.get("tags") ?? "").trim();
    const isRecurring = formData.get("isRecurring") === "on";
    const recurrenceFrequency = String(
      formData.get("recurrenceFrequency") ?? "DAILY"
    );
    const recurrenceInterval = Math.max(
      1,
      Number(formData.get("recurrenceInterval") ?? 1)
    );
    const recurrenceTime = String(
      formData.get("recurrenceTime") ?? ""
    ).trim();
    const recurrenceWeekday = Number(
      formData.get("recurrenceWeekday") ?? new Date().getDay()
    );
    const recurrenceStartDateRaw = String(
      formData.get("recurrenceStartDate") ?? ""
    ).trim();
    const recurrenceEndDateRaw = String(
      formData.get("recurrenceEndDate") ?? ""
    ).trim();

    if (!description || !listId) return;

    const listAccess = await getListAccess(currentSession.user.id, listId);
    if (!listAccess || !canWriteList(listAccess.role)) return;

    const tags = tagsRaw
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

    const deadlineAt = deadlineRaw ? new Date(deadlineRaw) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const recurrenceStartDate = recurrenceStartDateRaw
      ? new Date(`${recurrenceStartDateRaw}T00:00:00.000Z`)
      : new Date(today);
    const recurrenceEndDate = recurrenceEndDateRaw
      ? new Date(`${recurrenceEndDateRaw}T00:00:00.000Z`)
      : null;

    await prisma.$transaction(async (tx) => {
      const recurrenceRule = isRecurring
        ? await tx.recurrenceRule.create({
            data: {
              frequency: recurrenceFrequency as
                | "DAILY"
                | "WEEKLY"
                | "MONTHLY"
                | "CUSTOM",
              intervalValue: recurrenceInterval,
              timeOfDay: recurrenceTime || null,
              startDate: recurrenceStartDate,
              endDate: recurrenceEndDate,
              timezone: "Asia/Colombo",
              daysOfWeek:
                recurrenceFrequency === "WEEKLY" ? serializeDaysOfWeek([recurrenceWeekday]) : serializeDaysOfWeek([]),
            },
          })
        : null;

      const template = await tx.taskTemplate.create({
        data: {
          taskListId: listId,
          createdByUserId: currentSession.user.id,
          description,
          importance: importance as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
          isRecurring,
          isActive: true,
          templateStatus: status as
            | "DRAFT"
            | "TODO"
            | "IN_PROGRESS"
            | "COMPLETED"
            | "FAILED",
          tags: serializeTags(tags),
          recurrenceRuleId: recurrenceRule?.id,
        },
      });

      if (!isRecurring) {
        await tx.taskInstance.create({
          data: {
            taskTemplateId: template.id,
            taskListId: listId,
            occurrenceDate: today,
            deadlineAt,
            descriptionSnapshot: description,
            importanceSnapshot: importance as
              | "LOW"
              | "MEDIUM"
              | "HIGH"
              | "CRITICAL",
            tagsSnapshot: serializeTags(tags),
            status: status as
              | "DRAFT"
              | "TODO"
              | "IN_PROGRESS"
              | "COMPLETED"
              | "FAILED",
            startedAt: status === "IN_PROGRESS" ? new Date() : null,
            completedAt: status === "COMPLETED" ? new Date() : null,
            failedAt: status === "FAILED" ? new Date() : null,
            completedByUserId:
              status === "COMPLETED" ? currentSession.user.id : null,
            failedByUserId:
              status === "FAILED" ? currentSession.user.id : null,
          },
        });
      }
    });

    if (isRecurring) {
      await generateRecurringInstances({
        windowStart: today,
        windowEnd: today,
      });
    }

    revalidatePath(`/lists/${listId}`);
    redirect(`/lists/${listId}`);
  }

  return (
    <NewTaskContent
      list={{ id: list.id, name: list.name }}
      createTaskAction={createTask}
    />
  );
}
