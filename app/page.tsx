import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { signOut } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const taskLists = await prisma.taskList.findMany({
    where: {
      ownerUserId: session.user.id,
      isArchived: false,
    },
    include: {
      _count: {
        select: { templates: true, instances: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Todo App</h1>
          <div className="flex items-center gap-4">
            <Link href="/admin/recurrence" className="text-sm text-gray-600 hover:underline">
              Recurrence
            </Link>
            <span className="text-sm text-gray-600">{session.user.email}</span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirect: true, redirectTo: "/login" });
              }}
            >
              <Button variant="outline" size="sm">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">My Lists</h2>
          <Button>
            <Link href="/lists/new">+ New List</Link>
          </Button>
        </div>

        {taskLists.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">No lists yet</p>
              <Button>
                <Link href="/lists/new">Create your first list</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {taskLists.map((list) => (
              <Card key={list.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="py-4">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/lists/${list.id}`}
                      className="hover:underline font-medium"
                    >
                      {list.name}
                    </Link>
                    <Badge variant="secondary">
                      {list._count.templates + list._count.instances} tasks
                    </Badge>
                  </div>
                  {list.description && (
                    <p className="text-sm text-gray-500">{list.description}</p>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
