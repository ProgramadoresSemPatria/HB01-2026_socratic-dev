'use client'

import { RequireAuth } from '@/components/require-auth'
import { ProfileView } from '@/features/profile/components/profile-view'

export default function ProfilePage() {
  return (
    <RequireAuth next='/profile'>
      {(user) => <ProfileView user={user} />}
    </RequireAuth>
  )
}
