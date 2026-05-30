// Custom counter that animates when scrolled into view.
// To REMOVE: delete this file and replace <AnimatedCount value="X" />
// with the raw string "X" in the section that imports it.
'use client'

import * as React from 'react'

type Parsed = { num: number; suffix: string; hasDot: boolean }

function parse(value: string): Parsed {
  const m = value.match(/^([\d.]+)(.*)$/)
  if (!m) return { num: 0, suffix: value, hasDot: false }
  return {
    num: Number(m[1].replace(/\./g, '')),
    suffix: m[2],
    hasDot: m[1].includes('.'),
  }
}

function format(n: number, hasDot: boolean): string {
  const v = Math.max(0, Math.round(n))
  return hasDot ? v.toLocaleString('pt-BR') : String(v)
}

export function AnimatedCount({
  value,
  reverse = false,
  duration = 1500,
  className,
}: {
  value: string
  reverse?: boolean
  duration?: number
  className?: string
}) {
  const { num, suffix, hasDot } = React.useMemo(() => parse(value), [value])
  const start = reverse ? Math.max(num + 1, 999) : 0
  const [display, setDisplay] = React.useState(() => format(start, hasDot) + suffix)
  const ref = React.useRef<HTMLSpanElement>(null)
  const started = React.useRef(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started.current) return
        started.current = true
        const t0 = performance.now()
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / duration)
          const eased = 1 - Math.pow(1 - p, 3)
          setDisplay(format(start + (num - start) * eased, hasDot) + suffix)
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        io.disconnect()
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [num, hasDot, suffix, start, duration])

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}
