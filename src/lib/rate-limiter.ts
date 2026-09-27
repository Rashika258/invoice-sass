import { AppError } from "@/lib/errors";

const requestBuckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Sliding window rate limiter for API protection
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 60,
  windowMs: number = 60000, // 1 minute
): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const bucket = requestBuckets.get(identifier);

  if (!bucket || bucket.resetAt <= now) {
    requestBuckets.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetInMs: windowMs };
  }

  if (bucket.count >= maxRequests) {
    const resetInMs = Math.max(0, bucket.resetAt - now);
    return { allowed: false, remaining: 0, resetInMs };
  }

  bucket.count++;
  return {
    allowed: true,
    remaining: maxRequests - bucket.count,
    resetInMs: Math.max(0, bucket.resetAt - now),
  };
}

/**
 * Assert rate limit threshold, throwing AppError if exceeded
 */
export function assertRateLimit(identifier: string, maxRequests = 60, windowMs = 60000): void {
  const result = checkRateLimit(identifier, maxRequests, windowMs);
  if (!result.allowed) {
    throw new AppError(
      "RATE_LIMITED",
      `Rate limit exceeded. Too many requests for '${identifier}'. Retry in ${Math.ceil(result.resetInMs / 1000)}s.`,
      429,
    );
  }
}
