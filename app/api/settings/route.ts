import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllSettings, setSetting } from "@/lib/settings";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getAllSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { key, value } = body as { key?: string; value?: string };

  if (!key || typeof value !== "string") {
    return NextResponse.json(
      { error: "key and value are required" },
      { status: 400 }
    );
  }

  await setSetting(key, value);
  return NextResponse.json({ ok: true });
}
