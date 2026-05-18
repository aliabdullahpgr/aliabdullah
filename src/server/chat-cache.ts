import { redis } from "~/server/ratelimit";

const CACHE_TTL = 600; // 10 minutes

export async function getChatResponse(prompt: string): Promise<string | null> {
  if (!redis) return null;
  try {
    const key = `chat:${prompt.toLowerCase().trim()}`;
    const cached = await redis.get<string>(key);
    return cached;
  } catch {
    return null;
  }
}

export async function setChatResponse(prompt: string, response: string): Promise<void> {
  if (!redis) return;
  try {
    const key = `chat:${prompt.toLowerCase().trim()}`;
    await redis.set(key, response, { ex: CACHE_TTL });
  } catch {
    // Fail silently — caching is optional
  }
}
