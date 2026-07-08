'use client'

import { useT } from '@/lib/i18n'
import { Sparkles } from 'lucide-react'

const copy = {
  en: { askTutor: 'Ask the tutor' },
  pt: { askTutor: 'Perguntar ao tutor' },
}

export function AskTutorPill({
  top,
  left,
  onClick,
}: {
  top: number
  left: number
  onClick: () => void
}) {
  const t = useT(copy)
  return (
    <button
      type='button'
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      style={{ top, left }}
      className='absolute z-10 flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-[12px] font-medium text-ink shadow-md transition-colors duration-150 hover:bg-secondary'
    >
      <Sparkles className='size-3.5 text-primary' strokeWidth={1.5} />
      {t.askTutor}
      <span className='font-mono text-[10px] text-muted-foreground'>⌘K</span>
    </button>
  )
}
