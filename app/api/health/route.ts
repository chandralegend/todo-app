import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const startedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      ok: true,
      service: "todo-app",
      timestamp: new Date().toISOString(),
      checks: {
        database: "up",
      },
      latencyMs: Date.now() - startedAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        ok: false,
        service: "todo-app",
        timestamp: new Date().toISOString(),
        checks: {
          database: "down",
        },
        error: message,
      },
      { status: 503 }
    );
  }
}
