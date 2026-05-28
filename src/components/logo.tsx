import { cn } from '@/lib/utils'
import Link from 'next/link'

interface LogoProps {
  className?: string
  asLink?: boolean
  showText?: boolean
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'grid size-8 shrink-0 place-items-center rounded-xl bg-[#dad8ea]/55 text-[#1b1916]',
        className,
      )}
      aria-hidden
    >
      <svg
        viewBox='0 0 24 24'
        className='size-5'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.75'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8' />
        <path d='M21 3v5h-5' />
        <circle cx='12' cy='12' r='1.6' fill='currentColor' stroke='none' />
      </svg>
    </div>
  )
}

export function Logo({ className, asLink = true, showText = true }: LogoProps) {
  const content = (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark />
      {showText && (
        <span className='font-heading text-[17px] font-medium tracking-tight text-[#1b1916]'>
          socratic
          <span className='text-gradient font-serif font-normal italic'>
            .dev
          </span>
        </span>
      )}
    </div>
  )
  if (asLink) {
    return (
      <Link href='/' className='group'>
        {content}
      </Link>
    )
  }
  return content
}
