'use client'

import { identify, resetAnalytics } from '@/lib/analytics'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return
        setUser(data.session?.user ?? null)
        setLoading(false)
      })
      .catch(() => {
        if (mounted) setLoading(false)
      })
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) {
        identify(session.user.id, { email: session.user.email })
      } else if (event === 'SIGNED_OUT') {
        resetAnalytics()
      }
    })
    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  return { user, loading }
}

export async function signOut() {
  await supabase.auth.signOut()
}
