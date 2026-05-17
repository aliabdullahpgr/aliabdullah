import { articleRouter } from "~/server/api/routers/article";
import { chatRouter } from "~/server/api/routers/chat";
import { dashboardRouter } from "~/server/api/routers/dashboard";
import { projectRouter } from "~/server/api/routers/project";
import { siteConfigRouter } from "~/server/api/routers/siteConfig";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  dashboard: dashboardRouter,
  siteConfig: siteConfigRouter,
  project: projectRouter,
  article: articleRouter,
  chat: chatRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
