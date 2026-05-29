'use client'

import { RequireAuth } from '@/components/require-auth'
import { ChallengeSkeleton } from '@/features/challenges/components/challenge-skeleton'
import { CodeChallengeWorkspace } from '@/features/challenges/components/code-challenge-workspace'

export default function ChallengePage() {
  return (
    <RequireAuth next='/challenge' fallback={<ChallengeSkeleton />}>
      {(user) => <CodeChallengeWorkspace user={user} />}
    </RequireAuth>
  )
}
