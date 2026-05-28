import { LEVEL_LABEL, type Challenge } from '@/lib/challenge'
import { Building, Sparkles } from 'lucide-react'

export function BriefingPanel({ challenge }: { challenge: Challenge }) {
  return (
    <div className='p-6'>
      <div className='glass mb-5 inline-flex items-center gap-2 rounded-full px-2.5 py-1 font-mono text-[10px] tracking-wider text-muted-foreground/70 uppercase'>
        <Building className='size-3' />
        Briefing do cliente
      </div>

      <h2 className='mb-3 font-heading text-2xl leading-tight font-semibold tracking-tight'>
        {challenge.title}
      </h2>

      <div className='mb-6 flex items-center gap-2 font-mono text-[11px] text-muted-foreground/70'>
        <span className='rounded-full border border-white/[0.06] bg-white/[0.04] px-2 py-0.5'>
          {challenge.stack === 'design'
            ? 'System Design'
            : challenge.stack === 'javascript'
              ? 'JavaScript'
              : 'TypeScript'}
        </span>
        <span className='rounded-full border border-white/[0.06] bg-white/[0.04] px-2 py-0.5'>
          {LEVEL_LABEL[challenge.level] ?? challenge.level}
        </span>
      </div>

      <div className='space-y-4 text-sm leading-relaxed'>
        <p className='whitespace-pre-line text-foreground/90'>
          {challenge.client_briefing}
        </p>

        <div className='mt-6 rounded-xl border border-iris/20 bg-iris/5 p-4'>
          <div className='mb-1.5 flex items-center gap-2 font-mono text-[11px] tracking-wider text-iris uppercase'>
            <Sparkles className='size-3.5' />
            Regra da casa
          </div>
          <p className='text-[13px] leading-relaxed text-foreground/85'>
            O tutor não vai te dar a resposta. Ele faz perguntas. Se você quiser
            um hint direto, pague em pontos de independência.
          </p>
        </div>
      </div>
    </div>
  )
}
