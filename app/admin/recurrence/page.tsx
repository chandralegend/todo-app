import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function RecurrenceAdminPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const logs = await prisma.recurrenceRunLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <main className="max-w-4xl mx-auto py-8 space-y-4">
        <h1 className="text-2xl font-semibold">Recurrence Runs</h1>
        <p className="text-sm text-gray-600">
          Trigger: <code>GET /api/cron/recurrence</code> with <code>x-cron-secret</code>.
        </p>

        {logs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              No recurrence runs yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <Card key={log.id}>
                <CardHeader className="py-4">
                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <CardTitle className="text-base">
                      {new Date(log.createdAt).toLocaleString()}
                    </CardTitle>
                    <Badge variant={log.status === "SUCCESS" ? "secondary" : "destructive"}>
                      {log.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 grid grid-cols-2 md:grid-cols-5 gap-2">
                    <span>Templates: {log.templatesScanned}</span>
                    <span>Attempted: {log.attempted}</span>
                    <span>Generated: {log.generated}</span>
                    <span>Existing: {log.duplicateOrExisting}</span>
                    <span>Window: {new Date(log.windowStart).toLocaleDateString()} - {new Date(log.windowEnd).toLocaleDateString()}</span>
                  </div>
                  {log.errorMessage ? (
                    <p className="text-sm text-red-600">{log.errorMessage}</p>
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
