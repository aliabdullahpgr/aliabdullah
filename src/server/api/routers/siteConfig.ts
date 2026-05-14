import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  adminProcedure,
} from "~/server/api/trpc";

export const siteConfigRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.siteConfig.findMany({ orderBy: { key: "asc" } });
  }),

  getByKey: publicProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.siteConfig.findUnique({ where: { key: input.key } });
    }),

  getManyByKeys: publicProcedure
    .input(z.object({ keys: z.array(z.string()) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.siteConfig.findMany({
        where: { key: { in: input.keys } },
      });
    }),

  set: adminProcedure
    .input(
      z.object({
        key: z.string(),
        value: z.string(),
        type: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.siteConfig.upsert({
        where: { key: input.key },
        update: {
          value: input.value,
          ...(input.type && { type: input.type }),
          ...(input.description && { description: input.description }),
        },
        create: {
          key: input.key,
          value: input.value,
          type: input.type ?? "text",
          description: input.description,
        },
      });
    }),

  delete: adminProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.siteConfig.delete({ where: { key: input.key } });
    }),
});
