import { db } from "~/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  let dbOk = false;
  let dbError: string | undefined;

  try {
    await db.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch (err) {
    dbError = err instanceof Error ? err.message : "unknown";
  }

  const body = {
    status: dbOk ? "ok" : "degraded",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    checks: {
      db: { ok: dbOk, ...(dbError ? { error: dbError } : {}) },
      gemini: { configured: Boolean(process.env.GEMINI_API_KEY) },
    },
    responseTimeMs: Date.now() - startedAt,
  };

  return Response.json(body, { status: dbOk ? 200 : 503 });
}
