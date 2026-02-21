import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NewListContent } from "@/components/lists/new-list-content";

export default async function NewListPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

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
      createListAction={createList}
    />
  );
}
