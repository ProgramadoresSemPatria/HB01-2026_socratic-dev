import * as Sentry from '@sentry/nextjs'
import posthog from 'posthog-js'

if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: '/ingest',
    ui_host: 'https://us.posthog.com',
    defaults: '2025-05-24',
    person_profiles: 'identified_only',
    capture_exceptions: false,
  })
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled:
    process.env.NODE_ENV === 'production' &&
    !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2,
  replaysSessionSampleRate: 0.05,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false }),
  ],
  ignoreErrors: [
    'Failed to fetch',
    'Load failed',
    'NetworkError',
    'AbortError',
    'ResizeObserver loop',
  ],
  beforeSend(event) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return null
    return event
  },
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
