'use client'

import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { signOut } from '@/features/auth/hooks/use-user'
import { getDashboardStats } from '@/features/dashboard/actions'
import type { Stats } from '@/features/dashboard/types'
import { Halftone, glyph } from '@/features/landing/components/halftone'
import { getProfile, type Profile } from '@/features/profile/actions'
import { setShareSolutions } from '@/features/solutions/actions'
import { copy, LANGUAGE_OPTIONS, STACK_OPTIONS } from './copy'
import { ProfileSkeleton } from './profile-skeleton'
import {
  SaveBadge,
  Segmented,
  SelectControl,
  SettingRow,
  type SaveState,
} from './settings-controls'
import { getAccessToken } from '@/lib/api/client'
import { useLocale, useT, type Locale } from '@/lib/i18n'
import { supabase } from '@/lib/supabase/client'
import { useTheme, type ThemeSetting } from '@/lib/theme'
import type { User } from '@supabase/supabase-js'
import { ArrowRight, Award, LogOut } from 'lucide-react'
import { motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as React from 'react'

export function ProfileView({ user }: { user: User }) {
  const router = useRouter()
  const t = useT(copy)
  const { theme, setTheme } = useTheme()
  const { locale, setLocale } = useLocale()
  const [profile, setProfile] = React.useState<Profile | null>(null)
  const [stats, setStats] = React.useState<Stats | null>(null)
  const [loaded, setLoaded] = React.useState(false)
  const [loadError, setLoadError] = React.useState(false)
  const [reloadKey, setReloadKey] = React.useState(0)
  const [track, setTrack] = React.useState('')
  const [stack, setStack] = React.useState('')
  const [level, setLevel] = React.useState('')
  const [saveState, setSaveState] = React.useState<SaveState>('idle')
  const [share, setShare] = React.useState(false)

  React.useEffect(() => {
    const meta = user?.user_metadata as
      | {
          preferred_track?: string
          preferred_stack?: string
          preferred_level?: string
        }
      | undefined
    if (meta?.preferred_track) setTrack(meta.preferred_track)
    if (meta?.preferred_stack) setStack(meta.preferred_stack)
    if (meta?.preferred_level) setLevel(meta.preferred_level)
  }, [user])

  async function savePrefs(
    nextTrack: string,
    nextStack: string,
    nextLevel: string,
  ) {
    setSaveState('saving')
    const { error } = await supabase.auth.updateUser({
      data: {
        preferred_track: nextTrack,
        preferred_stack: nextStack,
        preferred_level: nextLevel,
      },
    })
    if (error) {
      setSaveState('error')
      return
    }
    setSaveState('saved')
    setTimeout(() => setSaveState('idle'), 2000)
  }

  async function saveShare(next: boolean) {
    setShare(next)
    setSaveState('saving')
    const r = await setShareSolutions(await getAccessToken(), next)
    if ('error' in r) {
      setSaveState('error')
      return
    }
    setSaveState('saved')
    setTimeout(() => setSaveState('idle'), 2000)
  }

  React.useEffect(() => {
    if (!user) return
    let active = true
    ;(async () => {
      try {
        const token = await getAccessToken()
        const [p, s] = await Promise.all([
          getProfile(token),
          getDashboardStats(token),
        ])
        if (!active) return
        if (p) {
          setProfile(p)
          setShare(!!p.share_solutions)
        } else setLoadError(true)
        if (s && !('error' in s)) setStats(s)
        else setLoadError(true)
      } catch {
        if (active) setLoadError(true)
      } finally {
        if (active) setLoaded(true)
      }
    })()
    return () => {
      active = false
    }
  }, [user, reloadKey])

  function retryLoad() {
    setLoaded(false)
    setLoadError(false)
    setReloadKey((k) => k + 1)
  }

  const ready = !!user && loaded
  const avatarUrl = (user?.user_metadata as { avatar_url?: string } | undefined)
    ?.avatar_url

  return (
    <div className='relative flex min-h-screen flex-1 flex-col bg-background'>
      <Navbar />

      <main className='flex-1 pt-[88px] pb-20 md:pt-24'>
        <div className='container-main w-full max-w-3xl'>
          <motion.header
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className='relative overflow-hidden rounded-lg bg-pastel-greige px-6 py-10 sm:px-10 sm:py-12'
          >
            <div className='pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-25 mix-blend-multiply dark:mix-blend-screen'>
              <Halftone
                draw={glyph('{ }', 2)}
                ambient
                spacing={7}
                className='absolute inset-0'
              />
            </div>
            <div className='relative flex items-center gap-5 sm:gap-6'>
              {avatarUrl ? (
                <div className='relative size-20 shrink-0 overflow-hidden rounded-full border border-border sm:size-24'>
                  <Image
                    src={avatarUrl}
                    alt={t.avatarAlt}
                    fill
                    className='object-cover'
                  />
                </div>
              ) : (
                <div className='grid size-20 shrink-0 place-items-center rounded-full border border-border bg-background font-heading text-3xl font-light text-ink uppercase sm:size-24 sm:text-4xl'>
                  {(user?.email?.[0] ?? 'u').toUpperCase()}
                </div>
              )}
              <div className='min-w-0'>
                <p className='eyebrow mb-2'>{t.yourProfile}</p>
                <h1 className='type-h3 truncate'>{user?.email ?? '—'}</h1>
                {ready && profile && (
                  <p className='mt-2 font-mono text-[11px] tracking-wider text-muted-foreground uppercase'>
                    {t.memberSince}{' '}
                    {new Date(profile.created_at).toLocaleDateString(
                      t.dateLocale,
                    )}
                  </p>
                )}
                {user && (
                  <Link
                    href={`/cert/${user.id}`}
                    target='_blank'
                    className='mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary transition-opacity hover:opacity-80'
                  >
                    <Award className='size-4' strokeWidth={1.5} />
                    {t.certificate}
                  </Link>
                )}
              </div>
            </div>
          </motion.header>

          {!ready ? (
            <ProfileSkeleton />
          ) : (
            <>
              {loadError ? (
                <section className='mt-12 flex flex-col items-center rounded-lg border border-border bg-card px-6 py-10 text-center'>
                  <p className='text-sm text-muted-foreground'>{t.loadError}</p>
                  <Button
                    variant='outline'
                    className='mt-5'
                    onClick={retryLoad}
                  >
                    {t.retry}
                  </Button>
                </section>
              ) : (
                <section className='mt-12 grid grid-cols-1 gap-y-6 sm:grid-cols-3'>
                  <StatCol
                    value={String(stats?.total_completed ?? 0)}
                    label={t.statCompleted}
                  />
                  <StatCol
                    value={
                      stats && stats.total_completed > 0
                        ? `${stats.independence_score}%`
                        : '—'
                    }
                    label={t.statIndependence}
                  />
                  <StatCol
                    value={String(stats?.total_hints ?? 0)}
                    label={t.statHints}
                  />
                </section>
              )}

              <section className='mt-14'>
                <div className='flex items-end justify-between gap-4 border-b border-border pb-4'>
                  <div>
                    <p className='eyebrow'>{t.preferences}</p>
                    <p className='mt-2 max-w-md text-sm text-muted-foreground'>
                      {t.prefsNote}
                    </p>
                  </div>
                  <SaveBadge state={saveState} />
                </div>

                <SettingRow label={t.trackLabel} description={t.trackDesc}>
                  <SelectControl
                    ariaLabel={t.trackLabel}
                    value={track}
                    placeholder={t.trackPlaceholder}
                    options={t.trackOptions}
                    onChange={(v) => {
                      setTrack(v)
                      savePrefs(v, stack, level)
                    }}
                  />
                </SettingRow>

                {track !== 'design' && (
                  <SettingRow label={t.stackLabel} description={t.stackDesc}>
                    <SelectControl
                      ariaLabel={t.stackLabel}
                      value={stack}
                      placeholder={t.stackPlaceholder}
                      options={STACK_OPTIONS}
                      onChange={(v) => {
                        setStack(v)
                        savePrefs(track, v, level)
                      }}
                    />
                  </SettingRow>
                )}

                <SettingRow
                  label={t.difficultyLabel}
                  description={t.difficultyDesc}
                >
                  <SelectControl
                    ariaLabel={t.difficultyLabel}
                    value={level}
                    placeholder={t.levelPlaceholder}
                    options={t.levelOptions}
                    onChange={(v) => {
                      setLevel(v)
                      savePrefs(track, stack, v)
                    }}
                  />
                </SettingRow>

                <SettingRow
                  label={t.appearanceLabel}
                  description={t.appearanceDesc}
                >
                  <Segmented
                    value={theme}
                    options={t.themeOptions}
                    onChange={(v) => setTheme(v as ThemeSetting)}
                  />
                </SettingRow>

                <SettingRow
                  label={t.languageLabel}
                  description={t.languageDesc}
                >
                  <Segmented
                    value={locale}
                    options={LANGUAGE_OPTIONS}
                    onChange={(v) => setLocale(v as Locale)}
                  />
                </SettingRow>

                <SettingRow label={t.shareLabel} description={t.shareDesc}>
                  <Segmented
                    value={share ? 'on' : 'off'}
                    options={t.shareOptions}
                    onChange={(v) => saveShare(v === 'on')}
                  />
                </SettingRow>
              </section>

              <div className='mt-10 flex flex-col-reverse gap-5 sm:flex-row sm:items-center sm:justify-between'>
                <Link
                  href='/onboarding'
                  className='group/link inline-flex items-center gap-1.5 text-sm font-medium text-ink'
                >
                  <span className='link-underline'>{t.redoSetup}</span>
                  <ArrowRight className='size-3.5 transition-transform group-hover/link:translate-x-0.5' />
                </Link>
                <Button
                  variant='ghost'
                  className='self-start text-destructive hover:text-destructive sm:self-auto'
                  onClick={async () => {
                    await signOut()
                    router.push('/')
                  }}
                >
                  <LogOut className='size-4' /> {t.signOut}
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

function StatCol({ value, label }: { value: string; label: string }) {
  return (
    <div className='border-border sm:border-l sm:pl-8 sm:first:border-l-0 sm:first:pl-0'>
      <div className='font-heading text-[44px] leading-none font-light tracking-tight text-ink tabular-nums sm:text-[56px]'>
        {value}
      </div>
      <div className='mt-3 font-mono text-[11px] tracking-wider text-muted-foreground uppercase'>
        {label}
      </div>
    </div>
  )
}
