'use client'

import { useT } from '@/lib/i18n'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Halftone, glyph, paintArchitecture } from './halftone'
import { Reveal } from './reveal'

const paintCode = glyph('>_', 1.5)

const copy = {
  en: {
    eyebrow: 'Two modes',
    h2: 'Train what the market demands.',
    h2Accent: 'Thinking.',
    sub: 'Code or system design — same Socratic principle: the AI never hands it to you, it gets you there.',
    modes: [
      {
        tag: null as string | null,
        fill: 'bg-pastel-mist',
        paint: paintCode,
        title: 'Code challenges',
        desc: 'A real Monaco editor, hidden tests, and a tutor that answers questions with questions. Solve it like you would at work — no cheating.',
        cta: 'Solve code',
        points: [
          'JavaScript & TypeScript',
          'From beginner to big tech level',
          'Runs the tests on the spot',
        ],
      },
      {
        tag: 'New' as string | null,
        fill: 'bg-pastel-lavender',
        paint: paintArchitecture,
        title: 'System design challenges',
        desc: 'Sketch the architecture on a canvas — services, databases, queues, and how the data flows. The AI sees your diagram and interrogates every decision.',
        cta: 'Design architecture',
        points: [
          'Built-in Excalidraw canvas',
          'Vision AI reads your architecture',
          'Data distribution, scale, and trade-offs',
        ],
      },
    ],
  },
  pt: {
    eyebrow: 'Dois modos',
    h2: 'Treine o que o mercado cobra.',
    h2Accent: 'Pensando.',
    sub: 'Código ou system design (arquitetura) — o mesmo princípio socrático: a IA nunca entrega pronto, ela te leva até lá.',
    modes: [
      {
        tag: null as string | null,
        fill: 'bg-pastel-mist',
        paint: paintCode,
        title: 'Desafios de código',
        desc: 'Editor Monaco de verdade, testes escondidos e um tutor que responde pergunta com pergunta. Resolva como no trabalho — sem cola.',
        cta: 'Resolver código',
        points: [
          'JavaScript & TypeScript',
          'Do iniciante ao nível big tech',
          'Roda os testes na hora',
        ],
      },
      {
        tag: 'Novo' as string | null,
        fill: 'bg-pastel-lavender',
        paint: paintArchitecture,
        title: 'Desafios de system design',
        desc: 'Desenhe a arquitetura num canvas — serviços, bancos, filas e o fluxo dos dados. A IA enxerga seu diagrama e interroga cada decisão.',
        cta: 'Desenhar arquitetura',
        points: [
          'Canvas Excalidraw integrado',
          'IA com visão analisa a arquitetura',
          'Distribuição de dados, escala e trade-offs',
        ],
      },
    ],
  },
}

export function Modes() {
  const t = useT(copy)
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <section className='relative overflow-hidden px-6 py-14 sm:px-10 lg:px-16 lg:py-20'>
      <div className='relative mx-auto max-w-[860px] text-center'>
        <Reveal>
          <p className='eyebrow'>{t.eyebrow}</p>
          <h2 className='type-h2 mt-4'>
            {t.h2}{' '}
            <span className='text-gradient-iris font-serif font-normal italic'>
              {t.h2Accent}
            </span>
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className='type-body mx-auto mt-5 max-w-[600px]'>{t.sub}</p>
        </Reveal>
      </div>

      <div className='relative mx-auto mt-10 grid max-w-[980px] gap-4 lg:mt-12 lg:grid-cols-2'>
        {t.modes.map((m, i) => (
          <Reveal key={m.title} delay={i * 0.1} className='h-full'>
            <Link
              href='/onboarding'
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className={`group/cta hover:shadow-soft-lg relative flex h-full flex-col overflow-hidden rounded-lg transition-all duration-300 ease-out hover:-translate-y-[2px] ${m.fill}`}
            >
              {m.tag && (
                <span className='bg-lime text-ink absolute top-5 right-5 z-10 rounded-full px-2.5 py-1 font-mono text-[10px] tracking-wider uppercase'>
                  {m.tag}
                </span>
              )}
              <div
                className={`pointer-events-none relative mx-5 mt-5 h-[150px] mix-blend-multiply transition-opacity duration-500 ${hovered === i ? 'opacity-80' : 'opacity-30'}`}
              >
                <Halftone
                  draw={m.paint}
                  active={hovered === i}
                  ambient
                  interactive
                  spacing={8}
                  flow={12}
                  className='absolute inset-0'
                />
              </div>
              <div className='flex flex-1 flex-col p-6 pt-4 sm:p-7 sm:pt-4'>
                <h3 className='type-h3 text-2xl lg:text-[28px]'>{m.title}</h3>
                <p className='type-body mt-3'>{m.desc}</p>
                <ul className='mt-5 space-y-2'>
                  {m.points.map((p) => (
                    <li
                      key={p}
                      className='text-aubergine flex items-center gap-2.5 text-sm'
                    >
                      <span className='bg-primary size-1.5 shrink-0 rounded-full' />
                      {p}
                    </li>
                  ))}
                </ul>
                <span className='text-ink mt-6 inline-flex items-center gap-1.5 text-[15px] font-medium'>
                  <span className='link-underline'>{m.cta}</span>
                  <ArrowRight className='size-4 transition-transform group-hover/cta:translate-x-0.5' />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
