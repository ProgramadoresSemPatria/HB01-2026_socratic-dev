'use client'

import * as React from 'react'

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  React.useEffect(() => {
    // Sentry is reached through the bridge set up by instrumentation-client —
    // importing @sentry/nextjs here would pull the SDK's multi-MB server
    // build into the SSR bundle.
    window.__captureException?.(error)
  }, [error])

  return (
    <html lang='en'>
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          background: '#121110',
          color: '#ece9e4',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center', padding: 24 }}>
          <p
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              opacity: 0.5,
            }}
          >
            socratic.dev
          </p>
          <h1 style={{ fontWeight: 300, fontSize: 32, margin: '16px 0 8px' }}>
            Something went wrong.
          </h1>
          <p style={{ opacity: 0.6, fontSize: 14, margin: 0 }}>
            Algo deu errado. O erro já foi registrado.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 28,
              padding: '10px 22px',
              borderRadius: 999,
              border: 'none',
              background: '#a6e40e',
              color: '#121110',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Reload · Recarregar
          </button>
        </div>
      </body>
    </html>
  )
}
