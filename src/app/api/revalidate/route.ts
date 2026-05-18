import { revalidatePath } from "next/cache";

export const preferredRegion = "bom1";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.REVALIDATE_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { path?: string };
  if (!body.path || typeof body.path !== "string") {
    return Response.json({ error: "Missing path" }, { status: 400 });
  }

  revalidatePath(body.path);
  return Response.json({ revalidated: true, path: body.path });
}
