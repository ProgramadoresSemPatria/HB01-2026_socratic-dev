'use client'

import { useT } from '@/lib/i18n'
import { Reveal } from './reveal'

const copy = {
  en: {
    eyebrow: 'The method',
    title: 'Built for devs who want to think, not copy.',
    body: 'An environment designed for productive struggle, not the easy shortcut.',
    features: [
      {
        num: '01',
        title: 'Zero ready-made answers',
        desc: 'The AI is forbidden from handing you the solution. By design. It answers questions with questions, and the answer stays yours.',
      },
      {
        num: '02',
        title: 'A real editor and canvas',
        desc: 'Full Monaco (the engine behind VS Code) for code and an Excalidraw canvas for system design. No fake input fields.',
      },
      {
        num: '03',
        title: 'Hints in three levels',
        desc: 'From a subtle nudge to a near-spoiler. Every bit of help is logged and weighs on your independence score.',
      },
      {
        num: '04',
        title: 'Real briefings',
        desc: 'Every challenge ships with a client, a scope, and constraints. Just like real work, not an algorithm drill.',
      },
      {
        num: '05',
        title: 'Socratic review',
        desc: "Submitted? The AI doesn't correct you. It interrogates your choices until you can defend every decision you made.",
      },
      {
        num: '06',
        title: 'Honest progress',
        desc: "An independence metric you can't outsource. The dashboard shows, with zero mercy, how much you solved on your own.",
      },
    ],
  },
  pt: {
    eyebrow: 'O método',
    title: 'Feito para quem quer pensar, não copiar.',
    body: 'Um ambiente desenhado para o esforço produtivo, não para o atalho fácil.',
    features: [
      {
        num: '01',
        title: 'Zero respostas prontas',
        desc: 'A IA é proibida de entregar a solução. Por design. Ela responde pergunta com pergunta, e a resposta continua sendo sua.',
      },
      {
        num: '02',
        title: 'Editor e canvas reais',
        desc: 'Monaco completo (o motor do VS Code) para código e um canvas Excalidraw para design system. Nada de campo fake.',
      },
      {
        num: '03',
        title: 'Hints em três níveis',
        desc: 'Do empurrão sutil ao quase-spoiler. Toda ajuda fica registrada e pesa no seu score de independência.',
      },
      {
        num: '04',
        title: 'Briefings reais',
        desc: 'Cada desafio chega com cliente, escopo e restrições, como no trabalho de verdade, não como exercício de algoritmo.',
      },
      {
        num: '05',
        title: 'Review socrático',
        desc: 'Submeteu? A IA não corrige. Ela interroga suas escolhas até você defender cada decisão que tomou.',
      },
      {
        num: '06',
        title: 'Progresso honesto',
        desc: 'Métrica de independência que você não terceiriza. O dashboard mostra, sem piedade, o quanto você resolveu sozinho.',
      },
    ],
  },
}

export function Features() {
  const t = useT(copy)

  return (
    <section id='recursos' className='px-6 py-14 sm:px-10 lg:px-16 lg:py-20'>
      <div className='max-w-[720px]'>
        <Reveal>
          <p className='eyebrow'>{t.eyebrow}</p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className='type-h2 mt-4'>{t.title}</h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className='type-body mt-5 max-w-[560px]'>{t.body}</p>
        </Reveal>
      </div>

      <div className='mt-12 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3'>
        {t.features.map((f, i) => (
          <Reveal key={f.num} delay={(i % 3) * 0.08}>
            <div className='border-border flex flex-col gap-3 border-t pt-6'>
              <p className='eyebrow'>{f.num}</p>
              <h3 className='type-h4'>{f.title}</h3>
              <p className='text-muted-foreground text-sm leading-relaxed tracking-[-0.18px]'>
                {f.desc}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
