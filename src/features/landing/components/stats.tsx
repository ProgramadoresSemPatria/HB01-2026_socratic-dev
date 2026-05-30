import { AnimatedCount } from './anim/animated-count'
import { Reveal } from './reveal'

const stats: { value: string; label: string; reverse?: boolean }[] = [
  { value: '0', label: 'respostas entregues de graça', reverse: true },
  { value: '3', label: 'níveis de hint graduais' },
  { value: '100%', label: 'do raciocínio continua seu' },
  { value: '2.400', label: 'anos de método comprovado' },
]

export function Stats() {
  return (
    <section className='bg-[#fafbfc] px-6 py-14 sm:px-10 lg:px-16 lg:py-16'>
      <div className='grid grid-cols-2 gap-y-10 lg:grid-cols-4'>
        {stats.map((s, i) => (
          <Reveal
            key={s.label}
            delay={i * 0.08}
            className='border-l border-[#DFE5E9] px-5 first:border-l-0 lg:px-8'
          >
            <AnimatedCount
              value={s.value}
              reverse={s.reverse}
              className='font-heading text-4xl font-light tracking-tight text-[#1b1916] tabular-nums sm:text-5xl'
            />
            <div className='mt-2 max-w-[180px] text-sm leading-snug text-[#6b6478]'>
              {s.label}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
