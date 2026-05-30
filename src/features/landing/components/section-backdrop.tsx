// Per-section subtle backdrop. Each variant gives a section its own colour
// + decorative SVG so the page has rhythm instead of looking like white doc.
// To REMOVE in one section: delete the <SectionBackdrop ... /> import.
'use client'

type Variant = 'warm' | 'cool' | 'paper' | 'mist'

const BG: Record<Variant, string> = {
  warm:
    'radial-gradient(80% 60% at 10% 0%, rgba(252,243,235,0.7) 0%, transparent 60%), radial-gradient(60% 50% at 90% 100%, rgba(255,230,210,0.45) 0%, transparent 65%), #ffffff',
  cool:
    'radial-gradient(70% 50% at 90% 0%, rgba(220,215,253,0.55) 0%, transparent 65%), radial-gradient(60% 50% at 10% 100%, rgba(207,222,250,0.4) 0%, transparent 70%), #ffffff',
  paper:
    'linear-gradient(180deg, #fbfbfd 0%, #ffffff 60%), radial-gradient(60% 40% at 50% 0%, rgba(218,216,234,0.35) 0%, transparent 70%)',
  mist:
    'radial-gradient(90% 70% at 50% 100%, rgba(232,248,238,0.5) 0%, transparent 60%), #ffffff',
}

export function SectionBackdrop({ variant }: { variant: Variant }) {
  return (
    <div className='pointer-events-none absolute inset-0 overflow-hidden'>
      <div className='absolute inset-0' style={{ background: BG[variant] }} />
      <Accents variant={variant} />
    </div>
  )
}

function Accents({ variant }: { variant: Variant }) {
  if (variant === 'warm') {
    return (
      <svg
        viewBox='0 0 1200 600'
        preserveAspectRatio='xMidYMid slice'
        className='absolute inset-0 h-full w-full'
        aria-hidden
      >
        <g
          stroke='#e07a5f'
          strokeWidth='1.4'
          fill='none'
          strokeLinecap='round'
          opacity='0.35'
        >
          <circle cx='1080' cy='110' r='38' strokeDasharray='3 5' />
          <path d='M 90 470 q 30 -8 60 0' strokeDasharray='3 4' />
          <path d='M 90 488 q 30 -6 60 0' />
        </g>
        <g fill='#e07a5f' opacity='0.5'>
          <circle cx='320' cy='90' r='2' />
          <circle cx='950' cy='480' r='2' />
        </g>
      </svg>
    )
  }
  if (variant === 'cool') {
    return (
      <svg
        viewBox='0 0 1200 600'
        preserveAspectRatio='xMidYMid slice'
        className='absolute inset-0 h-full w-full'
        aria-hidden
      >
        <g
          stroke='#6e56cf'
          strokeWidth='1.4'
          fill='none'
          strokeLinecap='round'
          opacity='0.3'
        >
          <circle cx='130' cy='130' r='32' strokeDasharray='4 6' />
          <path d='M 1040 460 C 1080 480 1110 470 1140 450' />
          <path d='M 1140 450 l -10 -4' />
          <path d='M 1140 450 l -4 -10' />
        </g>
        <g fill='#6e56cf' opacity='0.4'>
          <circle cx='1080' cy='100' r='2' />
          <circle cx='240' cy='480' r='2' />
        </g>
      </svg>
    )
  }
  if (variant === 'paper') {
    return (
      <svg
        className='absolute inset-0 h-full w-full opacity-60'
        aria-hidden
      >
        <defs>
          <pattern id='paper-dots' width='26' height='26' patternUnits='userSpaceOnUse'>
            <circle cx='13' cy='13' r='0.8' fill='#1b1916' opacity='0.08' />
          </pattern>
        </defs>
        <rect width='100%' height='100%' fill='url(#paper-dots)' />
      </svg>
    )
  }
  return null
}
