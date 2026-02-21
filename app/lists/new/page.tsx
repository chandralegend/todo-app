import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listAccessibleWhere } from "@/lib/permissions";
import { NewListContent } from "@/components/lists/new-list-content";

export default async function NewListPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Sidebar lists
  const taskLists = await prisma.taskList.findMany({
    where: listAccessibleWhere(session.user.id),
    select: {
      id: true,
      name: true,
      _count: { select: { instances: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const sidebarLists = taskLists.map((l) => ({
    id: l.id,
    name: l.name,
    taskCount: l._count.instances,
  }));

  async function createList(formData: FormData) {
    "use server";

    const currentSession = await auth();
    if (!currentSession?.user) {
      redirect("/login");
    }

    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();

    if (!name) return;

    const list = await prisma.taskList.create({
      data: {
        ownerUserId: currentSession.user.id,
        name,
        description: description || null,
        members: {
          create: {
            userId: currentSession.user.id,
            role: "OWNER",
          },
        },
      },
    });

    revalidatePath("/");
    redirect(`/lists/${list.id}`);
  }

  return (
    <NewListContent
      sidebarLists={sidebarLists}
      createListAction={createList}
    />
  );
}
