'use client'

import type { TrendPoint } from '@/features/dashboard/independence'
import { useLocale, useT } from '@/lib/i18n'
import { Line, LineChart, ResponsiveContainer, Tooltip, YAxis } from 'recharts'

const copy = {
  en: {
    eyebrow: 'Over time',
    title: 'Independence trend',
    suffix: '% independent',
    tooSoon: 'A couple more challenges and your trend shows up here.',
  },
  pt: {
    eyebrow: 'Ao longo do tempo',
    title: 'Evolução da independência',
    suffix: '% independente',
    tooSoon: 'Mais um ou dois desafios e sua evolução aparece aqui.',
  },
}

export function IndependenceTrend({ trend }: { trend: TrendPoint[] }) {
  const t = useT(copy)
  const { locale } = useLocale()
  const dateLocale = locale === 'pt' ? 'pt-BR' : 'en-US'

  return (
    <div className='border-t border-border pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12'>
      <p className='eyebrow'>{t.eyebrow}</p>
      <h2 className='type-h4 mt-2'>{t.title}</h2>

      {/* A line needs two points. One completed challenge draws nothing useful. */}
      {trend.length < 2 ? (
        <p className='mt-8 text-sm text-muted-foreground'>{t.tooSoon}</p>
      ) : (
        <div className='mt-8 h-[200px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart
              data={trend}
              margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const point = payload[0].payload as TrendPoint
                  return (
                    <div className='rounded-md border border-border bg-card px-3 py-2 font-mono text-[11px] shadow-sm'>
                      <div className='text-ink tabular-nums'>
                        {point.value}
                        {t.suffix}
                      </div>
                      <div className='mt-0.5 text-muted-foreground'>
                        {new Date(point.date).toLocaleDateString(dateLocale)}
                      </div>
                    </div>
                  )
                }}
              />
              <Line
                type='monotone'
                dataKey='value'
                stroke='var(--chart-1)'
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: 'var(--chart-1)', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
