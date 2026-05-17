import { headers } from "next/headers";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "~/server/better-auth";
import { db } from "~/server/db";

const f = createUploadthing();

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw new UploadThingError("Not signed in");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  });
  if (user?.role !== "admin") {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw new UploadThingError("Admin access required");
  }
  return { userId: user.id };
}

export const ourFileRouter = {
  projectImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(() => requireAdmin())
    .onUploadComplete(({ metadata, file }) => {
      return { userId: metadata.userId, url: file.ufsUrl };
    }),

  articleImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(() => requireAdmin())
    .onUploadComplete(({ metadata, file }) => {
      return { userId: metadata.userId, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
