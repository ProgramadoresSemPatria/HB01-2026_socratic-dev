'use client'

import { Button } from '@/components/ui/button'
import type { RunnerLanguage } from '@/domain/stacks'
import { useT } from '@/lib/i18n'
import { DiffEditor, monacoLanguage } from './monaco'

const copy = {
  en: {
    proposedSolution: 'Proposed solution — review the diff before applying',
    apply: 'Apply',
    discard: 'Discard',
  },
  pt: {
    proposedSolution: 'Solução proposta — revise o diff antes de aplicar',
    apply: 'Aplicar',
    discard: 'Descartar',
  },
}

export function SolutionDiff({
  language,
  original,
  modified,
  isDark,
  onApply,
  onDiscard,
}: {
  language: RunnerLanguage
  original: string
  modified: string
  isDark: boolean
  onApply: () => void
  onDiscard: () => void
}) {
  const t = useT(copy)
  return (
    <>
      <DiffEditor
        height='100%'
        language={monacoLanguage(language)}
        original={original}
        modified={modified}
        theme={isDark ? 'vs-dark' : 'light'}
        options={{
          readOnly: true,
          renderSideBySide: false,
          fontSize: 14,
          fontFamily: 'var(--font-mono)',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbersMinChars: 3,
        }}
      />
      <div className='absolute inset-x-0 bottom-0 z-10 flex items-center justify-between gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur'>
        <span className='min-w-0 truncate text-[13px] text-muted-foreground'>
          {t.proposedSolution}
        </span>
        <div className='flex shrink-0 gap-2'>
          <Button size='xs' variant='ghost' onClick={onDiscard}>
            {t.discard}
          </Button>
          <Button size='xs' variant='ink' onClick={onApply}>
            {t.apply}
          </Button>
        </div>
      </div>
    </>
  )
}
