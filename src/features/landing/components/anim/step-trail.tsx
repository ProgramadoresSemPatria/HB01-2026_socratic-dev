// Hand-drawn SVG arc that connects the four timeline steps in HowItWorks.
// To REMOVE: delete this file and the <StepTrail /> usage in how-it-works.tsx.
'use client'

import * as React from 'react'

export function StepTrail() {
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const pathRef = React.useRef<SVGPathElement>(null)

  React.useEffect(() => {
    const wrap = wrapRef.current
    const path = pathRef.current
    if (!wrap || !path) return
    const len = path.getTotalLength()
    path.style.strokeDasharray = String(len)
    path.style.strokeDashoffset = String(len)
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        path.style.transition =
          'stroke-dashoffset 2200ms cubic-bezier(0.16, 1, 0.3, 1)'
        path.style.strokeDashoffset = '0'
        io.disconnect()
      },
      { threshold: 0.25 },
    )
    io.observe(wrap)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className='pointer-events-none absolute inset-x-6 top-7 hidden h-12 lg:block'
    >
      <svg
        viewBox='0 0 1000 60'
        preserveAspectRatio='none'
        className='h-full w-full'
      >
        <path
          ref={pathRef}
          d='M 60 30 Q 180 6 310 30 T 560 30 T 810 30 T 940 30'
          fill='none'
          stroke='#c9c5e8'
          strokeWidth='1.5'
          strokeLinecap='round'
        />
        {[60, 310, 560, 810, 940].map((x) => (
          <circle
            key={x}
            cx={x}
            cy={30}
            r={3}
            fill='#c9c5e8'
          />
        ))}
      </svg>
    </div>
  )
}
