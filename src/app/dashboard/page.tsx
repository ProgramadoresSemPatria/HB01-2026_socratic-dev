'use client'

import { RequireAuth } from '@/components/require-auth'
import { DashboardView } from '@/features/dashboard/components/dashboard-view'

export default function DashboardPage() {
  return (
    <RequireAuth next='/dashboard'>
      {(user) => <DashboardView user={user} />}
    </RequireAuth>
  )
}
