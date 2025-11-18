import { NextRequest, NextResponse } from 'next/server';

/**
 * API middleware for authentication, rate limiting, and security
 */

// Simple in-memory rate limiter (for production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

const defaultRateLimit: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
};

/**
 * Rate limiting middleware
 */
export function rateLimit(req: NextRequest, config: RateLimitConfig = defaultRateLimit): boolean {
  // Get client identifier (IP address or API key)
  const identifier = getClientIdentifier(req);
  const now = Date.now();

  // Get or create rate limit entry
  let limit = rateLimitMap.get(identifier);

  if (!limit || now > limit.resetAt) {
    // Create new window
    limit = {
      count: 0,
      resetAt: now + config.windowMs,
    };
    rateLimitMap.set(identifier, limit);
  }

  // Increment counter
  limit.count++;

  // Check if limit exceeded
  return limit.count <= config.maxRequests;
}

/**
 * Get client identifier for rate limiting
 */
function getClientIdentifier(req: NextRequest): string {
  // Try to get API key first
  const apiKey = req.headers.get('x-api-key');
  if (apiKey) return `key:${apiKey}`;

  // Fall back to IP address
  const forwardedFor = req.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown';
  return `ip:${ip}`;
}

/**
 * Validates API key (optional, for production clients)
 */
export function validateApiKey(req: NextRequest): boolean {
  const apiKey = req.headers.get('x-api-key');

  // If no API key system is configured, allow all requests
  const validApiKeys = process.env.API_KEYS?.split(',') || [];

  if (validApiKeys.length === 0) {
    // No API key validation configured - allow request
    return true;
  }

  // If API keys are configured, require valid key
  if (!apiKey) {
    return false;
  }

  return validApiKeys.includes(apiKey);
}

/**
 * Validates client ID authorization
 */
export function authorizeClient(clientId: string, apiKey: string | null): boolean {
  // In demo mode or for demo client, always allow
  if (process.env.CLEARSIGHT_DEMO_MODE === 'true' || clientId === 'demo-client' || clientId === '00000000-0000-0000-0000-000000000001') {
    return true;
  }

  // For production, validate that API key has access to this client
  // This would typically check a database mapping of API keys to client IDs
  // For now, we'll allow if any API key is present (implement proper auth later)
  return !!apiKey || !process.env.API_KEYS;
}

/**
 * CORS headers for API routes
 */
export function getCorsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Create standardized error response
 */
export function errorResponse(message: string, status: number = 500): NextResponse {
  return NextResponse.json(
    {
      ok: false,
      error: message,
      timestamp: new Date().toISOString(),
    },
    {
      status,
      headers: getCorsHeaders(),
    }
  );
}

/**
 * Create standardized success response
 */
export function successResponse(data: any, status: number = 200): NextResponse {
  return NextResponse.json(
    {
      ok: true,
      ...data,
      timestamp: new Date().toISOString(),
    },
    {
      status,
      headers: getCorsHeaders(),
    }
  );
}

/**
 * Clean up old rate limit entries (call periodically)
 */
export function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, limit] of rateLimitMap.entries()) {
    if (now > limit.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}

// Clean up rate limits every 5 minutes
if (typeof window === 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}
