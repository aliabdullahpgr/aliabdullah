import "server-only";

import type { api as serverApi } from "~/trpc/server";

type PublicApi = typeof serverApi;

type SiteConfig = {
  key: string;
  value: string;
};

type PublicProject = {
  id: string;
  slug: string;
  title: string;
  lede: string;
  label: string;
  meta: string;
  desc: string;
  year: string;
  status: string;
  role: string;
  stack: string[];
  category: string;
  tags: string[];
  sections?: Array<{
    id: string;
    heading: string;
    content: string;
  }>;
};

type PublicArticle = {
  id: string;
  slug: string;
  title: string;
  lede: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  content?: string;
};

type ChatConfig = {
  pageTitle: string;
  modelName: string;
  systemPrompt: string;
};

const defaultChatConfig: ChatConfig = {
  pageTitle: "Ask Ali anything",
  modelName: "claude-3-5-sonnet",
  systemPrompt: "",
};

const errorDetails = (error: unknown) => ({
  error: error instanceof Error ? error.message : String(error),
  stack: error instanceof Error ? error.stack : undefined,
});

async function withPublicCms<T>(
  label: string,
  fallback: T,
  read: (api: PublicApi) => Promise<T>,
) {
  try {
    const { api } = await import("~/trpc/server");
    return await read(api);
  } catch (error) {
    console.error(`[public-cms] ${label} failed`, errorDetails(error));
    return fallback;
  }
}

export const getPublicSiteConfigs = (keys: string[]) =>
  withPublicCms<SiteConfig[]>("site config", [], (api) =>
    api.siteConfig.getManyByKeys({ keys }),
  );

export const getPublicProjects = () =>
  withPublicCms<PublicProject[]>("projects", [], (api) => api.project.getAll());

export const getPublicProjectBySlug = (slug: string) =>
  withPublicCms<PublicProject | null>("project detail", null, (api) =>
    api.project.getBySlug({ slug }),
  );

export const getPublicArticles = () =>
  withPublicCms<PublicArticle[]>("articles", [], (api) => api.article.getAll());

export const getPublicArticleBySlug = (slug: string) =>
  withPublicCms<PublicArticle | null>("article detail", null, (api) =>
    api.article.getBySlug({ slug }),
  );

export const getPublicChatConfig = () =>
  withPublicCms<ChatConfig>("chat config", defaultChatConfig, (api) =>
    api.chat.getConfig(),
  );
