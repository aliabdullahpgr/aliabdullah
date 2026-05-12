import { articleRouter } from "~/server/api/routers/article";
import { chatRouter } from "~/server/api/routers/chat";
import { dashboardRouter } from "~/server/api/routers/dashboard";
import { postRouter } from "~/server/api/routers/post";
import { projectRouter } from "~/server/api/routers/project";
import { siteConfigRouter } from "~/server/api/routers/siteConfig";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  dashboard: dashboardRouter,
  siteConfig: siteConfigRouter,
  project: projectRouter,
  article: articleRouter,
  chat: chatRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
