import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canTransitionStatus, getAllowedTaskStatuses } from "@/lib/task-status";
import { canWriteList, getListAccess } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

const statusOptions = ["ALL", "DRAFT", "TODO", "IN_PROGRESS", "COMPLETED", "FAILED"] as const;
const importanceOptions = ["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
const dueOptions = ["all", "today", "overdue", "upcoming"] as const;
const sortOptions = ["created_desc", "deadline_asc", "importance_desc"] as const;

export default async function ListPage({ params, searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;
  const filters = await searchParams;

  const statusFilter = statusOptions.includes((filters.status ?? "ALL") as (typeof statusOptions)[number])
    ? (filters.status ?? "ALL")
    : "ALL";
  const importanceFilter = importanceOptions.includes((filters.importance ?? "ALL") as (typeof importanceOptions)[number])
    ? (filters.importance ?? "ALL")
    : "ALL";
  const dueFilter = dueOptions.includes((filters.due ?? "all") as (typeof dueOptions)[number])
    ? (filters.due ?? "all")
    : "all";
  const sortFilter = sortOptions.includes((filters.sort ?? "created_desc") as (typeof sortOptions)[number])
    ? (filters.sort ?? "created_desc")
    : "created_desc";
  const tagFilter = (filters.tag ?? "").trim().toLowerCase();

  const access = await getListAccess(session.user.id, id);
  if (!access) {
    notFound();
  }

  const list = await prisma.taskList.findFirst({
    where: {
      id,
      isArchived: false,
    },
    select: {
      id: true,
      name: true,
      description: true,
      _count: {
        select: { templates: true, instances: true },
      },
    },
  });

  if (!list) {
    notFound();
  }

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const whereClause: {
    taskListId: string;
    status?: "DRAFT" | "TODO" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    importanceSnapshot?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    tagsSnapshot?: { has: string };
    deadlineAt?:
      | { gte: Date; lt: Date }
      | { lt: Date }
      | { gte: Date };
  } = {
    taskListId: id,
  };

  if (statusFilter !== "ALL") {
    whereClause.status = statusFilter as "DRAFT" | "TODO" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  }

  if (importanceFilter !== "ALL") {
    whereClause.importanceSnapshot = importanceFilter as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  }

  if (tagFilter) {
    whereClause.tagsSnapshot = { has: tagFilter };
  }

  if (dueFilter === "today") {
    whereClause.deadlineAt = { gte: startOfToday, lt: endOfToday };
  } else if (dueFilter === "overdue") {
    whereClause.deadlineAt = { lt: now };
  } else if (dueFilter === "upcoming") {
    whereClause.deadlineAt = { gte: endOfToday };
  }

  const orderByClause =
    sortFilter === "deadline_asc"
      ? [{ deadlineAt: "asc" as const }, { createdAt: "desc" as const }]
      : sortFilter === "importance_desc"
        ? [{ importanceSnapshot: "desc" as const }, { createdAt: "desc" as const }]
        : [{ createdAt: "desc" as const }];

  const tasks = await prisma.taskInstance.findMany({
    where: whereClause,
    take: 50,
    orderBy: orderByClause,
  });

  async function updateTaskStatus(formData: FormData) {
    "use server";

    const currentSession = await auth();
    if (!currentSession?.user) {
      redirect("/login");
    }

    const taskId = String(formData.get("taskId") ?? "");
    const nextStatus = String(formData.get("status") ?? "TODO");

    if (!taskId) {
      return;
    }

    const listAccess = await getListAccess(currentSession.user.id, id);
    if (!listAccess || !canWriteList(listAccess.role)) {
      return;
    }

    const task = await prisma.taskInstance.findFirst({
      where: {
        id: taskId,
        taskListId: id,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!task) {
      notFound();
    }

    const nowDate = new Date();
    const status = nextStatus as "DRAFT" | "TODO" | "IN_PROGRESS" | "COMPLETED" | "FAILED";

    if (!canTransitionStatus(task.status, status)) {
      return;
    }

    await prisma.taskInstance.update({
      where: { id: task.id },
      data:
        status === "IN_PROGRESS"
          ? {
              status,
              startedAt: nowDate,
            }
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <main className="max-w-4xl mx-auto py-8">
        <div className="mb-6">
          <Link href="/" className="text-sm text-gray-600 hover:underline">
            ← Back to lists
          </Link>
        </div>

        <div className="flex items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{list.name}</h1>
            {list.description ? (
              <p className="text-gray-600 mt-1">{list.description}</p>
            ) : null}
          </div>
          <Badge variant="secondary">
            {list._count.templates + list._count.instances} tasks
          </Badge>
        </div>

        <div className="mb-6">
          {canWriteList(access.role) ? (
            <Button asChild>
              <Link href={`/lists/${list.id}/tasks/new`}>+ Add Task</Link>
            </Button>
          ) : null}
        </div>

        <Card className="mb-6">
          <CardContent className="pt-4">
            <form className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
              <div className="flex flex-col gap-1">
                <label htmlFor="status" className="text-xs text-gray-600">Status</label>
                <select id="status" name="status" defaultValue={statusFilter} className="h-8 rounded-lg border bg-transparent px-2.5 py-1 text-sm">
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>{option.replace("_", " ")}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="importance" className="text-xs text-gray-600">Importance</label>
                <select id="importance" name="importance" defaultValue={importanceFilter} className="h-8 rounded-lg border bg-transparent px-2.5 py-1 text-sm">
                  {importanceOptions.map((option) => (
                    <option key={option} value={option}>{option.replace("_", " ")}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="due" className="text-xs text-gray-600">Due</label>
                <select id="due" name="due" defaultValue={dueFilter} className="h-8 rounded-lg border bg-transparent px-2.5 py-1 text-sm">
                  {dueOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="sort" className="text-xs text-gray-600">Sort</label>
                <select id="sort" name="sort" defaultValue={sortFilter} className="h-8 rounded-lg border bg-transparent px-2.5 py-1 text-sm">
                  <option value="created_desc">Created (newest)</option>
                  <option value="deadline_asc">Deadline (soonest)</option>
                  <option value="importance_desc">Importance (highest)</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Button type="submit" className="w-full">Apply</Button>
              </div>
              <div className="md:col-span-5 flex flex-col gap-1">
                <label htmlFor="tag" className="text-xs text-gray-600">Tag</label>
                <input id="tag" name="tag" defaultValue={tagFilter} placeholder="urgent" className="h-8 rounded-lg border bg-transparent px-2.5 py-1 text-sm" />
              </div>
            </form>
          </CardContent>
        </Card>

        {tasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">No tasks found for this filter.</p>
              {canWriteList(access.role) ? (
                <Button asChild>
                  <Link href={`/lists/${list.id}/tasks/new`}>Add your first task</Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <Card key={task.id}>
                <CardHeader className="py-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <CardTitle className="text-base">{task.descriptionSnapshot}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{task.importanceSnapshot}</Badge>
                      <Badge variant="outline">{task.status.replace("_", " ")}</Badge>
                    </div>
                  </div>
                  {task.deadlineAt ? (
                    <p className="text-xs text-gray-500">
                      Due {new Date(task.deadlineAt).toLocaleString()}
                    </p>
                  ) : null}
                  {task.tagsSnapshot.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {task.tagsSnapshot.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                  {canWriteList(access.role) ? (
                    <form action={updateTaskStatus} className="flex items-center gap-2 pt-2">
                      <input type="hidden" name="taskId" value={task.id} />
                      <select name="status" defaultValue={task.status} className="h-8 rounded-lg border bg-transparent px-2.5 py-1 text-sm">
                        {getAllowedTaskStatuses(task.status).map((option) => (
                          <option key={option} value={option}>{option.replace("_", " ")}</option>
                        ))}
                      </select>
                      <Button type="submit" size="sm" variant="outline">Update</Button>
                    </form>
                  ) : null}
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
