import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { env } from "~/env";
import { db } from "~/server/db";

export const auth = betterAuth({
  secret:
    env.BETTER_AUTH_SECRET ?? "dummy-secret-for-build-time-only-1234567890",
  baseURL:
    env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://168.144.125.13:3000",
    ...(env.BETTER_AUTH_URL ? [env.BETTER_AUTH_URL] : []),
  ],
  database: prismaAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  socialProviders: {
    github: {
      clientId: env.BETTER_AUTH_GITHUB_CLIENT_ID ?? "",
      clientSecret: env.BETTER_AUTH_GITHUB_CLIENT_SECRET ?? "",
    },
  },
  // Only allow the first-ever user (the owner) to sign in via GitHub
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const existingUsers = await db.user.count();
          // First user gets admin. Anyone else is rejected.
          if (existingUsers === 0) {
            return { data: { ...user, role: "admin" } };
          }
          throw new Error("Access denied: only the site owner can log in.");
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
