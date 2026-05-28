'use client'

import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function AuthTest() {
  const [out, setOut] = useState('running...')
  useEffect(() => {
    ;(async () => {
      try {
        const email = `ct${Date.now()}@example.com`
        const password = 'ctpass123'
        const su = await fetch('/api/signup', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const si = await supabase.auth.signInWithPassword({ email, password })
        const sess = await supabase.auth.getSession()
        setOut(
          JSON.stringify(
            {
              signupOk: su.ok,
              signInError: si.error?.message ?? null,
              signInUser: si.data.user?.id ?? null,
              getSessionUser: sess.data.session?.user?.id ?? null,
              storageKeys: Object.keys(localStorage).filter(
                (k) => k.includes('sb-') || k.includes('supabase'),
              ),
            },
            null,
            2,
          ),
        )
      } catch (e) {
        setOut('ERR: ' + (e instanceof Error ? e.message : String(e)))
      }
    })()
  }, [])
  return <pre id='out'>{out}</pre>
}
