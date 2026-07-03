import { LocaleProvider } from '@/lib/i18n'
import { ThemeProvider, themeInitScript } from '@/lib/theme'
import { cn } from '@/lib/utils'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { DM_Mono, DM_Sans, Noto_Serif } from 'next/font/google'
import './globals.css'

const dmSansHeading = DM_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['300', '400', '500', '600', '700'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
})

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'Socratic.dev: The AI that makes you think',
  description:
    'A coding environment where the AI never hands you the answer. It makes you find it. For devs who want to actually learn in the AI era.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
      className={cn(
        'h-full antialiased',
        dmSans.variable,
        dmSansHeading.variable,
        dmMono.variable,
        notoSerif.variable,
        'font-sans',
      )}
    >
      <body
        suppressHydrationWarning
        className='flex min-h-full flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary'
      >
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ThemeProvider>
          <LocaleProvider>{children}</LocaleProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
