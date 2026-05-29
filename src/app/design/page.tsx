'use client'

import { RequireAuth } from '@/components/require-auth'
import { ChallengeSkeleton } from '@/features/challenges/components/challenge-skeleton'
import { DesignChallengeWorkspace } from '@/features/design/components/design-challenge-workspace'

export default function DesignPage() {
  return (
    <RequireAuth next='/design' fallback={<ChallengeSkeleton />}>
      {(user) => <DesignChallengeWorkspace user={user} />}
    </RequireAuth>
  )
}
