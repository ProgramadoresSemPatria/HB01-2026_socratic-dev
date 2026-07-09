'use client'

import * as React from 'react'

export type Locale = 'en' | 'pt'

export const LOCALE_COOKIE = 'locale'

const LocaleContext = React.createContext<{
  locale: Locale
  setLocale: (l: Locale) => void
}>({ locale: 'en', setLocale: () => {} })

export function LocaleProvider({
  initialLocale = 'en',
  children,
}: {
  initialLocale?: Locale
  children: React.ReactNode
}) {
  const [locale, setLocaleState] = React.useState<Locale>(initialLocale)

  React.useEffect(() => {
    window.localStorage.setItem(LOCALE_COOKIE, locale)
  }, [locale])

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
