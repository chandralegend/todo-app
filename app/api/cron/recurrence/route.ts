import { NextResponse } from "next/server";
import { generateRecurringInstances } from "@/lib/recurrence";

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

  const result = await generateRecurringInstances();

  return NextResponse.json({
    ok: true,
    ...result,
  });
}

export async function POST(request: Request) {
  return GET(request);
}
