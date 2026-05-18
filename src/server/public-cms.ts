import "server-only";

import type { Prisma } from "@prisma/client";
import { db } from "~/server/db";
import { parseArrays } from "~/server/db-helpers";

type ProjectWithSections = Prisma.ProjectGetPayload<{ include: { sections: true } }>;

const defaultChatConfig = {
  pageTitle: "Ask Ali anything",
  modelName: "gemini-2.5-flash",
  systemPrompt: "",
};

export const getPublicSiteConfigs = (keys: string[]) =>
  db.siteConfig.findMany({
    where: { key: { in: keys } },
    select: { key: true, value: true },
  });

export const getPublicProjects = async () => {
  const results = await db.project.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  return results.map((r) => parseArrays(r, "project")) as typeof results;
};

export const getPublicProjectBySlug = async (slug: string) => {
  const result = await db.project.findUnique({
    where: { slug, published: true },
    include: { sections: { orderBy: { order: "asc" } } },
  });
  return parseArrays(result, "project") as ProjectWithSections | null;
};

export const getPublicArticles = async () => {
  const results = await db.article.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });
  return results.map((r) => parseArrays(r, "article")) as typeof results;
};

export const getPublicArticleBySlug = async (slug: string) => {
  const result = await db.article.findUnique({ where: { slug, published: true } });
  return parseArrays(result, "article") as typeof result;
};

export const getPublicChatConfig = async () => {
  const config = await db.chatConfig.findFirst();
  return config ?? defaultChatConfig;
};
