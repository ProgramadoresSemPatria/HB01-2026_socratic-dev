'use client'

import { useT } from '@/lib/i18n'
import { StepTrail } from './anim/step-trail'
import { Reveal } from './reveal'

const copy = {
  en: {
    eyebrow: 'How it works',
    h2: 'Socrates, but with a code editor.',
    steps: [
      {
        n: '01',
        title: 'A realistic challenge',
        desc: 'The AI generates a fictional client briefing: scope, constraints, and pain points. You start from the problem, not the syntax.',
      },
      {
        n: '02',
        title: 'Questions, not answers',
        desc: 'Stuck? The tutor asks "what structure solves this?". You answer, it digs deeper. The reasoning stays yours.',
      },
      {
        n: '03',
        title: 'Gradual hints',
        desc: 'Three hint levels, from vague to almost-there. You choose how much help you want, and pay for it in points.',
      },
      {
        n: '04',
        title: 'Socratic review',
        desc: "At the end, the AI doesn't correct you: it interrogates your choices until you understand the why behind every line.",
      },
    ],
  },
  pt: {
    eyebrow: 'Como funciona',
    h2: 'Sócrates, mas com uma tela de código.',
    steps: [
      {
        n: '01',
        title: 'Desafio realista',
        desc: 'A IA gera um briefing de cliente fictício: escopo, restrições e dor. Você começa pelo problema, não pela sintaxe.',
      },
      {
        n: '02',
        title: 'Perguntas, não respostas',
        desc: 'Travou? O tutor pergunta “que estrutura resolve isso?”. Você responde, ele aprofunda. O raciocínio é seu.',
      },
      {
        n: '03',
        title: 'Hints graduais',
        desc: 'Três níveis de pista, do vago ao quase-direto. Você escolhe quanta ajuda quer, e paga em pontos.',
      },
      {
        n: '04',
        title: 'Review socrático',
        desc: 'No fim, a IA não corrige: ela interroga suas escolhas até você entender o porquê de cada linha.',
      },
    ],
  },
}

export function HowItWorks() {
  const t = useT(copy)
  return (
    <section
      id='metodo'
      className='relative overflow-hidden px-6 py-14 sm:px-10 lg:px-16 lg:py-20'
      style={{
        background:
          'radial-gradient(80% 60% at 50% 100%, color-mix(in srgb, var(--pastel-lavender) 30%, transparent) 0%, transparent 70%), var(--card)',
      }}
    >
      <div className='mx-auto max-w-[860px] text-center'>
        <Reveal>
          <p className='eyebrow'>{t.eyebrow}</p>
          <h2 className='type-h2 mt-4'>{t.h2}</h2>
        </Reveal>
      </div>

      <div className='relative mt-12 grid gap-y-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-8'>
        <StepTrail />
        {t.steps.map((s, i) => (
          <Reveal key={s.n} delay={(i % 4) * 0.08} className='relative'>
            <div className='font-heading text-5xl font-light tracking-tight text-pastel-lavender'>
              {s.n}
            </div>
            <h3 className='type-h3 mt-3 text-2xl lg:text-[26px]'>{s.title}</h3>
            <p className='type-body mt-2.5 max-w-[320px]'>{s.desc}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
