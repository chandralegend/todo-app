import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { url } = body as { url?: string };

  if (!url || typeof url !== "string") {
    return NextResponse.json(
      { error: "Database URL is required" },
      { status: 400 }
    );
  }

  // Validate URL format (basic check)
  const validPrefixes = ["postgresql://", "postgres://", "mysql://", "file:"];
  const hasValidPrefix = validPrefixes.some((p) => url.startsWith(p));
  if (!hasValidPrefix) {
    return NextResponse.json(
      {
        error:
          "Invalid database URL. Must start with postgresql://, postgres://, mysql://, or file:",
      },
      { status: 400 }
    );
  }

  try {
    // Resolve the prisma schema path
    // In development: ./prisma/schema.prisma
    // In production (Electron): process.resourcesPath + /prisma/schema.prisma
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resourcesPath = (process as any).resourcesPath as string | undefined;
    const isElectronProd =
      process.env.NODE_ENV === "production" && resourcesPath;
    const schemaPath = isElectronProd
      ? path.join(resourcesPath!, "prisma", "schema.prisma")
      : path.join(process.cwd(), "prisma", "schema.prisma");

    // Run prisma db push against the target database.
    // `prisma db push` is schema-based (not migration-based) so it works
    // with any provider — it introspects the schema and pushes changes.
    // --skip-generate: no need to regenerate the client for a remote DB
    // --accept-data-loss: allow destructive changes (user must be aware)
    const { stdout, stderr } = await execAsync(
      `npx prisma db push --schema="${schemaPath}" --skip-generate --accept-data-loss`,
      {
        env: {
          ...process.env,
          DATABASE_URL: url,
        },
        timeout: 30000,
      }
    );

    const output = [stdout, stderr].filter(Boolean).join("\n").trim();

    return NextResponse.json({
      ok: true,
      message: output || "Schema pushed successfully",
    });
  } catch (err) {
    const error = err as { stderr?: string; message?: string };
    const message =
      error.stderr || error.message || "Failed to push schema";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
