'use client'

import { cn } from '@/lib/utils'
import { Code2, Loader2, Network, Sparkles, Wand2, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { generateChallenge } from '../actions'
import { getAccessToken } from '@/lib/api/client'

type Kind = 'code' | 'design'
type Level = 'beginner' | 'intermediate' | 'advanced'

const LEVELS: { id: Level; label: string }[] = [
  { id: 'beginner', label: 'Iniciante' },
  { id: 'intermediate', label: 'Intermediário' },
  { id: 'advanced', label: 'Avançado' },
]

const STACKS = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
]

const MAX_PROMPT = 500

export function CustomChallengeDialog({
  open,
  onClose,
  defaultLevel = 'intermediate',
}: {
  open: boolean
  onClose: () => void
  defaultLevel?: Level
}) {
  const router = useRouter()
  const [kind, setKind] = React.useState<Kind>('code')
  const [stack, setStack] = React.useState<string>('typescript')
  const [level, setLevel] = React.useState<Level>(defaultLevel)
  const [prompt, setPrompt] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function submit() {
    if (submitting || prompt.trim().length < 10) return
    setSubmitting(true)
    setError(null)
    try {
      const token = await getAccessToken()
      const result = await generateChallenge({
        token,
        kind,
        stack: kind === 'design' ? undefined : stack,
        level,
        userPrompt: prompt.trim(),
      })
      if ('error' in result) {
        setError(result.error)
        setSubmitting(false)
        return
      }
      router.push(
        kind === 'design'
          ? `/design?id=${result.id}`
          : `/challenge?id=${result.id}`,
      )
    } catch {
      setError('Não consegui gerar agora. Tente de novo.')
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 z-50 grid place-items-center bg-[#1b1916]/40 p-4 backdrop-blur-sm'
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className='shadow-soft-lg relative w-full max-w-xl overflow-hidden rounded-3xl border border-[#DFE5E9] bg-white'
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type='button'
              onClick={onClose}
              className='absolute top-4 right-4 grid size-8 cursor-pointer place-items-center rounded-full border border-[#DFE5E9] bg-white text-[#6b6478] hover:bg-[#F7F9FA]'
              aria-label='Fechar'
            >
              <X className='size-4' />
            </button>

            {submitting ? (
              <div className='flex flex-col items-center gap-4 px-10 py-16'>
                <div className='grid size-12 place-items-center rounded-xl bg-[#dad8ea]/55 text-[#1b1916]'>
                  <Sparkles className='size-6' strokeWidth={1.5} />
                </div>
                <h3 className='font-heading text-2xl font-medium tracking-tight text-[#1b1916]'>
                  Montando o seu desafio
                </h3>
                <p className='max-w-[36ch] text-center text-sm text-[#6b6478]'>
                  Estou interpretando o que você pediu e gerando briefing, código
                  inicial e testes escondidos.
                </p>
                <Loader2 className='size-5 animate-spin text-iris' />
              </div>
            ) : (
              <div className='px-8 pt-9 pb-7'>
                <div className='mb-5 inline-flex items-center gap-2 rounded-full border border-iris/20 bg-iris/10 px-3 py-1 font-mono text-[11px] text-iris'>
                  <Wand2 className='size-3' />
                  Desafio sob medida
                </div>
                <h2 className='mb-2 font-heading text-3xl leading-tight font-semibold tracking-tight text-[#1b1916]'>
                  Descreve o que você quer treinar.
                </h2>
                <p className='mb-6 text-sm text-[#6b6478]'>
                  A IA monta um desafio sob medida com briefing fictício, testes
                  e tutor socrático. Sem cola.
                </p>

                <div className='space-y-5'>
                  <div>
                    <div className='mb-2 font-mono text-[10px] tracking-wider text-[#6b6478] uppercase'>
                      Trilha
                    </div>
                    <div className='grid grid-cols-2 gap-2'>
                      <ChoiceTile
                        selected={kind === 'code'}
                        onClick={() => setKind('code')}
                        icon={<Code2 className='size-4' />}
                        label='Código'
                      />
                      <ChoiceTile
                        selected={kind === 'design'}
                        onClick={() => setKind('design')}
                        icon={<Network className='size-4' />}
                        label='System Design'
                      />
                    </div>
                  </div>

                  {kind === 'code' && (
                    <div>
                      <div className='mb-2 font-mono text-[10px] tracking-wider text-[#6b6478] uppercase'>
                        Linguagem
                      </div>
                      <div className='flex flex-wrap gap-2'>
                        {STACKS.map((s) => (
                          <Chip
                            key={s.id}
                            selected={stack === s.id}
                            onClick={() => setStack(s.id)}
                          >
                            {s.label}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className='mb-2 font-mono text-[10px] tracking-wider text-[#6b6478] uppercase'>
                      Nível
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      {LEVELS.map((l) => (
                        <Chip
                          key={l.id}
                          selected={level === l.id}
                          onClick={() => setLevel(l.id)}
                        >
                          {l.label}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className='mb-2 flex items-center justify-between font-mono text-[10px] tracking-wider text-[#6b6478] uppercase'>
                      <span>O que você quer treinar?</span>
                      <span>
                        {prompt.length}/{MAX_PROMPT}
                      </span>
                    </div>
                    <textarea
                      autoFocus
                      value={prompt}
                      onChange={(e) =>
                        setPrompt(e.target.value.slice(0, MAX_PROMPT))
                      }
                      rows={3}
                      placeholder={
                        kind === 'design'
                          ? 'Ex.: arquitetura de um app de delivery que precisa servir milhões de pedidos/s, com tracking em tempo real.'
                          : 'Ex.: quero praticar agregação de stream com janelas de tempo em JS, lidando com eventos fora de ordem.'
                      }
                      className='w-full resize-none rounded-xl border border-[#DFE5E9] bg-white px-4 py-3 text-[14px] text-[#1b1916] outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20'
                    />
                    <p className='mt-1.5 text-[12px] text-[#6b6478]'>
                      Mínimo 10 caracteres. Quanto mais específico, mais
                      direcionado o desafio.
                    </p>
                  </div>

                  {error && (
                    <div className='rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-600'>
                      {error}
                    </div>
                  )}
                </div>

                <div className='mt-7 flex gap-2'>
                  <button
                    type='button'
                    onClick={onClose}
                    className='flex-1 cursor-pointer rounded-xl border border-[#DFE5E9] px-5 py-3 text-sm font-medium text-[#6b6478] transition-colors hover:bg-[#F7F9FA]'
                  >
                    Cancelar
                  </button>
                  <button
                    type='button'
                    onClick={submit}
                    disabled={prompt.trim().length < 10}
                    className='group flex-1 cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium tracking-tight text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50'
                  >
                    <Wand2 className='size-4' />
                    Gerar meu desafio
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ChoiceTile({
  selected,
  onClick,
  icon,
  label,
}: {
  selected: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'flex items-center gap-2.5 rounded-xl border bg-white px-4 py-3 text-sm font-medium text-[#1b1916] transition-colors',
        selected
          ? 'border-primary/50 bg-primary/[0.04] ring-2 ring-primary/25'
          : 'border-[#DFE5E9] hover:border-[#1b1916]/20',
      )}
    >
      <span className='grid size-7 place-items-center rounded-lg bg-[#dad8ea]/55 text-[#1b1916]'>
        {icon}
      </span>
      {label}
    </button>
  )
}

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors',
        selected
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-[#DFE5E9] text-[#6b6478] hover:bg-[#F7F9FA]',
      )}
    >
      {children}
    </button>
  )
}
