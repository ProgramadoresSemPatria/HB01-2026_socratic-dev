'use client'

import { Navbar } from '@/components/navbar'
import { Skeleton } from '@/components/ui/skeleton'
import { LEVEL_LABEL, type Challenge } from '@/lib/challenge'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { ArrowRight, Code2, Network } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'
import * as React from 'react'

type Filter = 'all' | 'code' | 'design'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'code', label: 'Código' },
  { id: 'design', label: 'System Design' },
]

function stackLabel(c: Challenge): string {
  if (c.kind === 'design') return 'System Design'
  if (c.stack === 'javascript') return 'JavaScript'
  return 'TypeScript'
}

export default function ChallengesLibraryPage() {
  const [challenges, setChallenges] = React.useState<Challenge[] | null>(null)
  const [filter, setFilter] = React.useState<Filter>('all')

  React.useEffect(() => {
    let active = true
    ;(async () => {
      const { data } = await supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false })
      if (active) setChallenges((data as unknown as Challenge[]) ?? [])
    })()
    return () => {
      active = false
    }
  }, [])

  const visible = (challenges ?? []).filter((c) =>
    filter === 'all' ? true : c.kind === filter,
  )

  return (
    <div className='relative flex min-h-screen flex-1 flex-col bg-white'>
      <Navbar />

      <main className='flex-1 pt-[88px] pb-20 md:pt-24'>
        <div className='container-main max-w-6xl'>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className='mb-2 font-mono text-[11px] tracking-[0.08em] text-[#6b6478] uppercase'>
              Biblioteca
            </div>
            <h1 className='type-h2'>
              Todos os desafios.{' '}
              <span className='text-gradient font-serif font-normal italic'>
                Reaproveitados.
              </span>
            </h1>
            <p className='type-body mt-3 max-w-[560px]'>
              Cada desafio que a IA cria entra aqui e vira pool pra todo mundo —
              menos espera, menos custo.{' '}
              {challenges && (
                <span className='font-medium text-[#1b1916]'>
                  {challenges.length}{' '}
                  {challenges.length === 1 ? 'desafio' : 'desafios'}.
                </span>
              )}
            </p>
          </motion.div>

          <div className='mt-8 flex flex-wrap gap-2'>
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type='button'
                onClick={() => setFilter(f.id)}
                className={cn(
                  'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                  filter === f.id
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-[#DFE5E9] text-[#6b6478] hover:bg-[#F7F9FA]',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className='mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {!challenges ? (
              [0, 1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className='h-44 rounded-2xl' />
              ))
            ) : visible.length === 0 ? (
              <p className='col-span-full text-sm text-[#6b6478]'>
                Nenhum desafio nesse filtro ainda.
              </p>
            ) : (
              visible.map((c, i) => {
                const isDesign = c.kind === 'design'
                const href = `${isDesign ? '/design' : '/challenge'}?id=${c.id}`
                const Icon = isDesign ? Network : Code2
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i, 8) * 0.04, duration: 0.4 }}
                  >
                    <Link
                      href={href}
                      className='shadow-soft hover:shadow-soft-lg group flex h-full flex-col rounded-2xl border border-[#DFE5E9] bg-white p-5 transition-shadow'
                    >
                      <div className='mb-3 flex items-center gap-2'>
                        <div className='grid size-9 place-items-center rounded-xl bg-[#dad8ea]/55 text-[#1b1916]'>
                          <Icon className='size-4.5' strokeWidth={1.5} />
                        </div>
                        <span className='rounded-full border border-[#DFE5E9] bg-white px-2 py-0.5 font-mono text-[10px] tracking-wider text-[#6b6478] uppercase'>
                          {stackLabel(c)}
                        </span>
                        <span className='rounded-full border border-[#DFE5E9] bg-white px-2 py-0.5 font-mono text-[10px] tracking-wider text-[#6b6478] uppercase'>
                          {LEVEL_LABEL[c.level] ?? c.level}
                        </span>
                      </div>
                      <h3 className='font-heading text-lg font-medium tracking-tight text-[#1b1916]'>
                        {c.title}
                      </h3>
                      <p className='mt-1.5 line-clamp-2 text-sm text-[#6b6478]'>
                        {c.description}
                      </p>
                      <span className='mt-auto inline-flex items-center gap-1 pt-4 text-[14px] font-medium text-iris'>
                        Abrir
                        <ArrowRight className='size-4 transition-transform group-hover:translate-x-0.5' />
                      </span>
                    </Link>
                  </motion.div>
                )
              })
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
