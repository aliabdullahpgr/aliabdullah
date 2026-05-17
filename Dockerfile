FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable pnpm

# ─── deps ───
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

# ─── builder ───
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env: skip strict validation (real secrets injected at runtime).
# next.config.js does not read env at build time, so this is safe.
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_ENV_VALIDATION=1

RUN pnpm db:generate
RUN pnpm build

# ─── runner ───
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

RUN mkdir .next && chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

# Required runtime env vars (must be injected by the platform — Cloud Run secrets, etc.):
#   DATABASE_URL                       postgres://... (with ?sslmode=require for managed pg)
#   BETTER_AUTH_SECRET                 >= 32 chars
#   BETTER_AUTH_URL                    https://<your-domain>
#   BETTER_AUTH_GITHUB_CLIENT_ID
#   BETTER_AUTH_GITHUB_CLIENT_SECRET
#   UPSTASH_REDIS_REST_URL
#   UPSTASH_REDIS_REST_TOKEN
#   GEMINI_API_KEY

CMD ["node", "server.js"]
