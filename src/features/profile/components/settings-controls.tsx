'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useT } from '@/lib/i18n'
import * as React from 'react'

export type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export function SettingRow({
  label,
  description,
  children,
}: {
  label: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className='flex flex-col gap-3 border-b border-border py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8'>
      <div className='min-w-0'>
        <div className='font-medium text-ink'>{label}</div>
        <div className='mt-0.5 text-sm text-muted-foreground'>
          {description}
        </div>
      </div>
      <div className='shrink-0'>{children}</div>
    </div>
  )
}

export function SelectControl({
  ariaLabel,
  value,
  placeholder,
  options,
  onChange,
}: {
  ariaLabel: string
  value: string
  placeholder: string
  options: readonly { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  return (
    <Select
      items={options}
      value={value || null}
      onValueChange={(v) => onChange((v as string | null) ?? '')}
    >
      <SelectTrigger aria-label={ariaLabel} className='w-full sm:w-[200px]'>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function Segmented({
  value,
  options,
  onChange,
}: {
  value: string
  options: readonly { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  return (
    <div className='inline-flex rounded-full border border-border p-0.5'>
      {options.map((o) => (
        <button
          key={o.value}
          type='button'
          onClick={() => onChange(o.value)}
          className={`min-h-10 rounded-full px-3.5 py-2 font-mono text-[11px] tracking-wider uppercase transition-colors ${
            value === o.value
              ? 'bg-ink text-background'
              : 'text-muted-foreground hover:text-ink'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

const badgeCopy = {
  en: {
    saving: 'Saving…',
    saved: 'Saved ✓',
    error: 'Save failed',
  },
  pt: {
    saving: 'Salvando…',
    saved: 'Salvo ✓',
    error: 'Erro ao salvar',
  },
}

export function SaveBadge({ state }: { state: SaveState }) {
  const t = useT(badgeCopy)
  if (state === 'idle') return null
  const map = {
    saving: [t.saving, 'text-muted-foreground'],
    saved: [t.saved, 'text-mint'],
    error: [t.error, 'text-destructive'],
  } as const
  const [text, cls] = map[state]
  return <span className={`shrink-0 font-mono text-[11px] ${cls}`}>{text}</span>
}
