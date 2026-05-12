import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const articleRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.article.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
  }),

  getAllAdmin: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.article.findMany({
      orderBy: { createdAt: "desc" },
    });
  }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.article.findUnique({
        where: { slug: input.slug, published: true },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.article.findUnique({
        where: { id: input.id },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        slug: z.string().min(1),
        title: z.string().min(1),
        lede: z.string().min(1),
        date: z.string().min(1),
        readTime: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        content: z.string().min(1),
        published: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.article.create({ data: input });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        slug: z.string().optional(),
        title: z.string().optional(),
        lede: z.string().optional(),
        date: z.string().optional(),
        readTime: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        content: z.string().optional(),
        published: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.article.update({ where: { id }, data });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.article.delete({ where: { id: input.id } });
    }),
});
