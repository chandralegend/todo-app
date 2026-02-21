import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ListPage({ params }: PageProps) {
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
    include: {
      _count: {
        select: {
          templates: true,
          instances: true,
        },
      },
      instances: {
        take: 20,
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!list) {
    notFound();
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
          <Button asChild>
            <Link href={`/lists/${list.id}/tasks/new`}>+ Add Task</Link>
          </Button>
        </div>

        {list.instances.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">No tasks in this list yet.</p>
              <Button asChild>
                <Link href={`/lists/${list.id}/tasks/new`}>Add your first task</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {list.instances.map((task) => (
              <Card key={task.id}>
                <CardHeader className="py-4">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-base">{task.descriptionSnapshot}</CardTitle>
                    <Badge variant="outline">{task.status.replace("_", " ")}</Badge>
                  </div>
                  {task.deadlineAt ? (
                    <p className="text-xs text-gray-500">
                      Due {new Date(task.deadlineAt).toLocaleString()}
                    </p>
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
