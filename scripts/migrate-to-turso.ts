/**
 * Migrates schema + data from Neon PostgreSQL to Turso (libsql).
 */

import { createClient } from "@libsql/client";
import { PrismaClient } from "@prisma/client";

const NEON_URL = "postgresql://neondb_owner:npg_F3QXrWHV9avw@ep-fragrant-union-apftjjec-pooler.c-7.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";
const TURSO_URL = "libsql://portfolio-aliabdul67.aws-ap-south-1.turso.io";
const TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzkxMDMzMzYsImlkIjoiMDE5ZTNhYmQtZjEwMS03MzYyLWI2MTctMTQyMWZiZjIzMjY5IiwicmlkIjoiYzdhZWQzNmEtNDAzNy00NmU1LThjNjItNWU2YjI2NDA1ZjZiIn0.U6b5lHwo_BxzDQ0N9ZZpRhroOKsuKxdunHue5PVsA1GbXwMpMIeFR0cY7YLVGvy4IZJWW16_6HL4fA04C0BLCg";

const JSON_ARRAY_FIELDS: Record<string, string[]> = {
  project: ["stack", "tags"],
  article: ["tags"],
};

function serialize(row: Record<string, unknown>, table: string) {
  const fields = JSON_ARRAY_FIELDS[table];
  if (!fields) return row;
  const r = { ...row };
  for (const f of fields) {
    const v = r[f];
    if (Array.isArray(v)) r[f] = JSON.stringify(v);
  }
  return r;
}

// SQL schema matching prisma/schema.prisma with SQLite types
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS "user" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "emailVerified" INTEGER NOT NULL DEFAULT 0,
  "image" TEXT,
  "role" TEXT NOT NULL DEFAULT 'user',
  "createdAt" TEXT NOT NULL DEFAULT (datetime('now')),
  "updatedAt" TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS "user_email_key" ON "user"("email");

CREATE TABLE IF NOT EXISTS "session" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "expiresAt" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL DEFAULT (datetime('now')),
  "updatedAt" TEXT NOT NULL DEFAULT (datetime('now')),
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" TEXT NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "session_token_key" ON "session"("token");

CREATE TABLE IF NOT EXISTS "account" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" TEXT,
  "refreshTokenExpiresAt" TEXT,
  "scope" TEXT,
  "password" TEXT,
  "createdAt" TEXT NOT NULL DEFAULT (datetime('now')),
  "updatedAt" TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL DEFAULT (datetime('now')),
  "updatedAt" TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS "site_config" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'text',
  "description" TEXT,
  "updatedAt" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS "site_config_key_key" ON "site_config"("key");

CREATE TABLE IF NOT EXISTS "project" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "lede" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "meta" TEXT NOT NULL,
  "desc" TEXT NOT NULL,
  "year" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'In production',
  "role" TEXT NOT NULL DEFAULT 'Full-stack',
  "stack" TEXT NOT NULL DEFAULT '[]',
  "category" TEXT NOT NULL DEFAULT 'General',
  "tags" TEXT NOT NULL DEFAULT '[]',
  "image" TEXT,
  "liveUrl" TEXT,
  "githubUrl" TEXT,
  "published" INTEGER NOT NULL DEFAULT 1,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TEXT NOT NULL DEFAULT (datetime('now')),
  "updatedAt" TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS "project_slug_key" ON "project"("slug");

CREATE TABLE IF NOT EXISTS "project_section" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "projectId" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "heading" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL DEFAULT (datetime('now')),
  "updatedAt" TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "article" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "lede" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "readTime" TEXT NOT NULL DEFAULT '5 min read',
  "category" TEXT NOT NULL DEFAULT 'Notes',
  "tags" TEXT NOT NULL DEFAULT '[]',
  "content" TEXT NOT NULL,
  "image" TEXT,
  "published" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TEXT NOT NULL DEFAULT (datetime('now')),
  "updatedAt" TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS "article_slug_key" ON "article"("slug");

CREATE TABLE IF NOT EXISTS "chat_suggestion" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "question" TEXT NOT NULL,
  "kind" TEXT NOT NULL DEFAULT 'ask',
  "tool" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "active" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TEXT NOT NULL DEFAULT (datetime('now')),
  "updatedAt" TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS "chat_response" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "trigger" TEXT NOT NULL,
  "response" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "active" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TEXT NOT NULL DEFAULT (datetime('now')),
  "updatedAt" TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS "chat_config" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "key" TEXT NOT NULL,
  "pageTitle" TEXT NOT NULL DEFAULT 'Ask Ali anything',
  "modelName" TEXT NOT NULL DEFAULT 'claude-3-5-sonnet',
  "systemPrompt" TEXT NOT NULL DEFAULT '',
  "updatedAt" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS "chat_config_key_key" ON "chat_config"("key");

CREATE TABLE IF NOT EXISTS "audit_log" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "actorUserId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "metadata" TEXT,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY ("actorUserId") REFERENCES "user"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "audit_log_actorUserId_idx" ON "audit_log"("actorUserId");
CREATE INDEX IF NOT EXISTS "audit_log_action_idx" ON "audit_log"("action");
`;

async function main() {
  console.log("=== Turso Migration ===\n");

  // 1. Create tables on Turso
  console.log("1. Creating schema on Turso...");
  const turso = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

  const statements = SCHEMA_SQL
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    try {
      await turso.execute(stmt + ";");
    } catch (err: any) {
      if (!err.message?.includes("already exists")) {
        console.log(`   Error: ${err.message?.slice(0, 100)}`);
        console.log(`   SQL: ${stmt.slice(0, 80)}...`);
      }
    }
  }
  console.log("   ✓ Schema created");

  // 2. Read all data from Neon
  console.log("\n2. Reading data from Neon...");
  const neon = new PrismaClient({
    datasources: { db: { url: NEON_URL } },
    log: ["error"],
  });

  const tables = [
    { name: "user", model: "user" },
    { name: "session", model: "session" },
    { name: "account", model: "account" },
    { name: "verification", model: "verification" },
    { name: "site_config", model: "siteConfig" },
    { name: "project", model: "project" },
    { name: "project_section", model: "projectSection" },
    { name: "article", model: "article" },
    { name: "chat_suggestion", model: "chatSuggestion" },
    { name: "chat_response", model: "chatResponse" },
    { name: "chat_config", model: "chatConfig" },
    { name: "audit_log", model: "auditLog" },
  ];

  // 3. Insert into Turso
  console.log("\n3. Inserting data into Turso...");

  for (const { name, model } of tables) {
    let rows: any[];
    try {
      // @ts-ignore - dynamic model access
      rows = await neon[model].findMany();
    } catch (err: any) {
      console.log(`   ${name}: SKIP (${err.message?.slice(0, 60)})`);
      continue;
    }

    if (rows.length === 0) {
      console.log(`   ${name}: 0 rows`);
      continue;
    }

    const columns = Object.keys(rows[0]).filter(
      (c) => typeof rows[0][c] !== "object" || rows[0][c] === null || rows[0][c] instanceof Date
    );
    const qCols = columns.map((c) => `"${c}"`).join(", ");
    const placeholders = columns.map(() => "?").join(", ");
    const sql = `INSERT OR IGNORE INTO "${name}" (${qCols}) VALUES (${placeholders})`;

    let ok = 0;
    for (const row of rows) {
      const s = serialize(row, name);
      const values = columns.map((c) => {
        const v = s[c];
        if (v instanceof Date) return v.toISOString();
        if (typeof v === "boolean") return v ? 1 : 0;
        return v ?? null;
      });
      try {
        await turso.execute({ sql, args: values as string[] });
        ok++;
      } catch (err: any) {
        if (ok === 0) {
          console.log(`   ${name}: first row error - ${err.message?.slice(0, 100)}`);
          console.log(`   Sample: ${JSON.stringify(values).slice(0, 200)}`);
        }
      }
    }
    console.log(`   ${name}: ${ok}/${rows.length}`);
  }

  await neon.$disconnect();
  await turso.close();
  console.log("\n✓ Migration complete!");
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
