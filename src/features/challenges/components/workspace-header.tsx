'use client'

import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { Brain, Building, Clock, GitPullRequestArrow } from 'lucide-react'

const copy = {
  en: {
    independenceTitle:
      'Starts at 100. Every hint costs. It measures how much you thought on your own.',
    independence: 'Independence:',
    submit: 'Submit',
  },
  pt: {
    independenceTitle:
      'Começa em 100. Cada hint custa. É o quanto você pensou sozinho.',
    independence: 'Independência:',
    submit: 'Submeter',
  },
}

export function WorkspaceHeader({
  title,
  elapsed,
  independence,
  submitting,
  onSubmit,
}: {
  title: string
  elapsed: number
  independence: number
  submitting: boolean
  onSubmit: () => void
}) {
  const t = useT(copy)
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const seconds = String(elapsed % 60).padStart(2, '0')

  return (
    <header className='z-30 flex h-14 shrink-0 items-center justify-between border-b border-border bg-white/80 px-4 backdrop-blur-xl'>
      <div className='flex items-center gap-4'>
        <Logo />
        <div className='hidden items-center gap-2 border-l border-border pl-4 font-mono text-[12px] text-muted-foreground sm:flex'>
          <Building className='size-3.5' strokeWidth={1.5} />
          {title}
        </div>
      </div>
      <div className='flex items-center gap-2'>
        <div className='glass hidden h-8 items-center gap-2 rounded-full px-3 font-mono text-[12px] text-ink md:flex'>
          <Clock className='size-3.5 opacity-70' strokeWidth={1.5} />
          <span>
            {minutes}:{seconds}
          </span>
        </div>
        <div
          className='glass hidden h-8 items-center gap-2 rounded-full px-3 text-[12px] md:flex'
          title={t.independenceTitle}
        >
          <Brain className='size-3.5 opacity-70' strokeWidth={1.5} />
          <span className='text-muted-foreground'>{t.independence}</span>
          <span
            className={cn(
              'font-medium tabular-nums',
              independence > 70
                ? 'text-mint'
                : independence > 40
                  ? 'text-warning-foreground'
                  : 'text-destructive-foreground',
            )}
          >
            {independence}%
          </span>
        </div>
        <Button
          size='sm'
          variant='ink'
          disabled={submitting}
          onClick={onSubmit}
          className='h-8 gap-1.5'
        >
          <GitPullRequestArrow className='size-3.5' />
          {t.submit}
        </Button>
      </div>
    </header>
  )
}
