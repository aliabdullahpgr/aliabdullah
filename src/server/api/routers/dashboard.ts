import { z } from "zod";

import { createTRPCRouter, protectedProcedure, adminProcedure } from "~/server/api/trpc";

export const dashboardRouter = createTRPCRouter({
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [totalUsers, totalPosts, totalProjects, totalArticles] =
      await Promise.all([
        ctx.db.user.count(),
        ctx.db.post.count(),
        ctx.db.project.count(),
        ctx.db.article.count(),
      ]);

    return {
      totalUsers,
      totalPosts,
      totalProjects,
      totalArticles,
      recentActivity: totalPosts + totalUsers + totalProjects + totalArticles,
    };
  }),

  getRecentPosts: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.post.findMany({
        take: input.limit,
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      });
    }),

  getUsers: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where = input.search
        ? {
            OR: [
              {
                name: { contains: input.search, mode: "insensitive" as const },
              },
              {
                email: { contains: input.search, mode: "insensitive" as const },
              },
            ],
          }
        : {};

      const [users, total] = await Promise.all([
        ctx.db.user.findMany({
          take: input.limit,
          skip: input.offset,
          where,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            emailVerified: true,
            createdAt: true,
            _count: { select: { posts: true } },
          },
        }),
        ctx.db.user.count({ where }),
      ]);

      return { users, total };
    }),

  deleteUser: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.id === input.id) {
        throw new Error("Cannot delete yourself");
      }
      return ctx.db.user.delete({ where: { id: input.id } });
    }),

  updateUser: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        email: z.string().email().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.user.update({
        where: { id },
        data,
      });
    }),
});
