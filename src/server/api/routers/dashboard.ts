import { z } from "zod";

import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";
import { createAuditLog } from "~/server/audit";

export const dashboardRouter = createTRPCRouter({
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [totalUsers, totalProjects, totalArticles] = await Promise.all([
      ctx.db.user.count(),
      ctx.db.project.count(),
      ctx.db.article.count(),
    ]);

    return {
      totalUsers,
      totalProjects,
      totalArticles,
      recentActivity: totalUsers + totalProjects + totalArticles,
    };
  }),

  getRecentArticles: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.article.findMany({
        take: input.limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          slug: true,
          title: true,
          date: true,
          published: true,
          createdAt: true,
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
            role: true,
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
      const user = await ctx.db.user.delete({ where: { id: input.id } });
      void createAuditLog(ctx.session.user.id, "delete", "user", user.id);
      return user;
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
      const user = await ctx.db.user.update({
        where: { id },
        data,
      });
      const changedFields = Object.keys(data).filter((k) => data[k as keyof typeof data] !== undefined);
      void createAuditLog(ctx.session.user.id, "update", "user", user.id, { changedFields });
      return user;
    }),
});
