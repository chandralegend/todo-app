import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";

type PageProps = {
  params: Promise<{ id: string }>;
};

const importanceOptions = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
const statusOptions = ["DRAFT", "TODO", "IN_PROGRESS", "COMPLETED", "FAILED"] as const;

export default async function NewTaskPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  const list = await prisma.taskList.findFirst({
    where: {
      id,
      ownerUserId: session.user.id,
      isArchived: false,
    },
    select: {
      id: true,
      name: true,
    },
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

    if (!description || !listId) {
      return;
    }

    const listForUser = await prisma.taskList.findFirst({
      where: {
        id: listId,
        ownerUserId: currentSession.user.id,
        isArchived: false,
      },
      select: { id: true },
    });

    if (!listForUser) {
      notFound();
    }

    const tags = tagsRaw
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

    const deadlineAt = deadlineRaw ? new Date(deadlineRaw) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.$transaction(async (tx) => {
      const template = await tx.taskTemplate.create({
        data: {
          taskListId: listId,
          createdByUserId: currentSession.user.id,
          description,
          importance: importance as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
          isRecurring: false,
          isActive: true,
          templateStatus: status as "DRAFT" | "TODO" | "IN_PROGRESS" | "COMPLETED" | "FAILED",
          tags,
        },
      });

      await tx.taskInstance.create({
        data: {
          taskTemplateId: template.id,
          taskListId: listId,
          occurrenceDate: today,
          deadlineAt,
          descriptionSnapshot: description,
          importanceSnapshot: importance as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
          tagsSnapshot: tags,
          status: status as "DRAFT" | "TODO" | "IN_PROGRESS" | "COMPLETED" | "FAILED",
          startedAt: status === "IN_PROGRESS" ? new Date() : null,
          completedAt: status === "COMPLETED" ? new Date() : null,
          failedAt: status === "FAILED" ? new Date() : null,
          completedByUserId: status === "COMPLETED" ? currentSession.user.id : null,
          failedByUserId: status === "FAILED" ? currentSession.user.id : null,
        },
      });
    });

    revalidatePath(`/lists/${listId}`);
    redirect(`/lists/${listId}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <main className="max-w-2xl mx-auto py-8">
        <div className="mb-6">
          <Link href={`/lists/${list.id}`} className="text-sm text-gray-600 hover:underline">
            ← Back to {list.name}
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add Task</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createTask} className="space-y-4">
              <input type="hidden" name="listId" value={list.id} />

              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Textarea id="description" name="description" placeholder="Finish phase 1 implementation" rows={4} required />
              </Field>

              <Field>
                <FieldLabel htmlFor="deadlineAt">Deadline (optional)</FieldLabel>
                <Input id="deadlineAt" name="deadlineAt" type="datetime-local" />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="importance">Importance</FieldLabel>
                  <select
                    id="importance"
                    name="importance"
                    defaultValue="MEDIUM"
                    className="h-8 rounded-lg border bg-transparent px-2.5 py-1 text-sm"
                  >
                    {importanceOptions.map((option) => (
                      <option key={option} value={option}>
                        {option.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="status">Status</FieldLabel>
                  <select
                    id="status"
                    name="status"
                    defaultValue="TODO"
                    className="h-8 rounded-lg border bg-transparent px-2.5 py-1 text-sm"
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="tags">Tags (comma separated)</FieldLabel>
                <Input id="tags" name="tags" placeholder="work, urgent" />
              </Field>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit">Save Task</Button>
                <Button variant="outline" asChild>
                  <Link href={`/lists/${list.id}`}>Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
