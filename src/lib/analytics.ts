'use client'

import posthog from 'posthog-js'

function ready() {
  return typeof window !== 'undefined' && posthog.__loaded
}

export function track(event: string, props?: Record<string, unknown>) {
  if (!ready()) return
  try {
    posthog.capture(event, props)
  } catch {}
}

export function identify(id: string, props?: Record<string, unknown>) {
  if (!ready()) return
  try {
    posthog.identify(id, props)
  } catch {}
}

export function resetAnalytics() {
  if (!ready()) return
  try {
    posthog.reset()
  } catch {}
}
