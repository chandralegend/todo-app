import { NextResponse } from "next/server";
import { generateRecurringInstances } from "@/lib/recurrence";
import { prisma } from "@/lib/prisma";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  const headerToken = request.headers.get("x-cron-secret");
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  return headerToken === secret || bearerToken === secret;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await generateRecurringInstances();

    await prisma.recurrenceRunLog.create({
      data: {
        status: "SUCCESS",
        templatesScanned: result.templatesScanned,
        attempted: result.attempted,
        generated: result.generated,
        duplicateOrExisting: result.duplicateOrExisting,
        windowStart: result.windowStart,
        windowEnd: result.windowEnd,
      },
    });

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    await prisma.recurrenceRunLog.create({
      data: {
        status: "FAILED",
        errorMessage: message,
        windowStart: new Date(),
        windowEnd: new Date(),
      },
    });

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
