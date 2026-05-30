'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  CheckCircle2,
  GitPullRequestArrow,
  Link2,
  Loader2,
  X,
  XCircle,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import * as React from 'react'
import { FormattedText } from './formatted-text'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export type ReviewOutcome = 'pass' | 'fail'

export function ReviewModal({
  review,
  reviewing,
  independence,
  hintsUsed,
  elapsed,
  tests,
  outcome = 'pass',
  sessionId,
  onClose,
  onComplete,
}: {
  review: string | null
  reviewing: boolean
  independence: number
  hintsUsed: number
  elapsed: number
  tests: { passed: number; total: number } | null
  outcome?: ReviewOutcome
  sessionId?: string | null
  onClose: () => void
  onComplete?: () => void
}) {
  const [celebrating, setCelebrating] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  function handleComplete() {
    if (celebrating) return
    setCelebrating(true)
    setTimeout(() => onComplete?.(), 1600)
  }

  async function copyShareLink() {
    if (!sessionId || typeof window === 'undefined') return
    const url = `${window.location.origin}/replay/${sessionId}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copie o link:', url)
    }
  }

  const passed = outcome === 'pass'
  const canShare = passed && !!sessionId

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 z-50 grid place-items-center bg-[#1b1916]/40 p-4 backdrop-blur-sm'
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className='shadow-soft-lg relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[#DFE5E9] bg-white'
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className='absolute top-4 right-4 z-10 grid size-8 cursor-pointer place-items-center rounded-full border border-[#DFE5E9] bg-white text-[#6b6478] transition-colors hover:bg-[#F7F9FA] hover:text-[#1b1916]'
          aria-label='Fechar'
        >
          <X className='size-4' />
        </button>

        <div className='shrink-0 px-8 pt-10 pb-5'>
          <div
            className={cn(
              'mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[11px]',
              passed
                ? 'border border-iris/20 bg-iris/10 text-iris'
                : 'border border-amber-500/30 bg-amber-50 text-amber-700',
            )}
          >
            <GitPullRequestArrow className='size-3' />
            {passed ? 'Code Review Socrático' : 'Ainda não passou'}
          </div>
          <h2 className='mb-2 font-heading text-3xl leading-tight font-semibold tracking-[-0.02em] text-[#1b1916]'>
            {passed ? (
              <>
                Você submeteu. Agora vamos{' '}
                <span className='text-gradient font-serif font-normal italic'>
                  defender
                </span>
                .
              </>
            ) : (
              <>
                Quase lá. Volta e{' '}
                <span className='text-gradient font-serif font-normal italic'>
                  refaz
                </span>
                .
              </>
            )}
          </h2>
          <p className='text-[#6b6478]'>
            {passed
              ? 'O tutor revisou seu trabalho. Leia, responda mentalmente e melhore.'
              : 'O desafio ainda não foi resolvido. Use o feedback abaixo pra fechar o que falta.'}
          </p>
        </div>

        <div className='min-h-0 flex-1 overflow-y-auto px-8 pb-6'>
          {tests && <TestBanner passed={tests.passed} total={tests.total} />}
          {reviewing || !review ? (
            <div className='flex items-center gap-2 py-8 text-sm text-[#6b6478]'>
              <Loader2 className='size-4 animate-spin' /> Gerando review…
            </div>
          ) : (
            <div className='rounded-2xl border border-[#DFE5E9] bg-[#F7F9FA] p-5 text-[14px] leading-relaxed text-[#2c2330]'>
              <FormattedText text={review} />
            </div>
          )}
        </div>

        <div className='shrink-0 border-t border-[#DFE5E9] bg-[#F7F9FA] px-8 py-6'>
          <div className='mb-5 grid grid-cols-3 gap-3'>
            <Metric
              label='Independência'
              value={`${independence}%`}
              accent='mint'
              hint='Começa em 100. Cada hint custa. É o quanto você pensou sozinho.'
            />
            <Metric label='Hints usados' value={String(hintsUsed)} />
            <Metric label='Tempo' value={formatTime(elapsed)} accent='iris' />
          </div>
          <div className='flex flex-col gap-2 sm:flex-row'>
            <Button
              size='lg'
              variant='ghost'
              onClick={onClose}
              className='cursor-pointer rounded-xl text-[#6b6478] hover:text-[#1b1916] sm:flex-1'
            >
              Revisar de novo
            </Button>
            {canShare && (
              <Button
                size='lg'
                variant='ghost'
                onClick={copyShareLink}
                className='cursor-pointer rounded-xl border border-[#DFE5E9] text-[#1b1916] hover:bg-[#F7F9FA] sm:flex-1'
              >
                {copied ? (
                  <>
                    <CheckCircle2 className='size-4 text-emerald-600' />
                    Link copiado
                  </>
                ) : (
                  <>
                    <Link2 className='size-4' />
                    Compartilhar
                  </>
                )}
              </Button>
            )}
            <Button
              size='lg'
              onClick={handleComplete}
              className={cn(
                'cursor-pointer rounded-xl border-transparent text-primary-foreground sm:flex-1',
                passed
                  ? 'bg-primary hover:bg-primary/90'
                  : 'bg-amber-600 hover:bg-amber-600/90',
              )}
            >
              {passed ? (
                <>
                  <CheckCircle2 className='size-4' />
                  Concluir
                </>
              ) : (
                <>
                  <XCircle className='size-4' />
                  Marcar como reprovado
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {celebrating && <Celebration passed={passed} independence={independence} />}
      </AnimatePresence>
    </motion.div>
  )
}

function celebrationLine(passed: boolean, independence: number): string {
  if (!passed) return 'Não passou desta vez. Mas você pensou. Volta.'
  if (independence >= 85) return 'Você é livre. Sócrates aprovaria.'
  if (independence >= 60) return 'Bom trabalho. Você pensou.'
  return 'Concluído. Independência é prática — continue.'
}

function Celebration({
  passed,
  independence,
}: {
  passed: boolean
  independence: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 z-[60] grid place-items-center bg-white/95 backdrop-blur-sm'
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className='relative flex flex-col items-center'
      >
        <motion.div
          initial={{ scale: 0, opacity: 0.3 }}
          animate={{ scale: 6, opacity: 0 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          className={cn(
            'absolute inset-0 -z-10 size-24 rounded-full',
            passed ? 'bg-primary/20' : 'bg-amber-400/20',
          )}
        />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 220 }}
          className={cn(
            'mb-6 grid size-24 place-items-center rounded-full',
            passed ? 'bg-primary text-primary-foreground' : 'bg-amber-500 text-white',
          )}
        >
          {passed ? (
            <CheckCircle2 className='size-12' strokeWidth={2} />
          ) : (
            <XCircle className='size-12' strokeWidth={2} />
          )}
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className='font-heading max-w-[20ch] text-center text-3xl font-medium tracking-tight text-[#1b1916] sm:text-4xl'
        >
          <span className='text-gradient font-serif italic'>
            {celebrationLine(passed, independence)}
          </span>
        </motion.h2>
      </motion.div>
    </motion.div>
  )
}

function TestBanner({ passed, total }: { passed: number; total: number }) {
  if (total === 0) {
    return (
      <div className='mb-4 rounded-xl border border-[#DFE5E9] bg-[#F7F9FA] px-4 py-3 text-[13px] text-[#6b6478]'>
        Sem testes automáticos neste desafio — o review abaixo é a avaliação.
      </div>
    )
  }
  const solved = passed === total
  return (
    <div
      className={cn(
        'mb-4 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-[13px] font-medium',
        solved
          ? 'border-emerald-600/30 bg-emerald-50 text-emerald-700'
          : 'border-amber-500/40 bg-amber-50 text-amber-700',
      )}
    >
      {solved ? (
        <CheckCircle2 className='size-4 shrink-0' />
      ) : (
        <XCircle className='size-4 shrink-0' />
      )}
      {solved
        ? `Passou em todos os testes (${passed}/${total}) — desafio resolvido.`
        : `Passou ${passed}/${total} testes — ainda não resolvido. Use o review pra fechar o que falta.`}
    </div>
  )
}

function Metric({
  label,
  value,
  accent,
  hint,
}: {
  label: string
  value: string
  accent?: 'mint' | 'iris'
  hint?: string
}) {
  return (
    <div
      className='rounded-xl border border-[#DFE5E9] bg-white p-3'
      title={hint}
    >
      <div className='mb-1 font-mono text-[10px] tracking-wider text-[#6b6478] uppercase'>
        {label}
      </div>
      <div
        className={cn(
          'font-heading text-lg font-semibold tabular-nums text-[#1b1916]',
          accent === 'mint' && 'text-emerald-600',
          accent === 'iris' && 'text-iris',
        )}
      >
        {value}
      </div>
    </div>
  )
}
