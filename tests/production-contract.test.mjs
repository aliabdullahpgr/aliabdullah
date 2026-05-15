import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const readProjectFile = (relativePath) =>
  readFile(path.join(root, relativePath), "utf8");

async function collectFiles(relativeDir) {
  const dir = path.join(root, relativeDir);
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const relativePath = path.join(relativeDir, entry.name);
      if (entry.isDirectory()) return collectFiles(relativePath);
      return relativePath;
    }),
  );

  return files.flat();
}

const activePublicRouteFiles = [
  "src/app/page.tsx",
  "src/app/projects/page.tsx",
  "src/app/projects/[slug]/page.tsx",
  "src/app/writing/page.tsx",
  "src/app/writing/[slug]/page.tsx",
  "src/app/layout.tsx",
];

test("public route files are static and do not import backend modules", async () => {
  const forbidden =
    /~\/server|~\/trpc|better-auth|@prisma\/client|@upstash|headers\(|cookies\(/;

  for (const file of activePublicRouteFiles) {
    const source = await readProjectFile(file);

    assert.doesNotMatch(source, forbidden, file);
    assert.doesNotMatch(source, /force-dynamic/, file);
  }
});

test("home, projects, and writing read from local static content", async () => {
  const home = await readProjectFile("src/app/page.tsx");
  const projects = await readProjectFile("src/app/projects/page.tsx");
  const writing = await readProjectFile("src/app/writing/page.tsx");

  assert.match(home, /~\/app\/_data\/public-content/);
  assert.match(projects, /~\/app\/_data\/public-content/);
  assert.match(writing, /~\/app\/_data\/public-content/);
  assert.doesNotMatch(home + projects + writing, /public-cms|Promise\.all/);
});

test("public detail pages statically generate params from local data", async () => {
  const projectPage = await readProjectFile("src/app/projects/[slug]/page.tsx");
  const articlePage = await readProjectFile("src/app/writing/[slug]/page.tsx");

  assert.match(projectPage, /generateStaticParams/);
  assert.match(projectPage, /projects\.map/);
  assert.match(projectPage, /getProjectBySlug/);
  assert.match(articlePage, /generateStaticParams/);
  assert.match(articlePage, /articles\.map/);
  assert.match(articlePage, /getArticleBySlug/);
});

test("backend, admin, auth, api, chat, and login routes are disabled", async () => {
  const disabledDir = path.join(root, "src/app/_disabled");

  assert.equal((await stat(disabledDir)).isDirectory(), true);

  for (const activeRoute of [
    "src/app/dashboard",
    "src/app/chat",
    "src/app/login",
    "src/app/api",
  ]) {
    await assert.rejects(stat(path.join(root, activeRoute)));
  }

  const disabledFiles = (await collectFiles("src/app/_disabled")).map((file) =>
    file.replaceAll(path.sep, "/"),
  );
  assert(disabledFiles.some((file) => file.endsWith("dashboard/page.tsx")));
  assert(disabledFiles.some((file) => file.endsWith("chat/page.tsx")));
  assert(disabledFiles.some((file) => file.endsWith("login/page.tsx")));
  assert(disabledFiles.some((file) => file.endsWith("api/auth/[...all]/route.ts")));
  assert(disabledFiles.some((file) => file.endsWith("api/trpc/[trpc]/route.ts")));
});

test("deploy scripts do not run backend setup", async () => {
  const packageJson = JSON.parse(await readProjectFile("package.json"));

  assert.equal(packageJson.engines.node, "24.x");
  assert.equal(packageJson.scripts.build, "next build");
  assert.equal(packageJson.scripts.start, "next start");
  assert.doesNotMatch(packageJson.scripts.build, /prisma|migrate/);
  assert.doesNotMatch(packageJson.scripts.start, /prisma|migrate/);
});

test("Next config no longer imports strict runtime env validation", async () => {
  const nextConfig = await readProjectFile("next.config.js");

  assert.doesNotMatch(nextConfig, /src\/env|\.\/src\/env/);
  assert.doesNotMatch(nextConfig, /ignoreBuildErrors:\s*true/);
  assert.doesNotMatch(nextConfig, /ignoreDuringBuilds:\s*true/);
});

test("static deploy checks exclude disabled routes from active type and lint surface", async () => {
  const tsconfig = await readProjectFile("tsconfig.json");
  const eslintConfig = await readProjectFile("eslint.config.js");

  assert.match(tsconfig, /src\/app\/_disabled/);
  assert.match(eslintConfig, /src\/app\/_disabled\/\*\*/);
});

test("CI builds without backend environment placeholders", async () => {
  const workflow = await readProjectFile(".github/workflows/ci.yml");

  assert.match(workflow, /node-version:\s*24/);
  assert.match(workflow, /pnpm test:production/);
  assert.match(workflow, /pnpm build/);
  assert.doesNotMatch(workflow, /prisma generate|prisma validate/);
  assert.doesNotMatch(workflow, /BETTER_AUTH_|UPSTASH_|DATABASE_URL/);
});
