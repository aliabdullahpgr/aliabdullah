import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readProjectFile = (rel) => readFile(path.join(root, rel), "utf8");
const exists = async (rel) => {
  try {
    await stat(path.join(root, rel));
    return true;
  } catch {
    return false;
  }
};

// ─── Public pages fetch content from the backend CMS ───

const publicPages = [
  "src/app/page.tsx",
  "src/app/projects/page.tsx",
  "src/app/projects/[slug]/page.tsx",
  "src/app/writing/page.tsx",
  "src/app/writing/[slug]/page.tsx",
];

test("public pages source content from the backend (~/server/public-cms)", async () => {
  for (const file of publicPages) {
    const src = await readProjectFile(file);
    assert.match(
      src,
      /~\/server\/public-cms/,
      `${file} should import from ~/server/public-cms`,
    );
    assert.doesNotMatch(
      src,
      /~\/app\/_data\/public-content/,
      `${file} still references the deleted static content file`,
    );
  }
});

test("home page fetches projects, articles, and site config in parallel", async () => {
  const home = await readProjectFile("src/app/page.tsx");
  assert.match(home, /getPublicProjects/);
  assert.match(home, /getPublicArticles/);
  assert.match(home, /getPublicSiteConfigs/);
  assert.match(home, /Promise\.all/);
});

test("detail pages fetch by slug and generateStaticParams from the CMS", async () => {
  const projectPage = await readProjectFile("src/app/projects/[slug]/page.tsx");
  const articlePage = await readProjectFile("src/app/writing/[slug]/page.tsx");

  assert.match(projectPage, /getPublicProjectBySlug/);
  assert.match(projectPage, /generateStaticParams/);
  assert.match(projectPage, /getPublicProjects/);

  assert.match(articlePage, /getPublicArticleBySlug/);
  assert.match(articlePage, /generateStaticParams/);
  assert.match(articlePage, /getPublicArticles/);
});

test("legacy static content file is removed", async () => {
  assert.equal(
    await exists("src/app/_data/public-content.ts"),
    false,
    "src/app/_data/public-content.ts should have been deleted",
  );
});

// ─── Backend, admin, auth, chat routes are active ───

test("dashboard, chat, login, and api routes are active (not in _disabled)", async () => {
  assert.equal(await exists("src/app/_disabled"), false, "_disabled should be removed");

  for (const route of [
    "src/app/dashboard/layout.tsx",
    "src/app/dashboard/page.tsx",
    "src/app/chat/page.tsx",
    "src/app/login/page.tsx",
    "src/app/api/chat/route.ts",
    "src/app/api/auth/[...all]/route.ts",
    "src/app/api/trpc/[trpc]/route.ts",
  ]) {
    assert.equal(await exists(route), true, `${route} should exist`);
  }
});

test("dashboard is auth-gated via better-auth", async () => {
  const page = await readProjectFile("src/app/dashboard/page.tsx");
  assert.match(page, /~\/server\/better-auth/);
  assert.match(page, /redirect\(["']\/login["']\)/);
});

test("chat page uses the Gemini-backed /api/chat endpoint", async () => {
  const ui = await readProjectFile("src/app/chat/_components/chat-interface.tsx");
  assert.match(ui, /fetch\(["']\/api\/chat["']/);
  assert.match(ui, /^["']use client["'];?/m);

  const route = await readProjectFile("src/app/api/chat/route.ts");
  assert.match(route, /GoogleGenerativeAI/);
  assert.match(route, /["']gemini-2\.5-flash["']/);
  assert.match(route, /functionDeclarations/);
});

// ─── Tooling config no longer carves out _disabled ───

test("tsconfig and eslint no longer exclude _disabled", async () => {
  const tsconfig = await readProjectFile("tsconfig.json");
  const eslintConfig = await readProjectFile("eslint.config.js");

  assert.doesNotMatch(tsconfig, /_disabled/);
  assert.doesNotMatch(eslintConfig, /_disabled/);
});

// ─── Required env wiring ───

test("env.js declares all backend env vars used by the app", async () => {
  const env = await readProjectFile("src/env.js");
  for (const key of [
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_GITHUB_CLIENT_ID",
    "BETTER_AUTH_GITHUB_CLIENT_SECRET",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
    "GEMINI_API_KEY",
  ]) {
    assert.match(env, new RegExp(`${key}:`), `env schema missing ${key}`);
    assert.match(
      env,
      new RegExp(`${key}:\\s*process\\.env\\.${key}`),
      `${key} not wired in runtimeEnv`,
    );
  }
});

// ─── Package scripts ───

test("package.json declares the expected scripts and engines", async () => {
  const pkg = JSON.parse(await readProjectFile("package.json"));
  assert.equal(pkg.engines.node, "24.x");
  assert.equal(pkg.scripts.build, "next build");
  assert.equal(pkg.scripts.start, "next start");
  assert.match(pkg.scripts.typecheck, /tsc/);
  assert.ok(pkg.dependencies["@google/generative-ai"], "Gemini SDK should be a dependency");
  assert.ok(pkg.dependencies["@prisma/client"]);
  assert.ok(pkg.dependencies["better-auth"]);
});
