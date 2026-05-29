'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  CheckCircle2,
  GitPullRequestArrow,
  Loader2,
  X,
  XCircle,
} from 'lucide-react'
import { motion } from 'motion/react'
import { FormattedText } from './formatted-text'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function ReviewModal({
  review,
  reviewing,
  independence,
  hintsUsed,
  elapsed,
  tests,
  onClose,
  onComplete,
}: {
  review: string | null
  reviewing: boolean
  independence: number
  hintsUsed: number
  elapsed: number
  tests: { passed: number; total: number } | null
  onClose: () => void
  onComplete?: () => void
}) {
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
          <div className='mb-5 inline-flex items-center gap-2 rounded-full border border-iris/20 bg-iris/10 px-3 py-1 font-mono text-[11px] text-iris'>
            <GitPullRequestArrow className='size-3' />
            Code Review Socrático
          </div>
          <h2 className='mb-2 font-heading text-3xl leading-tight font-semibold tracking-[-0.02em] text-[#1b1916]'>
            Você submeteu. Agora vamos{' '}
            <span className='text-gradient font-serif font-normal italic'>
              defender
            </span>
            .
          </h2>
          <p className='text-[#6b6478]'>
            O tutor revisou seu código. Leia, responda mentalmente e melhore.
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
            />
            <Metric label='Hints usados' value={String(hintsUsed)} />
            <Metric label='Tempo' value={formatTime(elapsed)} accent='iris' />
          </div>
          <div className='flex gap-2'>
            <Button
              size='lg'
              variant='ghost'
              onClick={onClose}
              className='flex-1 cursor-pointer rounded-xl text-[#6b6478] hover:text-[#1b1916]'
            >
              Revisar de novo
            </Button>
            <Button
              size='lg'
              onClick={onComplete}
              className='flex-1 cursor-pointer rounded-xl border-transparent bg-primary text-primary-foreground hover:bg-primary/90'
            >
              <CheckCircle2 className='size-4' />
              Concluir
            </Button>
          </div>
        </div>
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
}: {
  label: string
  value: string
  accent?: 'mint' | 'iris'
}) {
  return (
    <div className='rounded-xl border border-[#DFE5E9] bg-white p-3'>
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
