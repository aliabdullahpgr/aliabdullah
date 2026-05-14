import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const productionEnvBase = {
  NODE_ENV: "production",
  BETTER_AUTH_SECRET: "ci-build-secret-change-me-32-characters",
  BETTER_AUTH_GITHUB_CLIENT_ID: "ci-github-client-id",
  BETTER_AUTH_GITHUB_CLIENT_SECRET: "ci-github-client-secret",
  BETTER_AUTH_URL: "http://localhost:3000",
  UPSTASH_REDIS_REST_URL: "https://ci-upstash.example.com",
  UPSTASH_REDIS_REST_TOKEN: "ci-upstash-token",
  DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
};

const readProjectFile = (relativePath) =>
  readFile(path.join(root, relativePath), "utf8");

function makeProductionEnv(overrides = {}) {
  const env = { ...process.env };
  delete env.SKIP_ENV_VALIDATION;

  for (const [key, value] of Object.entries(productionEnvBase)) {
    env[key] = value;
  }

  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete env[key];
    } else {
      env[key] = value;
    }
  }

  return env;
}

function importEnvWith(env) {
  return spawnSync(
    process.execPath,
    ["--input-type=module", "-e", "await import('./src/env.js');"],
    {
      cwd: root,
      env,
      encoding: "utf8",
    },
  );
}

test("production env schema accepts a complete Vercel-like environment", () => {
  const result = importEnvWith(makeProductionEnv());

  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("production env schema rejects missing DATABASE_URL even when skip is set", () => {
  const result = importEnvWith(
    makeProductionEnv({
      DATABASE_URL: undefined,
      SKIP_ENV_VALIDATION: "1",
    }),
  );

  assert.notEqual(result.status, 0);
  assert.match(result.stderr + result.stdout, /DATABASE_URL/);
});

test("home page remains dynamic and data-backed", async () => {
  const page = await readProjectFile("src/app/page.tsx");

  assert.match(page, /export const dynamic\s*=\s*["']force-dynamic["']/);
  assert.doesNotMatch(page, /force-static/);
  assert.match(page, /Promise\.all/);
  assert.match(page, /getPublicSiteConfigs/);
  assert.match(page, /getPublicProjects/);
  assert.match(page, /getPublicArticles/);
});

test("chat page remains dynamic because it reads request/auth context", async () => {
  const page = await readProjectFile("src/app/chat/page.tsx");

  assert.match(page, /export const dynamic\s*=\s*["']force-dynamic["']/);
  assert.doesNotMatch(page, /force-static/);
});

test("public dynamic detail pages do not opt into static param generation", async () => {
  const projectPage = await readProjectFile("src/app/projects/[slug]/page.tsx");
  const articlePage = await readProjectFile("src/app/writing/[slug]/page.tsx");

  assert.match(projectPage, /export const dynamic\s*=\s*["']force-dynamic["']/);
  assert.match(articlePage, /export const dynamic\s*=\s*["']force-dynamic["']/);
  assert.doesNotMatch(projectPage, /generateStaticParams/);
  assert.doesNotMatch(articlePage, /generateStaticParams/);
});

test("public CMS reads fail closed instead of hiding production errors", async () => {
  const cms = await readProjectFile("src/server/public-cms.ts");

  assert.match(cms, /await import\(["']~\/trpc\/server["']\)/);
  assert.doesNotMatch(cms, /\bcatch\s*[\({]/);
  assert.doesNotMatch(cms, /return\s+\[\]/);
  assert.doesNotMatch(cms, /\?\?\s*\[\]/);
});

test("TRPC client provider is scoped away from the public root layout", async () => {
  const rootLayout = await readProjectFile("src/app/layout.tsx");
  const dashboardLayout = await readProjectFile("src/app/dashboard/layout.tsx");
  const chatPage = await readProjectFile("src/app/chat/page.tsx");

  assert.doesNotMatch(rootLayout, /TRPCReactProvider/);
  assert.match(dashboardLayout, /TRPCReactProvider/);
  assert.match(chatPage, /TRPCReactProvider/);
});

test("Better Auth does not use a build-only fallback secret", async () => {
  const authConfig = await readProjectFile("src/server/better-auth/config.ts");

  assert.match(authConfig, /secret:\s*env\.BETTER_AUTH_SECRET/);
  assert.doesNotMatch(authConfig, /ciBuildSecret/);
  assert.doesNotMatch(authConfig, /SKIP_ENV_VALIDATION/);
});

test("server database client uses the Prisma package import", async () => {
  const dbSource = await readProjectFile("src/server/db.ts");
  const prismaSchema = await readProjectFile("prisma/schema.prisma");

  assert.match(dbSource, /from ["']@prisma\/client["']/);
  assert.doesNotMatch(dbSource, /generated\/prisma/);
  assert.doesNotMatch(prismaSchema, /output\s*=\s*["']\.\.\/generated\/prisma["']/);
});

test("env validation cannot be skipped in production", async () => {
  const envSource = await readProjectFile("src/env.js");

  assert.match(envSource, /BETTER_AUTH_SECRET:\s*isProduction\s*\?\s*z\.string\(\)\.min\(32\)/);
  assert.match(envSource, /BETTER_AUTH_URL:\s*isProduction\s*\?\s*z\.string\(\)\.url\(\)/);
  assert.match(envSource, /UPSTASH_REDIS_REST_URL:\s*isProduction\s*\?\s*z\.string\(\)\.url\(\)/);
  assert.match(envSource, /DATABASE_URL:\s*isProduction\s*\?\s*z\.string\(\)\.url\(\)/);
  assert.match(envSource, /skipValidation:\s*!isProduction && !!process\.env\.SKIP_ENV_VALIDATION/);
});

test("GitHub CI runs strict production checks before the production build", async () => {
  const workflow = await readProjectFile(".github/workflows/ci.yml");

  assert.match(workflow, /node-version:\s*24/);
  assert.match(workflow, /pnpm test:production/);
  assert.match(workflow, /pnpm build/);
  assert.match(workflow, /BETTER_AUTH_URL/);
  assert.match(workflow, /UPSTASH_REDIS_REST_URL/);
  assert.doesNotMatch(workflow, /SKIP_ENV_VALIDATION/);
});

test("package keeps the Vercel runtime on Node 24", async () => {
  const packageJson = JSON.parse(await readProjectFile("package.json"));

  assert.equal(packageJson.engines.node, "24.x");
});
