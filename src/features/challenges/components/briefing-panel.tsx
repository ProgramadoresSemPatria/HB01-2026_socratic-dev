import { Building, Sparkles } from 'lucide-react'
import type { Challenge } from '../types'
import { levelLabel } from '../utils'

function stackLabel(c: Challenge): string {
  if (c.kind === 'design') return 'System Design'
  if (c.stack === 'javascript') return 'JavaScript'
  return 'TypeScript'
}

export function BriefingPanel({ challenge }: { challenge: Challenge }) {
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
        <p className='whitespace-pre-line text-[#2c2330]'>
          {challenge.client_briefing}
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
