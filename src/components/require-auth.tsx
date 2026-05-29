'use client'

import { useUser } from '@/features/auth/hooks/use-user'
import type { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import * as React from 'react'

type Props = {
  next: string
  fallback?: React.ReactNode
  children: (user: User) => React.ReactNode
}

export function RequireAuth({ next, fallback, children }: Props) {
  const router = useRouter()
  const { user, loading } = useUser()

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(next)}`)
    }
  }, [loading, user, next, router])

  if (loading) return <>{fallback ?? null}</>
  if (!user) return null
  return <>{children(user)}</>
}
