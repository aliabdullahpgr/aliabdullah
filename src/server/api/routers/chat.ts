import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const chatRouter = createTRPCRouter({
  // ─── Suggestions ───
  getSuggestions: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.chatSuggestion.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });
  }),

  getAllSuggestions: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.chatSuggestion.findMany({
      orderBy: { order: "asc" },
    });
  }),

  createSuggestion: protectedProcedure
    .input(
      z.object({
        question: z.string().min(1),
        kind: z.string().default("ask"),
        tool: z.string().optional().nullable(),
        order: z.number().optional(),
        active: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.chatSuggestion.create({ data: input });
    }),

  updateSuggestion: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        question: z.string().optional(),
        kind: z.string().optional(),
        tool: z.string().optional().nullable(),
        order: z.number().optional(),
        active: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.chatSuggestion.update({ where: { id }, data });
    }),

  deleteSuggestion: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.chatSuggestion.delete({ where: { id: input.id } });
    }),

  // ─── Responses ───
  getResponses: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.chatResponse.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });
  }),

  getAllResponses: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.chatResponse.findMany({
      orderBy: { order: "asc" },
    });
  }),

  createResponse: protectedProcedure
    .input(
      z.object({
        trigger: z.string().min(1),
        response: z.string().min(1),
        order: z.number().optional(),
        active: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.chatResponse.create({ data: input });
    }),

  updateResponse: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        trigger: z.string().optional(),
        response: z.string().optional(),
        order: z.number().optional(),
        active: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.chatResponse.update({ where: { id }, data });
    }),

  deleteResponse: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.chatResponse.delete({ where: { id: input.id } });
    }),

  // ─── Config ───
  getConfig: publicProcedure.query(async ({ ctx }) => {
    const config = await ctx.db.chatConfig.findFirst();
    return (
      config ?? {
        pageTitle: "Ask Ali anything",
        modelName: "claude-3-5-sonnet",
        systemPrompt: "",
      }
    );
  }),

  updateConfig: protectedProcedure
    .input(
      z.object({
        pageTitle: z.string().optional(),
        modelName: z.string().optional(),
        systemPrompt: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.chatConfig.findFirst();
      if (existing) {
        return ctx.db.chatConfig.update({
          where: { id: existing.id },
          data: input,
        });
      }
      return ctx.db.chatConfig.create({
        data: {
          key: "default",
          ...input,
        },
      });
    }),
});
