import { Building, Sparkles } from 'lucide-react'
import type { Challenge } from '../types'
import { levelLabel } from '../utils'

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
  'bg-[#fce7f3] text-[#9d174d]',
  'bg-[#e0e7ff] text-[#3730a3]',
  'bg-[#dbeafe] text-[#1e40af]',
  'bg-[#d1fae5] text-[#065f46]',
  'bg-[#fef3c7] text-[#92400e]',
  'bg-[#f3e8ff] text-[#6b21a8]',
  'bg-[#ffedd5] text-[#9a3412]',
  'bg-[#cffafe] text-[#155e75]',
]

function avatarClass(name: string): string {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

export function BriefingPanel({ challenge }: { challenge: Challenge }) {
  const { persona, body } = parsePersona(challenge.client_briefing)

  return (
    <div className='p-6'>
      <div className='mb-5 inline-flex items-center gap-2 rounded-full border border-[#DFE5E9] bg-[#F7F9FA] px-2.5 py-1 font-mono text-[10px] tracking-wider text-[#6b6478] uppercase'>
        <Building className='size-3' />
        Briefing do cliente
      </div>

      <h2 className='mb-3 font-heading text-2xl leading-tight font-semibold tracking-tight text-[#1b1916]'>
        {challenge.title}
      </h2>

      <div className='mb-6 flex items-center gap-2 font-mono text-[11px] text-[#6b6478]'>
        <span className='rounded-full border border-[#DFE5E9] bg-white px-2 py-0.5'>
          {stackLabel(challenge)}
        </span>
        <span className='rounded-full border border-[#DFE5E9] bg-white px-2 py-0.5'>
          {levelLabel(challenge.level)}
        </span>
      </div>

      <div className='space-y-4 text-sm leading-relaxed'>
        {persona && (
          <div className='flex items-center gap-3 rounded-2xl border border-[#DFE5E9] bg-white p-3'>
            <div
              className={`grid size-11 shrink-0 place-items-center rounded-full font-heading text-sm font-semibold ${avatarClass(persona.name)}`}
            >
              {initials(persona.name)}
            </div>
            <div className='min-w-0'>
              <div className='truncate font-heading text-[15px] font-semibold text-[#1b1916]'>
                {persona.name}
              </div>
              <div className='truncate text-[12px] text-[#6b6478]'>
                {persona.role} · {persona.company}
              </div>
            </div>
          </div>
        )}

        <p className='whitespace-pre-line text-[#2c2330]'>
          {persona ? body : challenge.client_briefing}
        </p>

        <div className='mt-6 rounded-xl border border-iris/20 bg-iris/5 p-4'>
          <div className='mb-1.5 flex items-center gap-2 font-mono text-[11px] tracking-wider text-iris uppercase'>
            <Sparkles className='size-3.5' />
            Regra da casa
          </div>
          <p className='text-[13px] leading-relaxed text-[#2c2330]'>
            O tutor não vai te dar a resposta. Ele faz perguntas. Se você quiser
            um hint direto, paga em pontos de independência.
          </p>
        </div>
      </div>
    </div>
  )
}
