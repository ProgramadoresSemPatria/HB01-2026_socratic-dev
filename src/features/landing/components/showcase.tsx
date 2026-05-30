'use client'

import { cn } from '@/lib/utils'
import { ArrowRight, Check } from 'lucide-react'
import { motion } from 'motion/react'
import * as React from 'react'
import { Reveal } from './reveal'
import { SectionBackdrop } from './section-backdrop'

export function Showcase() {
  return (
    <section className='relative overflow-hidden px-6 py-16 sm:px-10 lg:px-16 lg:py-24'>
      <SectionBackdrop variant='cool' />
      <div className='relative grid items-center gap-10 lg:grid-cols-2 lg:gap-16'>
        <Reveal>
          <span className='text-[13px] font-semibold tracking-[0.08em] text-[#6b6478] uppercase'>
            O loop socrático
          </span>
          <h2 className='type-h2 mt-4'>
            Você trava. Ele pergunta. Você pensa.
          </h2>
          <p className='type-body mt-5 max-w-[520px]'>
            Em vez de despejar a solução, o tutor devolve a pergunta certa no
            momento certo — te empurrando para o próximo passo sem entregar o
            destino.
          </p>
          <ul className='mt-6 space-y-3'>
            {[
              'Perguntas que miram o conceito, não a sintaxe',
              'Hints que escalam só quando você pede',
              'Cada ajuda registrada no seu score',
            ].map((t) => (
              <li key={t} className='flex items-start gap-3 type-body'>
                <span className='mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#1b1916] text-white'>
                  <Check className='size-3' strokeWidth={2.5} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <IdeMock />
        </Reveal>
      </div>

      {/* Row 2 — progress visual + text */}
      <div className='relative mt-16 grid items-center gap-10 lg:mt-24 lg:grid-cols-2 lg:gap-16'>
        <Reveal className='order-2 lg:order-1'>
          <ProgressMock />
        </Reveal>
        <Reveal delay={0.1} className='order-1 lg:order-2'>
          <span className='text-[13px] font-semibold tracking-[0.08em] text-[#6b6478] uppercase'>
            Independência medível
          </span>
          <h2 className='type-h2 mt-4'>
            O quanto você resolveu sozinho, em número.
          </h2>
          <p className='type-body mt-5 max-w-[520px]'>
            Cada desafio fecha com um score de independência. Pediu três hints?
            O número cai. Resolveu no seco? Ele sobe. Progresso que você não
            consegue terceirizar para a IA.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

type Msg = { from: 'user' | 'tutor'; text: React.ReactNode }

const CHAT: Msg[] = [
  { from: 'user', text: 'Como filtro só os produtos que vencem em 3 dias?' },
  {
    from: 'tutor',
    text: (
      <>
        Antes de codar — que estrutura de dados o{' '}
        <code className='font-mono text-iris'>findAll()</code> te devolve?
      </>
    ),
  },
  { from: 'user', text: 'um array de objetos' },
  { from: 'tutor', text: 'Exato. E qual método de array filtra por uma condição?' },
]

const CHAT_CYCLE_MS = 9000

function IdeMock() {
  const [tick, setTick] = React.useState(0)
  React.useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), CHAT_CYCLE_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <div className='shadow-soft overflow-hidden rounded-2xl border border-[#DFE5E9] bg-white'>
      <div className='flex items-center gap-2 border-b border-[#DFE5E9] bg-[#F7F9FA] px-4 py-3'>
        <span className='size-2.5 rounded-full bg-red-400/70' />
        <span className='size-2.5 rounded-full bg-amber-400/70' />
        <span className='size-2.5 rounded-full bg-emerald-400/70' />
        <span className='flex-1 text-center font-mono text-[11px] text-[#6b6478]'>
          api-padaria.ts
        </span>
      </div>
      <div key={tick} className='space-y-3 p-5 text-[13px]'>
        {CHAT.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3 + i * 1.05,
              duration: 0.35,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={cn(
              'flex',
              m.from === 'user' ? 'justify-end' : 'justify-start',
            )}
          >
            <div
              className={cn(
                'rounded-2xl px-3 py-2',
                m.from === 'user'
                  ? 'max-w-[80%] rounded-br-md bg-[#1b1916] text-white'
                  : 'max-w-[88%] rounded-bl-md border border-iris/20 bg-iris/5 text-[#2c2330]',
              )}
            >
              {m.text}
            </div>
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 + CHAT.length * 1.05, duration: 0.4 }}
          className='flex items-center gap-2 pt-1'
        >
          <div className='flex h-9 flex-1 items-center gap-1 rounded-xl border border-[#DFE5E9] bg-[#F7F9FA] px-3 text-[12px] text-[#6b6478]'>
            Pense, depois pergunte
            <span className='ml-0.5 inline-block h-3.5 w-[1.5px] animate-pulse bg-[#1b1916]/40' />
          </div>
          <div className='grid size-9 place-items-center rounded-xl bg-primary'>
            <ArrowRight className='size-3.5 text-white' />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function ProgressMock() {
  const bars = [
    { label: 'APIs', v: 82 },
    { label: 'Front-end', v: 64 },
    { label: 'Algoritmos', v: 48 },
    { label: 'Debugging', v: 71 },
  ]
  return (
    <div className='rounded-2xl border border-[#DFE5E9] bg-white p-6 shadow-soft sm:p-8'>
      <div className='flex items-end justify-between'>
        <div>
          <div className='text-sm text-[#6b6478]'>Score de independência</div>
          <div className='font-heading text-4xl font-light tracking-tight text-[#1b1916]'>
            73<span className='text-2xl text-[#6b6478]'>/100</span>
          </div>
        </div>
        <div className='rounded-full bg-[#dad8ea]/55 px-3 py-1 text-xs font-medium text-[#1b1916]'>
          ▲ 12 esta semana
        </div>
      </div>
      <div className='mt-6 space-y-4'>
        {bars.map((b, i) => (
          <div key={b.label}>
            <div className='mb-1.5 flex justify-between text-xs text-[#6b6478]'>
              <span>{b.label}</span>
              <span>{b.v}%</span>
            </div>
            <div className='h-2 overflow-hidden rounded-full bg-[#eef1f4]'>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${b.v}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: i * 0.1, ease: 'easeOut' }}
                className='h-full rounded-full bg-[#1b1916]'
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
