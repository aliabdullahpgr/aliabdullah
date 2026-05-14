import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Graceful fallback for local development if Upstash env vars are missing
const hasRedisEnv = !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

if (!hasRedisEnv && process.env.NODE_ENV === "production") {
  console.warn("⚠️  WARNING: UPSTASH_REDIS_REST_URL is missing. Rate limiting is disabled in PRODUCTION.");
} else if (!hasRedisEnv) {
  console.info("ℹ️  INFO: Upstash Redis env vars missing. Rate limiting bypassed for local development.");
}

const redis = hasRedisEnv ? Redis.fromEnv() : null;

// Mock Ratelimit for development without Redis
const mockLimit = async () => ({ success: true, pending: Promise.resolve() } as const);

export const rateLimitters = {
  // Relaxed: 100 requests per 10 seconds (for general reads)
  public: redis 
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(100, "10 s"), analytics: true })
    : { limit: mockLimit },
    
  // Strict: 10 requests per 10 seconds (for mutations, admin actions, or auth)
  strict: redis 
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "10 s"), analytics: true })
    : { limit: mockLimit },
};
