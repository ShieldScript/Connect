import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware - Runs on all requests before they reach the route handlers
 * Used here to add security headers to all API responses
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Only apply to API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    // Content Security Policy (CSP)
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Required for Next.js
      "style-src 'self' 'unsafe-inline'", // Required for styled components
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co", // Allow Supabase
      "frame-ancestors 'none'",
    ].join('; ');

    response.headers.set('Content-Security-Policy', csp);

    // HSTS (HTTP Strict Transport Security) - Only in production with HTTPS
    if (process.env.NODE_ENV === 'production') {
      response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }
  }

  return response;
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all API routes
     */
    '/api/:path*',
  ],
};
