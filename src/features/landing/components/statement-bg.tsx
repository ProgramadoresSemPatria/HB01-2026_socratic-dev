// Hand-drawn SVG that fills the Statement section background.
// Schematic / notebook feel: marginalia marks, circled words, dashed flows.
// To REMOVE: delete this file and the <StatementBg /> usage in statement.tsx.
'use client'

export function StatementBg() {
  return (
    <div className='pointer-events-none absolute inset-0 overflow-hidden'>
      {/* Warm base */}
      <div
        className='absolute inset-0'
        style={{
          background:
            'radial-gradient(95% 80% at 50% 0%, rgba(252,243,235,0.85) 0%, transparent 60%), radial-gradient(70% 70% at 90% 100%, rgba(220,215,253,0.5) 0%, transparent 65%), radial-gradient(60% 60% at 10% 100%, rgba(255,237,222,0.45) 0%, transparent 65%), #ffffff',
        }}
      />

      {/* Dotted graph paper */}
      <svg
        className='absolute inset-0 h-full w-full'
        aria-hidden
      >
        <defs>
          <pattern
            id='dotgrid'
            width='28'
            height='28'
            patternUnits='userSpaceOnUse'
          >
            <circle cx='14' cy='14' r='0.9' fill='#1b1916' opacity='0.07' />
          </pattern>
        </defs>
        <rect width='100%' height='100%' fill='url(#dotgrid)' />
      </svg>

      {/* Marginalia: scattered hand-drawn marks */}
      <svg
        className='absolute inset-0 h-full w-full'
        viewBox='0 0 1200 700'
        preserveAspectRatio='xMidYMid slice'
        aria-hidden
      >
        <g
          stroke='#6e56cf'
          strokeWidth='1.4'
          fill='none'
          strokeLinecap='round'
          opacity='0.32'
        >
          {/* Dashed circle top-right */}
          <circle
            cx='1050'
            cy='130'
            r='52'
            strokeDasharray='4 6'
          />
          {/* Small concentric circles bottom-left */}
          <circle cx='160' cy='560' r='22' />
          <circle cx='160' cy='560' r='38' strokeDasharray='3 5' />
          {/* Curly bracket left mid */}
          <path d='M 90 270 q -12 18 0 36 q -12 18 0 36 q -12 18 0 36 q -12 18 0 36' />
          {/* Curly bracket right mid */}
          <path d='M 1130 360 q 12 -18 0 -36 q 12 -18 0 -36 q 12 -18 0 -36 q 12 -18 0 -36' />
          {/* Dashed arrow from top-left to center */}
          <path
            d='M 200 110 C 320 160 440 200 540 290'
            strokeDasharray='5 7'
          />
          <path d='M 528 280 l 14 18 l 6 -22' fill='#6e56cf' />
          {/* Small underline near bottom-right */}
          <path d='M 920 520 q 40 -8 80 0' />
          <path d='M 920 530 q 40 -6 80 0' strokeDasharray='3 4' />
        </g>

        {/* Tiny accents */}
        <g fill='#6e56cf' opacity='0.45'>
          <circle cx='430' cy='130' r='2' />
          <circle cx='760' cy='240' r='2' />
          <circle cx='340' cy='430' r='2' />
          <circle cx='870' cy='400' r='2' />
          <circle cx='620' cy='560' r='2' />
        </g>

        {/* Hand-drawn "X" cross-out near top-left */}
        <g
          stroke='#e07a5f'
          strokeWidth='1.8'
          strokeLinecap='round'
          opacity='0.4'
        >
          <path d='M 280 230 l 28 26' />
          <path d='M 308 232 l -26 24' />
        </g>

        {/* Crossed-out word block (suggests "cola" being crossed out conceptually) */}
        <g opacity='0.16'>
          <rect x='720' y='600' width='130' height='14' rx='2' fill='#1b1916' />
        </g>
      </svg>
    </div>
  )
}
