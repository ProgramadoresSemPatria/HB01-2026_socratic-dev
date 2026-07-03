'use client'

import { useT } from '@/lib/i18n'
import { Reveal } from './reveal'
import { StatementCanvas } from './statement-canvas'

const copy = {
  en: {
    h2: 'Learning to code became copy and paste.',
    h2Muted: 'The reasoning got left behind.',
    body: "Copilot and ChatGPT hand you the answer before you've even framed the question. You get through the tasks but internalize nothing, and the first blank screen stops you cold. The most powerful tool in computing history is teaching a generation not to think.",
  },
  pt: {
    h2: 'Aprender a programar virou copiar e colar.',
    h2Muted: 'O raciocínio ficou pelo caminho.',
    body: 'Copilot e ChatGPT entregam a resposta antes de você formular a pergunta. Você avança nas tarefas, mas não internaliza nada, e na primeira tela em branco, trava. A ferramenta mais poderosa da história da computação está ensinando uma geração a não pensar.',
  },
}

export function Statement() {
  const t = useT(copy)
  return (
    <section
      id='problema'
      className='px-6 py-14 text-center sm:px-10 sm:py-16 lg:py-20'
    >
      <div className='mx-auto flex max-w-[760px] flex-col items-center gap-5'>
        <Reveal>
          <h2 className='type-h2 text-pretty'>
            {t.h2}{' '}
            <span className='text-muted-foreground'>{t.h2Muted}</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className='type-body max-w-[640px]'>{t.body}</p>
        </Reveal>
      </div>
      <Reveal delay={0.2}>
        <StatementCanvas />
      </Reveal>
    </section>
  )
}
