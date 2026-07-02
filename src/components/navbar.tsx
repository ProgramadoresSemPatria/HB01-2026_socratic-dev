'use client'

import { useUser } from '@/features/auth/hooks/use-user'
import { buyHints, getHintBalance } from '@/features/hints/actions'
import { useLocale, useT } from '@/lib/i18n'
import { getAccessToken } from '@/lib/api/client'
import { cn } from '@/lib/utils'
import { Lightbulb, Plus } from 'lucide-react'
import { motion, useMotionValueEvent, useScroll } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import * as React from 'react'
import { Logo } from './logo'
import { Button } from './ui/button'

const copy = {
  en: {
    library: 'Library',
    how: 'How it works',
    dashboard: 'Dashboard',
    signIn: 'Sign in',
    cta: 'Start a challenge',
    profile: 'Your profile',
    avatar: 'Your avatar',
    hintsAvailable: 'Available hints — 35 free per week, resets Sunday 23:59',
    buyHints: 'Buy +10 hints',
  },
  pt: {
    library: 'Biblioteca',
    how: 'Como funciona',
    dashboard: 'Dashboard',
    signIn: 'Entrar',
    cta: 'Comece um desafio',
    profile: 'Seu perfil',
    avatar: 'Seu avatar',
    hintsAvailable: 'Hints disponíveis — 35 grátis por semana, reseta domingo 23:59',
    buyHints: 'Comprar +10 hints',
  },
} as const

function HintsChip() {
  const t = useT(copy)
  const [remaining, setRemaining] = React.useState<number | null>(null)
  const [buying, setBuying] = React.useState(false)

  const refresh = React.useCallback(() => {
    getAccessToken()
      .then((tk) => getHintBalance(tk))
      .then((b) => setRemaining(b.remaining))
      .catch(() => {})
  }, [])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  async function buy() {
    if (buying) return
    setBuying(true)
    try {
      await buyHints(await getAccessToken())
      refresh()
    } finally {
      setBuying(false)
    }
  }

  if (remaining === null) return null
  return (
    <div className='border-border bg-background hidden h-9 items-center gap-1.5 rounded-full border py-0 pr-1 pl-3 sm:inline-flex'>
      <Lightbulb className='text-primary size-3.5' strokeWidth={1.5} />
      <span
        title={t.hintsAvailable}
        className={cn(
          'font-mono text-[12px]',
          remaining <= 0 ? 'text-destructive' : 'text-muted-foreground',
        )}
      >
        {remaining}
      </span>
      <button
        type='button'
        onClick={buy}
        disabled={buying}
        title={t.buyHints}
        className='text-primary hover:bg-primary/10 ml-0.5 grid size-6 cursor-pointer place-items-center rounded-full transition-colors duration-200 disabled:opacity-50'
      >
        <Plus className='size-3.5' strokeWidth={1.5} />
      </button>
    </div>
  )
}

function LangToggle() {
  const { locale, setLocale } = useLocale()
  return (
    <div className='border-border bg-background hidden h-9 items-center rounded-full border p-1 font-mono text-[11px] sm:flex'>
      {(['en', 'pt'] as const).map((l) => (
        <button
          key={l}
          type='button'
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={cn(
            'cursor-pointer rounded-full px-2.5 py-1 uppercase transition-colors duration-200',
            locale === l
              ? 'bg-ink text-background'
              : 'text-muted-foreground hover:text-ink',
          )}
        >
          {l}
        </button>
      ))}
    </div>
  )
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className='text-muted-foreground hover:text-ink hidden px-3 py-2 text-sm font-medium transition-colors duration-200 md:inline-flex'
    >
      <span className='link-underline'>{label}</span>
    </Link>
  )
}

export function Navbar() {
  const t = useT(copy)
  const [scrolled, setScrolled] = React.useState(false)
  const { scrollY } = useScroll()
  const { user, loading } = useUser()

  useMotionValueEvent(scrollY, 'change', (v) => {
    setScrolled(v > 12)
  })

  return (
    <motion.header
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300',
        scrolled
          ? 'border-border bg-background/90 backdrop-blur'
          : 'border-transparent bg-transparent',
      )}
    >
      <div className='container-main flex h-[72px] items-center justify-between'>
        <div className='flex items-center gap-6'>
          <Logo size='lg' />
          <nav className='hidden items-center gap-1 md:flex'>
            <NavLink href='/challenges' label={t.library} />
            <NavLink href='/#metodo' label={t.how} />
          </nav>
        </div>

        <div className='flex items-center gap-2'>
          <LangToggle />
          {!loading && user ? (
            <>
              <NavLink href='/dashboard' label={t.dashboard} />
              <HintsChip />
              <Link
                href='/profile'
                aria-label={t.profile}
                title={user.email ?? t.profile}
                className='border-border grid size-9 shrink-0 overflow-hidden rounded-full border transition-transform duration-200 hover:scale-105'
              >
                {(user.user_metadata as { avatar_url?: string } | undefined)
                  ?.avatar_url ? (
                  <Image
                    src={
                      (
                        user.user_metadata as { avatar_url?: string }
                      ).avatar_url!
                    }
                    alt={t.avatar}
                    width={36}
                    height={36}
                    className='size-full object-cover'
                  />
                ) : (
                  <span className='bg-primary text-primary-foreground grid size-full place-items-center font-mono text-[13px] font-semibold uppercase'>
                    {(user.email?.[0] ?? 'u').toUpperCase()}
                  </span>
                )}
              </Link>
            </>
          ) : (
            <>
              <Link
                href='/login'
                className='text-muted-foreground hover:text-ink hidden px-3 py-2 text-sm font-medium transition-colors duration-200 sm:inline-flex'
              >
                <span className='link-underline'>{t.signIn}</span>
              </Link>
              <Button variant='ink' render={<Link href='/onboarding' />}>
                {t.cta}
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.header>
  )
}
