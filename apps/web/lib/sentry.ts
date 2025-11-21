/**
 * Sentry error tracking and monitoring
 */
import * as Sentry from '@sentry/nextjs';

/**
 * Initialize Sentry (called automatically by Next.js instrumentation)
 */
export function initSentry() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      debug: false,
      
      // Filter out sensitive data
      beforeSend(event, hint) {
        // Don't send events in development unless explicitly enabled
        if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_DEBUG) {
          return null;
        }

        // Scrub sensitive data
        if (event.request) {
          delete event.request.cookies;
          
          // Remove authorization headers
          if (event.request.headers) {
            delete event.request.headers['authorization'];
            delete event.request.headers['cookie'];
          }
        }

        return event;
      },

      integrations: [
        // Add performance monitoring
        new Sentry.BrowserTracing({
          tracePropagationTargets: [
            'localhost',
            /^\//,
            process.env.NEXT_PUBLIC_APP_URL || '',
          ],
        }),
      ],
    });

    console.log('[Sentry] Initialized');
  } else {
    console.warn('[Sentry] DSN not configured, error tracking disabled');
  }
}

/**
 * Capture exception with context
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context,
    });
  }

  // Always log to console
  console.error('[Error]', error, context);
}

/**
 * Capture message with level
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, any>
) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureMessage(message, {
      level,
      extra: context,
    });
  }

  console.log(`[${level.toUpperCase()}]`, message, context);
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; email?: string; role?: string }) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.setUser(user);
  }
}

/**
 * Clear user context
 */
export function clearUser() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.setUser(null);
  }
}
