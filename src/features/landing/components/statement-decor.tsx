'use client'

import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'

export function StatementDecor() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const yLeft = useTransform(scrollYProgress, [0, 1], [-50, 70])
  const yRight = useTransform(scrollYProgress, [0, 1], [80, -60])
  const rotLeft = useTransform(scrollYProgress, [0, 1], [-8, -3])
  const rotRight = useTransform(scrollYProgress, [0, 1], [6, 2])

  return (
    <div ref={ref} aria-hidden className='pointer-events-none absolute inset-0'>
      {/* Top-left: tutor chat bubble (dark) */}
      <motion.div
        style={reduce ? undefined : { y: yLeft, rotate: rotLeft }}
        className='absolute top-[6%] left-[3%] hidden w-[220px] sm:block lg:left-[6%] lg:w-[260px]'
      >
        <motion.div
          animate={reduce ? undefined : { y: [0, -6, 0] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
          className='shadow-soft-lg rounded-2xl rounded-tl-md border border-white/10 bg-[#1b1916] p-3.5 text-left'
        >
          <div className='mb-1.5 flex items-center gap-2'>
            <span className='grid size-6 place-items-center rounded-full bg-gradient-to-br from-iris to-violet font-heading text-[11px] text-white'>
              Σ
            </span>
            <span className='font-mono text-[10px] tracking-wider text-white/50 uppercase'>
              Tutor socrático
            </span>
          </div>
          <p className='text-[12.5px] leading-snug text-white'>
            Antes de codar — que estrutura de dados o{' '}
            <code className='font-mono text-iris/90'>findAll()</code> te devolve?
          </p>
        </motion.div>
      </motion.div>

      {/* Bottom-right: independence + tests success badge (light) */}
      <motion.div
        style={reduce ? undefined : { y: yRight, rotate: rotRight }}
        className='absolute right-[3%] bottom-[8%] hidden w-[210px] sm:block lg:right-[6%] lg:w-[250px]'
      >
        <motion.div
          animate={reduce ? undefined : { y: [0, 5, 0] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
          className='shadow-soft-lg rounded-2xl border border-[#DFE5E9] bg-white p-3.5 text-left'
        >
          <div className='mb-2 flex items-center justify-between font-mono text-[10px] tracking-wider text-[#6b6478] uppercase'>
            <span>Sessão concluída</span>
            <span className='inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-emerald-700'>
              <svg
                viewBox='0 0 16 16'
                className='size-2.5'
                fill='none'
                stroke='currentColor'
                strokeWidth='2.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M3 8.5l3.5 3.5L13 5' />
              </svg>
              3/3
            </span>
          </div>
          <div className='font-heading text-2xl font-semibold tracking-tight text-[#1b1916]'>
            87%{' '}
            <span className='text-base font-normal text-[#6b6478]'>
              independente
            </span>
          </div>
          <div className='mt-1 flex items-center gap-1.5 text-[11px] text-[#6b6478]'>
            <span className='size-1.5 rounded-full bg-emerald-500' />
            2 hints · 14m
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
