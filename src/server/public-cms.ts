import "server-only";

import { db } from "~/server/db";
import { parseArrays } from "~/server/db-helpers";

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
  return parseArrays(results, "project");
};

export const getPublicProjectBySlug = async (slug: string) => {
  const result = await db.project.findUnique({
    where: { slug, published: true },
    include: { sections: { orderBy: { order: "asc" } } },
  });
  return parseArrays(result, "project");
};

export const getPublicArticles = async () => {
  const results = await db.article.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });
  return parseArrays(results, "article");
};

export const getPublicArticleBySlug = async (slug: string) => {
  const result = await db.article.findUnique({ where: { slug, published: true } });
  return parseArrays(result, "article");
};

export const getPublicChatConfig = async () => {
  const config = await db.chatConfig.findFirst();
  return config ?? defaultChatConfig;
};
