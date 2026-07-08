'use client'

import type { RunnerLanguage } from '@/domain/stacks'
import { cn } from '@/lib/utils'

export function EditorStatusbar({
  language,
  problems,
  line,
  col,
}: {
  language: RunnerLanguage
  problems: number
  line: number
  col: number
}) {
  return (
    <div className='flex h-6 shrink-0 items-center justify-between border-t border-border bg-muted px-4 font-mono text-[11px] text-muted-foreground'>
      <div className='flex items-center gap-3'>
        <span>{language === 'react' ? 'tsx' : language}</span>
        <span className={cn(problems > 0 && 'text-destructive')}>
          {problems === 0 ? '✓' : `✕ ${problems}`}
        </span>
      </div>
      <div className='flex items-center gap-3'>
        <span className='hidden sm:inline'>⌘K → tutor</span>
        <span>
          Ln {line}, Col {col}
        </span>
      </div>
    </div>
  )
}
