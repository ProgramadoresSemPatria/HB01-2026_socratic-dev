'use client'

import * as React from 'react'

export type Locale = 'en' | 'pt'

export const LOCALE_COOKIE = 'locale'

const LocaleContext = React.createContext<{
  locale: Locale
  setLocale: (l: Locale) => void
}>({ locale: 'en', setLocale: () => {} })

function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'en'
  const stored = window.localStorage.getItem(LOCALE_COOKIE)
  if (stored === 'pt' || stored === 'en') return stored
  return navigator.language?.toLowerCase().startsWith('pt') ? 'pt' : 'en'
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>('en')

  React.useEffect(() => {
    const detected = detectLocale()
    setLocaleState(detected)
  }, [])

  React.useEffect(() => {
    document.documentElement.lang = locale === 'pt' ? 'pt-BR' : 'en'
  }, [locale])

  const setLocale = React.useCallback((l: Locale) => {
    setLocaleState(l)
    window.localStorage.setItem(LOCALE_COOKIE, l)
    document.cookie = `${LOCALE_COOKIE}=${l};path=/;max-age=31536000;samesite=lax`
  }, [])

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  return React.useContext(LocaleContext)
}

export function useT<T extends Record<Locale, unknown>>(copy: T): T[Locale] {
  const { locale } = useLocale()
  return copy[locale] as T[Locale]
}
