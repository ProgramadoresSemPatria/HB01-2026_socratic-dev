// Hand-drawn SVG (Excalidraw-style) inside the Statement section.
// Shows "ATALHO" (copy-paste) vs "RETIDO" (socratic) as two diagram rows.
// To REMOVE: delete this file and the <StatementCanvas /> in statement.tsx.
'use client'

import { motion, useReducedMotion } from 'motion/react'

export function StatementCanvas() {
  const reduce = useReducedMotion()

  return (
    <div className='mx-auto mt-12 w-full max-w-[920px] px-2 sm:mt-16'>
      <div className='shadow-soft relative overflow-hidden rounded-2xl border border-[#DFE5E9] bg-white p-4 sm:p-6'>
        <div className='absolute top-3 right-4 font-mono text-[10px] tracking-wider text-[#6b6478] uppercase'>
          rascunho · canvas
        </div>
        <svg
          viewBox='0 0 920 380'
          className='block h-auto w-full'
          aria-hidden
        >
          <defs>
            <marker
              id='arrowhead'
              markerWidth='10'
              markerHeight='10'
              refX='8'
              refY='5'
              orient='auto'
            >
              <path d='M 0 0 L 9 5 L 0 10 z' fill='#1b1916' />
            </marker>
            <marker
              id='arrowhead-red'
              markerWidth='10'
              markerHeight='10'
              refX='8'
              refY='5'
              orient='auto'
            >
              <path d='M 0 0 L 9 5 L 0 10 z' fill='#c0392b' />
            </marker>
            <marker
              id='arrowhead-green'
              markerWidth='10'
              markerHeight='10'
              refX='8'
              refY='5'
              orient='auto'
            >
              <path d='M 0 0 L 9 5 L 0 10 z' fill='#16a34a' />
            </marker>
          </defs>

          {/* Row label — ATALHO */}
          <g>
            <text
              x='20'
              y='75'
              fontFamily='ui-monospace, monospace'
              fontSize='11'
              letterSpacing='1.5'
              fill='#c0392b'
            >
              ATALHO
            </text>
            <path
              d='M 18 84 q 38 -2 78 0'
              stroke='#c0392b'
              strokeWidth='1.2'
              fill='none'
              strokeLinecap='round'
            />
          </g>

          {/* ATALHO boxes */}
          <SketchBox x={120} y={48} w={150} h={66} label='🤔  pergunta' bg='#fdf3ee' />
          <SketchArrow d='M 274 82 q 14 -8 28 0' color='#1b1916' />
          <SketchBox x={310} y={48} w={150} h={66} label='🤖  cola da IA' bg='#fff1e6' />
          <SketchArrow d='M 464 82 q 14 8 28 0' color='#1b1916' />
          <SketchBox x={500} y={48} w={150} h={66} label='✓  código pronto' bg='#e8f8ee' />
          <SketchArrow d='M 654 82 q 14 -8 28 0' color='#c0392b' marker='red' />
          <SketchBox x={690} y={48} w={170} h={66} label='💤  zero retido' bg='#fef2f2' border='#c0392b' />

          {/* Big red X across atalho row */}
          <g stroke='#c0392b' strokeWidth='2.4' strokeLinecap='round' opacity='0.55'>
            <path d='M 130 60 L 850 105' />
            <path d='M 850 60 L 130 105' />
          </g>

          {/* Divider scribble */}
          <path
            d='M 60 175 q 200 -8 400 0 t 400 0'
            stroke='#dad8ea'
            strokeWidth='1.5'
            fill='none'
            strokeDasharray='5 8'
            strokeLinecap='round'
          />

          {/* Row label — RETIDO */}
          <g>
            <text
              x='20'
              y='245'
              fontFamily='ui-monospace, monospace'
              fontSize='11'
              letterSpacing='1.5'
              fill='#16a34a'
            >
              RETIDO
            </text>
            <path
              d='M 18 254 q 38 -2 78 0'
              stroke='#16a34a'
              strokeWidth='1.2'
              fill='none'
              strokeLinecap='round'
            />
          </g>

          {/* RETIDO boxes */}
          <SketchBox x={120} y={218} w={150} h={66} label='🤔  pergunta' bg='#fdf3ee' />
          <SketchArrow d='M 274 252 q 14 -8 28 0' color='#1b1916' />
          <SketchBox x={310} y={218} w={150} h={66} label='❓  que estrutura?' bg='#f1f0fb' />
          <SketchArrow d='M 464 252 q 14 8 28 0' color='#1b1916' />
          <SketchBox x={500} y={218} w={150} h={66} label='❓  por quê?' bg='#f1f0fb' />
          <SketchArrow d='M 654 252 q 14 -8 28 0' color='#16a34a' marker='green' />
          <SketchBox x={690} y={218} w={170} h={66} label='💡  entendi' bg='#e8f8ee' border='#16a34a' />

          {/* Hand-drawn check across retido row */}
          <motion.path
            d='M 130 312 l 80 26 l 350 -38 l 290 -18'
            stroke='#16a34a'
            strokeWidth='2'
            fill='none'
            strokeLinecap='round'
            opacity='0.4'
            initial={reduce ? false : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, margin: '0px 0px -80px 0px' }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Scribbled annotation */}
          <g
            fontFamily='ui-monospace, monospace'
            fontSize='11'
            fill='#6b6478'
          >
            <text x='720' y='148' opacity='0.7'>
              1 dia depois
            </text>
            <path
              d='M 718 152 q -10 4 -28 4'
              stroke='#6b6478'
              strokeWidth='0.8'
              fill='none'
              strokeLinecap='round'
              opacity='0.55'
            />

            <text x='370' y='335' opacity='0.7'>
              o tutor pergunta, você pensa
            </text>
          </g>
        </svg>
      </div>
    </div>
  )
}

function SketchBox({
  x,
  y,
  w,
  h,
  label,
  bg,
  border = '#1b1916',
}: {
  x: number
  y: number
  w: number
  h: number
  label: string
  bg: string
  border?: string
}) {
  // Slightly wavy rectangle path for that hand-drawn feel.
  const d = `M ${x + 3} ${y + 2}
    q ${(w - 6) / 2} -2 ${w - 6} 0
    q 2 ${(h - 4) / 2} 0 ${h - 4}
    q ${-(w - 6) / 2} 2 ${-(w - 6)} 0
    q -2 ${-(h - 4) / 2} 0 ${-(h - 4)}
    z`
  return (
    <g>
      <path d={d} fill={bg} stroke={border} strokeWidth='1.4' strokeLinejoin='round' />
      <text
        x={x + w / 2}
        y={y + h / 2 + 4}
        fontFamily="'Caveat', 'Comic Sans MS', cursive"
        fontSize='17'
        textAnchor='middle'
        fill='#1b1916'
      >
        {label}
      </text>
    </g>
  )
}

function SketchArrow({
  d,
  color,
  marker = 'black',
}: {
  d: string
  color: string
  marker?: 'black' | 'red' | 'green'
}) {
  return (
    <path
      d={d}
      fill='none'
      stroke={color}
      strokeWidth='1.6'
      strokeLinecap='round'
      markerEnd={`url(#arrowhead${marker === 'black' ? '' : '-' + marker})`}
    />
  )
}
