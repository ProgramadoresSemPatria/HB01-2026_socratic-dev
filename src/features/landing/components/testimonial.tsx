'use client'

import { useT } from '@/lib/i18n'
import { Reveal } from './reveal'

const copy = {
  en: {
    quote:
      '“I know that I know nothing. And that is exactly what will make you a real developer: the courage to think before you ask.”',
    name: 'Socrates',
    role: 'Philosopher · Athens, 470 BC',
    footnote: 'the method that survived 2,400 years of shortcuts',
  },
  pt: {
    quote:
      '“Eu sei que nada sei. E é exatamente isso que vai te tornar um dev de verdade: a coragem de pensar antes de perguntar.”',
    name: 'Sócrates',
    role: 'Filósofo · Atenas, 470 a.C.',
    footnote: 'o método que sobreviveu a 2.400 anos de atalhos',
  },
}

export function Testimonial() {
  const t = useT(copy)

  return (
    <section id='manifesto' className='p-3 md:p-6'>
      <Reveal>
        <figure className='bg-ink dark:border-border dark:bg-card rounded-lg px-6 py-12 lg:px-[60px] lg:py-[64px] dark:border'>
          <blockquote className='type-quote text-background! dark:text-foreground! mb-10 max-w-[820px] lg:mb-14'>
            {t.quote}
          </blockquote>
          <figcaption className='flex flex-col gap-6 md:flex-row md:items-center md:justify-between'>
            <div className='flex items-center gap-4'>
              <span className='bg-lime text-ink dark:text-background font-heading grid size-[64px] shrink-0 place-items-center rounded-full text-2xl font-light lg:size-[80px]'>
                Σ
              </span>
              <div>
                <p className='text-background dark:text-foreground text-xl font-normal tracking-[-0.56px] lg:text-[28px]'>
                  {t.name}
                </p>
                <p className='text-background/50 dark:text-foreground/50 mt-1 font-mono text-xs tracking-wide'>
                  {t.role}
                </p>
              </div>
            </div>
            <div className='text-background/50 dark:text-foreground/50 font-mono text-xs tracking-wide'>
              {t.footnote}
            </div>
          </figcaption>
        </figure>
      </Reveal>
    </section>
  )
}
