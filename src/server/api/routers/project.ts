import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import sanitizeHtml from "sanitize-html";

export const projectRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.project.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
  }),

  getAllAdmin: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.project.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: { sections: { orderBy: { order: "asc" } } },
    });
  }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.project.findUnique({
        where: { slug: input.slug, published: true },
        include: { sections: { orderBy: { order: "asc" } } },
      });
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
        published: z.boolean().optional(),
        order: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.project.create({ data: input });
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
        published: z.boolean().optional(),
        order: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.project.update({ where: { id }, data });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.project.delete({ where: { id: input.id } });
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
      return ctx.db.projectSection.create({ data: { ...input, content: safeContent } });
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
      return ctx.db.projectSection.update({
        where: { id },
        data: { ...data, ...(safeContent && { content: safeContent }) },
      });
    }),

  deleteSection: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.projectSection.delete({ where: { id: input.id } });
    }),
});
