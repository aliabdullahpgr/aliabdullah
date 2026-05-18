import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import sanitizeHtml from "sanitize-html";
import { createAuditLog } from "~/server/audit";
import { parseArrays, stringifyArrays } from "~/server/db-helpers";

const TABLE = "project";
const TABLE_SECTION = "project_section";

export const projectRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const results = await ctx.db.project.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return results.map((r) => parseArrays(r, TABLE));
  }),

  getAllAdmin: adminProcedure.query(async ({ ctx }) => {
    const results = await ctx.db.project.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: { sections: { orderBy: { order: "asc" } } },
    });
    return results.map((r) => parseArrays(r, TABLE));
  }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.project.findUnique({
        where: { slug: input.slug, published: true },
        include: { sections: { orderBy: { order: "asc" } } },
      });
      return parseArrays(result, TABLE);
    }),

  getByIdAdmin: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.project.findUnique({
        where: { id: input.id },
        include: { sections: { orderBy: { order: "asc" } } },
      });
      return parseArrays(result, TABLE);
    }),

  create: adminProcedure
    .input(
      z.object({
        slug: z.string().min(1),
        title: z.string().min(1),
        lede: z.string().min(1),
        label: z.string().min(1),
        meta: z.string().min(1),
        desc: z.string().min(1),
        year: z.string().min(1),
        status: z.string().optional(),
        role: z.string().optional(),
        stack: z.array(z.string()).optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        image: z.string().url().nullable().optional(),
        liveUrl: z.string().url().nullable().optional().or(z.literal("")),
        githubUrl: z.string().url().nullable().optional().or(z.literal("")),
        published: z.boolean().optional(),
        order: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const data = stringifyArrays(input as Record<string, unknown>, TABLE);
      const project = await ctx.db.project.create({ data: data as any });
      void createAuditLog(ctx.session.user.id, "create", "project", project.id, { slug: project.slug });
      return parseArrays(project, TABLE);
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        slug: z.string().optional(),
        title: z.string().optional(),
        lede: z.string().optional(),
        label: z.string().optional(),
        meta: z.string().optional(),
        desc: z.string().optional(),
        year: z.string().optional(),
        status: z.string().optional(),
        role: z.string().optional(),
        stack: z.array(z.string()).optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        image: z.string().url().nullable().optional(),
        liveUrl: z.string().url().nullable().optional().or(z.literal("")),
        githubUrl: z.string().url().nullable().optional().or(z.literal("")),
        published: z.boolean().optional(),
        order: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;
      const data = stringifyArrays(rest as Record<string, unknown>, TABLE);
      const project = await ctx.db.project.update({ where: { id }, data: data as any });
      const changedFields = Object.keys(rest).filter((k) => rest[k as keyof typeof rest] !== undefined);
      void createAuditLog(ctx.session.user.id, "update", "project", project.id, { changedFields });
      return parseArrays(project, TABLE);
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.delete({ where: { id: input.id } });
      void createAuditLog(ctx.session.user.id, "delete", "project", project.id);
      return project;
    }),

  // Sections
  createSection: adminProcedure
    .input(
      z.object({
        projectId: z.string(),
        heading: z.string().min(1),
        content: z.string().min(1),
        order: z.number().optional(),
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
      const section = await ctx.db.projectSection.create({ data: { ...input, content: safeContent } });
      void createAuditLog(ctx.session.user.id, "create", "project_section", section.id, { projectId: section.projectId });
      return section;
    }),

  updateSection: adminProcedure
    .input(
      z.object({
        id: z.string(),
        heading: z.string().optional(),
        content: z.string().optional(),
        order: z.number().optional(),
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
      const section = await ctx.db.projectSection.update({
        where: { id },
        data: { ...data, ...(safeContent && { content: safeContent }) },
      });
      const changedFields = Object.keys(data).filter((k) => data[k as keyof typeof data] !== undefined);
      void createAuditLog(ctx.session.user.id, "update", "project_section", section.id, { changedFields, projectId: section.projectId });
      return section;
    }),

  deleteSection: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const section = await ctx.db.projectSection.delete({ where: { id: input.id } });
      void createAuditLog(ctx.session.user.id, "delete", "project_section", section.id, { projectId: section.projectId });
      return section;
    }),
});
