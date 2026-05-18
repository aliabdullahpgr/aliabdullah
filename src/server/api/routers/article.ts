import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import sanitizeHtml from "sanitize-html";
import { createAuditLog } from "~/server/audit";
import { parseArrays, stringifyArrays } from "~/server/db-helpers";

const TABLE = "article";

export const articleRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const results = await ctx.db.article.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
    return results.map((r) => parseArrays(r, TABLE));
  }),

  getAllAdmin: adminProcedure.query(async ({ ctx }) => {
    const results = await ctx.db.article.findMany({
      orderBy: { createdAt: "desc" },
    });
    return results.map((r) => parseArrays(r, TABLE));
  }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.article.findUnique({
        where: { slug: input.slug, published: true },
      });
      return parseArrays(result, TABLE);
    }),

  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.article.findUnique({
        where: { id: input.id },
      });
      return parseArrays(result, TABLE);
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
        image: z.string().url().nullable().optional(),
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
      const data = stringifyArrays({ ...input, content: safeContent } as Record<string, unknown>, TABLE);
      const article = await ctx.db.article.create({ data: data as any });
      void createAuditLog(ctx.session.user.id, "create", "article", article.id, { slug: article.slug });
      return parseArrays(article, TABLE);
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
        image: z.string().url().nullable().optional(),
        published: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, content, ...rest } = input;
      const safeContent = content
        ? sanitizeHtml(content, {
            allowedTags: false,
            allowedAttributes: false,
            exclusiveFilter: function (frame) {
              return frame.tag === "script" || frame.tag === "object" || frame.tag === "embed";
            },
          })
        : undefined;
      const data = stringifyArrays({ ...rest, ...(safeContent && { content: safeContent }) } as Record<string, unknown>, TABLE);
      const article = await ctx.db.article.update({ where: { id }, data: data as any });
      const changedFields = Object.keys(rest).filter((k) => rest[k as keyof typeof rest] !== undefined);
      void createAuditLog(ctx.session.user.id, "update", "article", article.id, { changedFields });
      return parseArrays(article, TABLE);
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const article = await ctx.db.article.delete({ where: { id: input.id } });
      void createAuditLog(ctx.session.user.id, "delete", "article", article.id);
      return article;
    }),
});
