/**
 * Next.js instrumentation hook
 * Used to initialize Sentry and other monitoring tools
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initSentry } = await import('./lib/sentry');
    initSentry();
  }
}
