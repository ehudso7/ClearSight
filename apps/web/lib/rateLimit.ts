/**
 * Rate limiting using Upstash Redis
 */
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

/**
 * Rate limiter for authenticated API requests
 * 100 requests per minute per user
 */
export const authenticatedRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 m'),
      analytics: true,
      prefix: 'ratelimit:auth',
    })
  : null;

/**
 * Rate limiter for unauthenticated API requests
 * 10 requests per minute per IP
 */
export const unauthenticatedRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      analytics: true,
      prefix: 'ratelimit:unauth',
    })
  : null;

/**
 * Rate limiter for webhook endpoints
 * 60 requests per hour
 */
export const webhookRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, '1 h'),
      analytics: true,
      prefix: 'ratelimit:webhook',
    })
  : null;

/**
 * Check rate limit for a request
 */
export async function checkRateLimit(
  identifier: string,
  limiter: typeof authenticatedRateLimit | null
): Promise<{
  success: boolean;
  limit?: number;
  remaining?: number;
  reset?: number;
}> {
  // If rate limiting is not configured, allow all requests
  if (!limiter) {
    console.warn('[RateLimit] Upstash Redis not configured, rate limiting disabled');
    return { success: true };
  }

  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier);

    return {
      success,
      limit,
      remaining,
      reset,
    };
  } catch (error) {
    console.error('[RateLimit] Error checking rate limit:', error);
    // On error, allow the request (fail open)
    return { success: true };
  }
}

/**
 * Get IP address from request
 */
export function getIP(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  const realIP = headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP.trim();
  }
  
  return 'unknown';
}
