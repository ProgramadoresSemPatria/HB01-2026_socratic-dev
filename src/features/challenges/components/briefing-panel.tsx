'use client'

import { useT } from '@/lib/i18n'
import { Building, Sparkles } from 'lucide-react'
import type { Challenge } from '../types'
import { levelLabel } from '../utils'

const copy = {
  en: {
    eyebrow: 'Client briefing',
    houseRule: 'House rule',
    houseRuleBody:
      "The tutor won't give you the answer. It asks questions. If you want a direct hint, you pay in independence points.",
  },
  pt: {
    eyebrow: 'Briefing do cliente',
    houseRule: 'Regra da casa',
    houseRuleBody:
      'O tutor não vai te dar a resposta. Ele faz perguntas. Se você quiser um hint direto, paga em pontos de independência.',
  },
}

function stackLabel(c: Challenge): string {
  if (c.kind === 'design') return 'System Design'
  if (c.stack === 'javascript') return 'JavaScript'
  return 'TypeScript'
}

const PERSONA_RE = /^Cliente:\s*([^()]+?)\s*\(([^)]+)\)\s*—\s*(.+)$/

function parsePersona(brief: string): {
  persona: { name: string; role: string; company: string } | null
  body: string
} {
  const [first, ...rest] = brief.split('\n')
  const m = first?.match(PERSONA_RE)
  if (!m) return { persona: null, body: brief }
  return {
    persona: { name: m[1].trim(), role: m[2].trim(), company: m[3].trim() },
    body: rest.join('\n').trim(),
  }
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return '??'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const AVATAR_COLORS = [
  'bg-pastel-lavender',
  'bg-pastel-sage',
  'bg-pastel-sand',
  'bg-pastel-mist',
  'bg-pastel-lilac',
  'bg-pastel-greige',
]

function avatarClass(name: string): string {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

export function BriefingPanel({ challenge }: { challenge: Challenge }) {
  const t = useT(copy)
  const { persona, body } = parsePersona(challenge.client_briefing)

  return (
    <div className='p-6'>
      <p className='eyebrow mb-5 flex items-center gap-2'>
        <Building className='size-3' strokeWidth={1.5} />
        {t.eyebrow}
      </p>

      <h2 className='mb-3 font-heading text-2xl leading-tight font-light tracking-tight text-ink'>
        {challenge.title}
      </h2>

      <div className='mb-6 flex items-center gap-2 font-mono text-[11px] text-muted-foreground'>
        <span className='rounded-full border border-border bg-white px-2 py-0.5'>
          {stackLabel(challenge)}
        </span>
        <span className='rounded-full border border-border bg-white px-2 py-0.5'>
          {levelLabel(challenge.level)}
        </span>
      </div>

      <div className='space-y-4 text-sm leading-relaxed'>
        {persona && (
          <div className='flex items-center gap-3 rounded-lg border border-border bg-white p-3'>
            <div
              className={`grid size-11 shrink-0 place-items-center rounded-full font-heading text-sm font-medium text-ink ${avatarClass(persona.name)}`}
            >
              {initials(persona.name)}
            </div>
            <div className='min-w-0'>
              <div className='truncate font-heading text-[15px] font-medium text-ink'>
                {persona.name}
              </div>
              <div className='truncate text-[12px] text-muted-foreground'>
                {persona.role} · {persona.company}
              </div>
            </div>
          </div>
        )}

        <p className='whitespace-pre-line text-aubergine'>
          {persona ? body : challenge.client_briefing}
        </p>

        <div className='mt-6 rounded-lg bg-pastel-lilac p-4'>
          <div className='mb-1.5 flex items-center gap-2 font-mono text-[11px] tracking-wider text-primary uppercase'>
            <Sparkles className='size-3.5' strokeWidth={1.5} />
            {t.houseRule}
          </div>
          <p className='text-[13px] leading-relaxed text-aubergine'>
            {t.houseRuleBody}
          </p>
        </div>
      </div>
    </div>
  )
}
