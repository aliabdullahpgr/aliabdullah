import "server-only";

import { db } from "~/server/db";

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

export const getPublicProjects = () =>
  db.project.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

export const getPublicProjectBySlug = (slug: string) =>
  db.project.findUnique({
    where: { slug, published: true },
    include: { sections: { orderBy: { order: "asc" } } },
  });

export const getPublicArticles = () =>
  db.article.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

export const getPublicArticleBySlug = (slug: string) =>
  db.article.findUnique({ where: { slug, published: true } });

export const getPublicChatConfig = async () => {
  const config = await db.chatConfig.findFirst();
  return config ?? defaultChatConfig;
};
