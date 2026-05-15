import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { env } from "~/env";
import { db } from "~/server/db";

export const auth = betterAuth({
  secret:
    env.BETTER_AUTH_SECRET ?? "dummy-secret-for-build-time-only-1234567890",
  baseURL:
    env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  database: prismaAdapter(db, {
    provider: "postgresql", // or "sqlite" or "mysql"
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: env.BETTER_AUTH_GITHUB_CLIENT_ID ?? "",
      clientSecret: env.BETTER_AUTH_GITHUB_CLIENT_SECRET ?? "",
    },
  },
});

export type Session = typeof auth.$Infer.Session;
