import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";

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

    if (!name) {
      return;
    }

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
    <div className="min-h-screen bg-gray-50 p-4">
      <main className="max-w-2xl mx-auto py-8">
        <div className="mb-6">
          <Link href="/" className="text-sm text-gray-600 hover:underline">
            ← Back to lists
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create New List</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createList} className="space-y-4">
              <Field>
                <FieldLabel htmlFor="name">List Name</FieldLabel>
                <Input id="name" name="name" placeholder="Work Tasks" required />
              </Field>

              <Field>
                <FieldLabel htmlFor="description">Description (optional)</FieldLabel>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="What is this list for?"
                  rows={4}
                />
              </Field>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit">Create List</Button>
                <Button variant="outline" asChild>
                  <Link href="/">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
