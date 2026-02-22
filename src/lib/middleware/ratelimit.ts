import { NextRequest, NextResponse } from 'next/server';

/**
 * Rate limiting middleware using Upstash Redis
 *
 * NOTE: Upstash Redis is optional. If not configured, rate limiting will be disabled
 * with a warning in development. In production, you should configure Upstash for security.
 */

let Ratelimit: any;
let Redis: any;

// Dynamically import Upstash packages only if available
let redis: any = null;
let ratelimiters: any = null;

// Initialize Redis and rate limiters
async function initializeRateLimiting() {
  if (ratelimiters !== null) {
    return ratelimiters; // Already initialized
  }

  // Check if Upstash is configured
  if (!process.env.UPSTASH_REDIS_URL || !process.env.UPSTASH_REDIS_TOKEN) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Rate limiting disabled: UPSTASH_REDIS_URL and UPSTASH_REDIS_TOKEN not configured');
    }
    ratelimiters = null;
    return null;
  }

  try {
    // Dynamically import Upstash packages
    const upstashRedis = await import('@upstash/redis');
    const upstashRatelimit = await import('@upstash/ratelimit');

    Redis = upstashRedis.Redis;
    Ratelimit = upstashRatelimit.Ratelimit;

    // Initialize Redis client
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_URL,
      token: process.env.UPSTASH_REDIS_TOKEN,
    });

    // Create rate limiters with different limits
    ratelimiters = {
      // Standard API routes: 10 requests per 10 seconds
      api: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '10 s'),
        analytics: true,
        prefix: '@ratelimit/api',
      }),

      // Auth routes: 5 requests per minute (stricter for security)
      auth: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '1 m'),
        analytics: true,
        prefix: '@ratelimit/auth',
      }),

      // Expensive routes (matching, proximity search): 3 requests per minute
      expensive: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, '1 m'),
        analytics: true,
        prefix: '@ratelimit/expensive',
      }),
    };

    console.log('✅ Rate limiting initialized with Upstash Redis');
    return ratelimiters;
  } catch (error) {
    console.error('❌ Failed to initialize rate limiting:', error);
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Continuing without rate limiting (development mode)');
    }
    ratelimiters = null;
    return null;
  }
}

export type RateLimitType = 'api' | 'auth' | 'expensive';

/**
 * Rate limiting middleware for API routes
 *
 * @param request - The incoming request
 * @param type - The type of rate limit to apply (api, auth, expensive)
 * @returns Response with 429 status if rate limited, null otherwise
 *
 * @example
 * export async function GET(request: NextRequest) {
 *   // Check rate limit first
 *   const rateLimitResponse = await withRateLimit(request, 'api');
 *   if (rateLimitResponse) return rateLimitResponse;
 *
 *   // Your route logic here...
 * }
 */
export async function withRateLimit(
  request: NextRequest,
  type: RateLimitType = 'api'
): Promise<Response | null> {
  // Initialize rate limiting if not already done
  const limiters = await initializeRateLimiting();

  // If rate limiting is not configured, allow the request
  if (!limiters) {
    return null;
  }

  try {
    // Get identifier (IP address or user ID)
    const identifier =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Apply rate limit
    const { success, limit, remaining, reset } = await limiters[type].limit(identifier);

    // Add rate limit headers to response
    const headers = {
      'X-RateLimit-Limit': String(limit),
      'X-RateLimit-Remaining': String(remaining),
      'X-RateLimit-Reset': String(reset),
    };

    if (!success) {
      // Rate limit exceeded
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many requests. Please try again in ${Math.ceil((reset - Date.now()) / 1000)} seconds.`,
          reset: new Date(reset).toISOString(),
        },
        {
          status: 429,
          headers,
        }
      );
    }

    // Rate limit check passed, but we can't attach headers to the next response
    // The calling route will need to add these if needed
    return null;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // On error, allow the request (fail open for availability)
    return null;
  }
}

/**
 * Higher-order function that wraps API route handlers with rate limiting
 *
 * @param handler - The route handler function
 * @param type - The type of rate limit to apply
 * @returns Wrapped handler with rate limiting
 *
 * @example
 * export const GET = withRateLimitHandler(async (request) => {
 *   return NextResponse.json({ data: 'success' });
 * }, 'expensive');
 */
export function withRateLimitHandler(
  handler: (request: NextRequest) => Promise<Response>,
  type: RateLimitType = 'api'
) {
  return async (request: NextRequest): Promise<Response> => {
    // Check rate limit
    const rateLimitResponse = await withRateLimit(request, type);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Execute handler
    return handler(request);
  };
}
