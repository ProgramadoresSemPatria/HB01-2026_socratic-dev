'use client'

import * as React from 'react'

export type ThemeSetting = 'light' | 'dark' | 'system'

const THEME_KEY = 'theme'

function systemDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function apply(setting: ThemeSetting) {
  const dark = setting === 'dark' || (setting === 'system' && systemDark())
  document.documentElement.classList.toggle('dark', dark)
}

const ThemeContext = React.createContext<{
  theme: ThemeSetting
  setTheme: (t: ThemeSetting) => void
}>({ theme: 'system', setTheme: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<ThemeSetting>('dark')

  React.useEffect(() => {
    const stored = window.localStorage.getItem(THEME_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      setThemeState(stored)
      apply(stored)
    } else {
      apply('dark')
    }
  }, [])

  React.useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => apply('system')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [theme])

  const setTheme = React.useCallback((t: ThemeSetting) => {
    setThemeState(t)
    window.localStorage.setItem(THEME_KEY, t)
    document.cookie = `${THEME_KEY}=${t};path=/;max-age=31536000;samesite=lax`
    apply(t)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return React.useContext(ThemeContext)
}

export function useIsDark(): boolean {
  const [dark, setDark] = React.useState(true)
  React.useEffect(() => {
    const el = document.documentElement
    const sync = () => setDark(el.classList.contains('dark'))
    sync()
    const mo = new MutationObserver(sync)
    mo.observe(el, { attributes: true, attributeFilter: ['class'] })
    return () => mo.disconnect()
  }, [])
  return dark
}

export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_KEY}');var d=t?(t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches)):true;if(d)document.documentElement.classList.add('dark')}catch(e){document.documentElement.classList.add('dark')}})()`
