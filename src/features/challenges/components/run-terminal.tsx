'use client'

import type { RunResult } from '@/features/runner/types'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { CheckCircle2, Loader2, Terminal, X, XCircle } from 'lucide-react'

const copy = {
  en: {
    running: 'running…',
    tests: (passed: number, total: number) => `${passed}/${total} tests`,
    error: 'error',
    ok: 'ok',
    closeTerminal: 'Close terminal',
    idlePre: 'Click ',
    idleRun: 'Run',
    idlePost: ' to execute and test your code.',
    executing: 'Running…',
    noOutputPre:
      'Code ran without errors. This challenge has no tests defined yet — add a ',
    noOutputPost: ' to see the output here.',
  },
  pt: {
    running: 'rodando…',
    tests: (passed: number, total: number) => `${passed}/${total} testes`,
    error: 'erro',
    ok: 'ok',
    closeTerminal: 'Fechar terminal',
    idlePre: 'Clique em ',
    idleRun: 'Rodar',
    idlePost: ' para executar e testar seu código.',
    executing: 'Executando…',
    noOutputPre:
      'Código executado sem erros. Este desafio ainda não tem testes definidos — escreva um ',
    noOutputPost: ' para ver a saída aqui.',
  },
}

export function RunTerminal({
  result,
  running,
  onClose,
}: {
  result: RunResult | null
  running: boolean
  onClose?: () => void
}) {
  const t = useT(copy)
  const passed = result?.tests.filter((x) => x.passed).length ?? 0
  const total = result?.tests.length ?? 0

  return (
    <div className='flex h-[40%] min-h-[150px] shrink-0 flex-col border-t border-white/10 bg-ink text-white/80'>
      <div className='flex h-9 shrink-0 items-center justify-between border-b border-white/10 px-4 font-mono text-[11px] tracking-wider text-white/50 uppercase'>
        <span className='flex items-center gap-1.5'>
          <Terminal className='size-3.5' strokeWidth={1.5} /> Terminal
        </span>
        <div className='flex items-center gap-3'>
          {running ? (
            <span className='flex items-center gap-1.5 text-white/50 normal-case'>
              <Loader2 className='size-3 animate-spin' /> {t.running}
            </span>
          ) : result ? (
            <span
              className={cn(
                'flex items-center gap-1.5 font-medium normal-case',
                result.ok ? 'text-lime' : 'text-ember',
              )}
            >
              {result.ok ? (
                <CheckCircle2 className='size-3.5' />
              ) : (
                <XCircle className='size-3.5' />
              )}
              {total > 0
                ? t.tests(passed, total)
                : result.error
                  ? t.error
                  : t.ok}{' '}
              · {result.durationMs}ms
            </span>
          ) : null}
          {onClose && (
            <button
              type='button'
              onClick={onClose}
              aria-label={t.closeTerminal}
              className='-mr-1 grid size-6 place-items-center rounded text-white/50 hover:bg-white/10 hover:text-white'
            >
              <X className='size-3.5' />
            </button>
          )}
        </div>
      </div>

      <div className='min-h-0 flex-1 overflow-y-auto px-4 py-3 font-mono text-[12px] leading-relaxed'>
        {!result && !running && (
          <p className='text-white/40'>
            {t.idlePre}
            <span className='text-white/90'>{t.idleRun}</span>
            {t.idlePost}
          </p>
        )}
        {running && <p className='text-white/40'>{t.executing}</p>}
        {result && (
          <>
            {result.logs.length === 0 &&
              !result.error &&
              result.tests.length === 0 && (
                <p className='text-white/40'>
                  {t.noOutputPre}
                  <span className='text-white/90'>console.log</span>
                  {t.noOutputPost}
                </p>
              )}
            {result.logs.map((l, i) => (
              <div
                key={i}
                className={cn(
                  'whitespace-pre-wrap',
                  l.level === 'error'
                    ? 'text-ember'
                    : l.level === 'warn'
                      ? 'text-warning'
                      : 'text-white/70',
                )}
              >
                {l.text}
              </div>
            ))}
            {result.error && (
              <div className='mt-1 whitespace-pre-wrap text-ember'>
                ✕ {result.error}
              </div>
            )}
            {result.tests.length > 0 && (
              <div className='mt-3 space-y-1.5 border-t border-white/10 pt-3'>
                {result.tests.map((test, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex items-start gap-2',
                      test.passed ? 'text-lime' : 'text-ember',
                    )}
                  >
                    {test.passed ? (
                      <CheckCircle2 className='mt-0.5 size-3.5 shrink-0' />
                    ) : (
                      <XCircle className='mt-0.5 size-3.5 shrink-0' />
                    )}
                    <span className='text-white/90'>
                      {test.name}
                      {!test.passed && test.message ? (
                        <span className='text-ember'> — {test.message}</span>
                      ) : null}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
