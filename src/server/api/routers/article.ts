import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import sanitizeHtml from "sanitize-html";

export const articleRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.article.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
  }),

  getAllAdmin: adminProcedure.query(async ({ ctx }) => {
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

  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.article.findUnique({
        where: { id: input.id },
      });
    }),

  create: adminProcedure
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
      const safeContent = sanitizeHtml(input.content, {
        allowedTags: false,
        allowedAttributes: false,
        exclusiveFilter: function (frame) {
          return frame.tag === "script" || frame.tag === "object" || frame.tag === "embed";
        },
      });
      return ctx.db.article.create({ data: { ...input, content: safeContent } });
    }),

  update: adminProcedure
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
      const { id, content, ...data } = input;
      const safeContent = content
        ? sanitizeHtml(content, {
            allowedTags: false,
            allowedAttributes: false,
            exclusiveFilter: function (frame) {
              return frame.tag === "script" || frame.tag === "object" || frame.tag === "embed";
            },
          })
        : undefined;
      return ctx.db.article.update({ where: { id }, data: { ...data, ...(safeContent && { content: safeContent }) } });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.article.delete({ where: { id: input.id } });
    }),
});
