import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const isProduction = process.env.NODE_ENV === "production";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    BETTER_AUTH_SECRET: isProduction
      ? z.string().min(32)
      : z.string().min(32).optional(),
    BETTER_AUTH_GITHUB_CLIENT_ID: isProduction
      ? z.string().min(1)
      : z.string().min(1).optional(),
    BETTER_AUTH_GITHUB_CLIENT_SECRET: isProduction
      ? z.string().min(1)
      : z.string().min(1).optional(),
    BETTER_AUTH_URL: isProduction
      ? z.string().url()
      : z.string().url().optional(),
    UPSTASH_REDIS_REST_URL: isProduction
      ? z.string().url()
      : z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: isProduction
      ? z.string().min(1)
      : z.string().min(1).optional(),
    DATABASE_URL: isProduction
      ? z.string().url()
      : z.string().url().optional(),
    TURSO_AUTH_TOKEN: isProduction
      ? z.string().min(1)
      : z.string().min(1).optional(),
    GEMINI_API_KEY: isProduction
      ? z.string().min(1)
      : z.string().min(1).optional(),
    UPLOADTHING_TOKEN: isProduction
      ? z.string().min(1)
      : z.string().min(1).optional(),
    REVALIDATE_SECRET: isProduction
      ? z.string().min(1)
      : z.string().min(1).optional(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_GITHUB_CLIENT_ID: process.env.BETTER_AUTH_GITHUB_CLIENT_ID,
    BETTER_AUTH_GITHUB_CLIENT_SECRET:
      process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    DATABASE_URL: process.env.DATABASE_URL,
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
    REVALIDATE_SECRET: process.env.REVALIDATE_SECRET,
    NODE_ENV: process.env.NODE_ENV,
  },
  /**
   * Allow skipping env validation. This is necessary during the Docker build stage
   * where environment variables are not available but Next.js tries to validate them.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION || process.env.npm_lifecycle_event === "build",
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
