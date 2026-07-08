'use client'

import { useUser } from '@/features/auth/hooks/use-user'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import * as React from 'react'
import { Logo } from './logo'
import { copy } from './nav/copy'
import { LangToggle } from './nav/lang-toggle'
import { CommunityMenu, NavMenuGroup, TrainMenu } from './nav/menus'
import { MobileMenu } from './nav/mobile-menu'
import {
  StatusCluster,
  useHints,
  useRank,
  useStreak,
} from './nav/status-cluster'
import { Button } from './ui/button'

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
  const [menuOpen, setMenuOpen] = React.useState(false)
  const headerRef = React.useRef<HTMLElement>(null)
  const { scrollY } = useScroll()
  const { user, loading } = useUser()
  const hints = useHints(!loading && !!user)
  const rank = useRank(!loading && !!user)
  const streak = useStreak(!loading && !!user)

  useMotionValueEvent(scrollY, 'change', (v) => {
    setScrolled(v > 12)
  })

  React.useEffect(() => {
    if (!menuOpen) return
    function onPointerDown(e: PointerEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [menuOpen])

  const closeMenu = React.useCallback(() => setMenuOpen(false), [])

  return (
    <motion.header
      ref={headerRef}
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className='fixed inset-x-0 top-0 z-50'
    >
      <div
        className={cn(
          'container-main transition-[padding] duration-300',
          (scrolled || menuOpen) && 'pt-3',
        )}
      >
        <div
          className={cn(
            'rounded-2xl border transition-all duration-300',
            scrolled || menuOpen
              ? 'border-border bg-background/90 shadow-[0_8px_30px_rgba(27,25,22,0.08)] backdrop-blur'
              : 'border-transparent bg-transparent',
          )}
        >
          <div
            className={cn(
              'flex items-center justify-between transition-[height,padding] duration-300',
              scrolled || menuOpen ? 'h-[60px] px-4' : 'h-[72px] px-0',
            )}
          >
            <div className='flex items-center gap-5'>
              <Logo size='lg' />
              <span aria-hidden className='bg-border hidden h-5 w-px md:block' />
              <nav className='hidden items-center gap-1 md:flex'>
                <NavMenuGroup>
                  <TrainMenu loggedIn={!loading && !!user} />
                  <CommunityMenu />
                </NavMenuGroup>
              </nav>
            </div>

            <div className='flex items-center gap-2'>
              <LangToggle className='hidden sm:flex' />
              {!loading && user ? (
                <>
                  <NavLink href='/dashboard' label={t.dashboard} />
                  <StatusCluster
                    position={rank}
                    hints={hints}
                    streak={streak}
                  />
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
                          (user.user_metadata as { avatar_url?: string })
                            .avatar_url!
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
              <button
                type='button'
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-label={menuOpen ? t.closeMenu : t.openMenu}
                className='text-ink hover:bg-secondary grid size-10 shrink-0 cursor-pointer place-items-center rounded-full transition-colors duration-200 md:hidden'
              >
                {menuOpen ? (
                  <X className='size-5' strokeWidth={1.5} />
                ) : (
                  <Menu className='size-5' strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {menuOpen && (
              <MobileMenu
                loggedIn={!loading && !!user}
                hints={hints}
                onClose={closeMenu}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  )
}
