'use client'

import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { RequireAuth } from '@/components/require-auth'
import { Skeleton } from '@/components/ui/skeleton'
import {
  listSessionsForUser,
  type SessionRow,
} from '@/features/challenges/actions'
import { getAccessToken } from '@/lib/api/client'
import { useT } from '@/lib/i18n'
import { ArrowRight, Users } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'

const copy = {
  en: {
    eyebrow: 'Community',
    title: 'How others solved it',
    subtitle:
      'Pick a challenge you completed to compare your solution with the community.',
    empty:
      'Complete a code challenge to unlock community solutions — no spoilers before that.',
    emptyCta: 'Start a challenge',
    open: 'View solutions',
  },
  pt: {
    eyebrow: 'Comunidade',
    title: 'Como outros resolveram',
    subtitle:
      'Escolha um desafio que você completou pra comparar sua solução com a da comunidade.',
    empty:
      'Complete um desafio de código pra desbloquear as soluções da comunidade — sem spoiler antes disso.',
    emptyCta: 'Começar um desafio',
    open: 'Ver soluções',
  },
}

type Entry = { challengeId: string; title: string; stack: string }

function SolutionsIndexContent() {
  const t = useT(copy)
  const [entries, setEntries] = React.useState<Entry[] | null>(null)

  React.useEffect(() => {
    let active = true
    ;(async () => {
      const token = await getAccessToken()
      const sessions: SessionRow[] = await listSessionsForUser(token)
      if (!active) return
      const seen = new Set<string>()
      const out: Entry[] = []
      for (const s of sessions) {
        if (s.status !== 'completed') continue
        if (s.challenges?.kind === 'design') continue
        if (seen.has(s.challenge_id)) continue
        seen.add(s.challenge_id)
        out.push({
          challengeId: s.challenge_id,
          title: s.challenges?.title ?? 'Desafio',
          stack: s.challenges?.stack ?? '',
        })
      }
      setEntries(out)
    })().catch(() => {
      if (active) setEntries([])
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className='relative flex min-h-screen flex-1 flex-col bg-background'>
      <Navbar />
      <main className='container-main flex-1 pt-[110px] pb-24'>
        <p className='eyebrow'>{t.eyebrow}</p>
        <h1 className='type-h2 mt-2'>{t.title}</h1>
        <p className='type-body mt-3 max-w-lg text-muted-foreground'>
          {t.subtitle}
        </p>

        {entries === null ? (
          <div className='mt-10 flex flex-col gap-3'>
            <Skeleton className='h-16 w-full rounded-lg' />
            <Skeleton className='h-16 w-full rounded-lg' />
            <Skeleton className='h-16 w-full rounded-lg' />
          </div>
        ) : entries.length === 0 ? (
          <div className='mt-10 flex flex-col items-start gap-5 rounded-lg border border-border bg-card px-6 py-10'>
            <Users className='size-5 text-primary' strokeWidth={1.5} />
            <p className='type-body max-w-lg'>{t.empty}</p>
            <Button variant='ink' render={<Link href='/challenge' />}>
              {t.emptyCta}
            </Button>
          </div>
        ) : (
          <div className='mt-10 flex flex-col gap-3'>
            {entries.map((e) => (
              <Link
                key={e.challengeId}
                href={`/solutions/${e.challengeId}`}
                className='group flex items-center gap-4 rounded-lg border border-border bg-card px-5 py-4 transition-colors duration-200 hover:bg-secondary'
              >
                <span className='min-w-0 flex-1 truncate text-sm font-medium text-ink'>
                  {e.title}
                </span>
                {e.stack && (
                  <span className='hidden font-mono text-[11px] uppercase text-muted-foreground sm:block'>
                    {e.stack}
                  </span>
                )}
                <span className='flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-primary'>
                  {t.open}
                  <ArrowRight className='size-3.5 transition-transform duration-200 group-hover:translate-x-0.5' />
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default function SolutionsIndexPage() {
  return (
    <RequireAuth next='/solutions'>
      {() => <SolutionsIndexContent />}
    </RequireAuth>
  )
}
