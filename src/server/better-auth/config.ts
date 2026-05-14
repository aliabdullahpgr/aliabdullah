import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { env } from "~/env";
import { db } from "~/server/db";

const isSkippingEnvValidation = !!process.env.SKIP_ENV_VALIDATION;
const ciBuildSecret = "ci-build-only-better-auth-secret-change-me";

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET ?? (isSkippingEnvValidation ? ciBuildSecret : undefined),
  baseURL: env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
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
