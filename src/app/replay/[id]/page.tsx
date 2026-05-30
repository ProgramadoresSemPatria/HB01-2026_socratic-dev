import { Logo } from '@/components/logo'
import { FormattedText } from '@/features/challenges/components/formatted-text'
import { supabaseAdmin } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import {
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  GitPullRequestArrow,
  Lightbulb,
  Network,
  Sparkles,
  XCircle,
} from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const PERSONA_RE = /^Cliente:\s*([^()]+?)\s*\(([^)]+)\)\s*—\s*(.+)$/

function parsePersona(brief: string) {
  const [first, ...rest] = brief.split('\n')
  const m = first?.match(PERSONA_RE)
  if (!m) return { persona: null as null, body: brief }
  return {
    persona: { name: m[1].trim(), role: m[2].trim(), company: m[3].trim() },
    body: rest.join('\n').trim(),
  }
}

function levelLabel(level: string): string {
  return level === 'beginner'
    ? 'Iniciante'
    : level === 'intermediate'
      ? 'Intermediário'
      : level === 'advanced'
        ? 'Avançado'
        : level
}

function stackLabel(stack: string | null, kind: string | null): string {
  if (kind === 'design') return 'System Design'
  if (stack === 'javascript') return 'JavaScript'
  if (stack === 'typescript') return 'TypeScript'
  if (stack === 'react') return 'React'
  if (stack === 'python') return 'Python'
  return stack ?? ''
}

function formatTime(s: number | null): string {
  if (!s) return '—'
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}m ${sec.toString().padStart(2, '0')}s`
}

function calcIndependence(hints: { hint_level: number }[]): number {
  const penalty = hints.reduce((sum, h) => sum + h.hint_level * 4, 0)
  return Math.max(0, 100 - penalty)
}

async function fetchReplay(id: string) {
  const session = await supabaseAdmin
    .from('sessions')
    .select(
      'id, status, started_at, completed_at, duration_seconds, challenge_id, user_id, challenges(*)',
    )
    .eq('id', id)
    .maybeSingle()
  if (!session.data) return null

  const submission = await supabaseAdmin
    .from('code_submissions')
    .select('code, review_response, submitted_at')
    .eq('session_id', id)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const hints = await supabaseAdmin
    .from('hints_used')
    .select('hint_level, used_at')
    .eq('session_id', id)

  return {
    session: session.data as Awaited<
      ReturnType<typeof supabaseAdmin.from>
    > extends { data: infer T }
      ? T
      : unknown,
    submission: submission.data,
    hints: (hints.data ?? []) as { hint_level: number; used_at: string }[],
  }
}

export async function generateMetadata(props: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await props.params
  const data = await fetchReplay(id)
  if (!data) return { title: 'Replay não encontrado · socratic.dev' }
  const session = data.session as {
    challenges: { title?: string } | null
    status: string
  }
  const title = session.challenges?.title ?? 'Desafio'
  const score = calcIndependence(data.hints)
  return {
    title: `${title} · ${score}% independente · socratic.dev`,
    description: `Sessão pública: ${title} resolvida com ${score}% de independência. Sem cola, sem IA cuspindo a resposta.`,
    openGraph: {
      title: `${title} — ${score}% independente`,
      description: 'Prova social verificável. Resolvido no socratic.dev.',
      type: 'article',
    },
  }
}

export default async function ReplayPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const data = await fetchReplay(id)
  if (!data) notFound()

  const session = data.session as {
    id: string
    status: string
    started_at: string
    completed_at: string | null
    duration_seconds: number | null
    challenges: {
      title: string
      description: string
      stack: string
      level: string
      kind: string | null
      client_briefing: string
      initial_code?: string
    } | null
  }
  const c = session.challenges
  if (!c) notFound()

  const { persona, body } = parsePersona(c.client_briefing)
  const independence = calcIndependence(data.hints)
  const passed = session.status === 'completed'
  const isDesign = c.kind === 'design'
  const date = new Date(session.completed_at ?? session.started_at)

  return (
    <div className='relative flex min-h-screen flex-col bg-white'>
      <header className='sticky top-0 z-40 border-b border-[#DFE5E9] bg-white/90 backdrop-blur'>
        <div className='container-main flex h-16 items-center justify-between'>
          <Logo />
          <Link
            href='/onboarding'
            className='cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90'
          >
            Treinar também
          </Link>
        </div>
      </header>

      <main className='flex-1 pt-10 pb-20'>
        <div className='container-main max-w-3xl'>
          <div className='mb-3 inline-flex items-center gap-2 rounded-full border border-iris/20 bg-iris/10 px-3 py-1 font-mono text-[11px] text-iris'>
            <Sparkles className='size-3' />
            Sessão pública · socratic.dev
          </div>

          <h1 className='font-heading text-4xl leading-tight font-semibold tracking-tight text-[#1b1916] sm:text-5xl'>
            {c.title}
          </h1>

          <div className='mt-4 flex flex-wrap items-center gap-2 font-mono text-[11px] text-[#6b6478]'>
            <span className='rounded-full border border-[#DFE5E9] bg-white px-2 py-0.5'>
              {isDesign ? (
                <Network className='mr-1 inline size-3' />
              ) : (
                <Code2 className='mr-1 inline size-3' />
              )}
              {stackLabel(c.stack, c.kind)}
            </span>
            <span className='rounded-full border border-[#DFE5E9] bg-white px-2 py-0.5'>
              {levelLabel(c.level)}
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5',
                passed
                  ? 'border-emerald-600/30 bg-emerald-50 text-emerald-700'
                  : 'border-amber-500/30 bg-amber-50 text-amber-700',
              )}
            >
              {passed ? (
                <CheckCircle2 className='size-3' />
              ) : (
                <XCircle className='size-3' />
              )}
              {passed ? 'Concluído' : 'Reprovado'}
            </span>
            <span className='inline-flex items-center gap-1'>
              <Calendar className='size-3' />
              {date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>

          {/* Hero metrics */}
          <div className='mt-8 grid grid-cols-3 gap-3'>
            <Metric
              label='Independência'
              value={`${independence}%`}
              accent='mint'
              hint='100 menos a penalidade de hints. Mostra o quanto pensou sozinho.'
            />
            <Metric label='Hints usados' value={String(data.hints.length)} />
            <Metric
              label='Tempo'
              value={formatTime(session.duration_seconds)}
              accent='iris'
            />
          </div>

          {/* Persona + brief */}
          <Section title='Pedido do cliente' icon={<Sparkles className='size-3.5' />}>
            {persona && (
              <div className='mb-4 flex items-center gap-3 rounded-2xl border border-[#DFE5E9] bg-white p-3'>
                <div className='grid size-11 shrink-0 place-items-center rounded-full bg-[#dad8ea]/55 font-heading text-sm font-semibold text-[#1b1916]'>
                  {persona.name
                    .split(/\s+/)
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
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
            <p className='whitespace-pre-line text-[14px] leading-relaxed text-[#2c2330]'>
              {persona ? body : c.client_briefing}
            </p>
          </Section>

          {/* Hint breakdown */}
          {data.hints.length > 0 && (
            <Section
              title='Como pediu hints'
              icon={<Lightbulb className='size-3.5' />}
            >
              <div className='grid grid-cols-3 gap-2 text-center text-sm'>
                {([1, 2, 3] as const).map((lvl) => {
                  const n = data.hints.filter((h) => h.hint_level === lvl).length
                  return (
                    <div
                      key={lvl}
                      className='rounded-xl border border-[#DFE5E9] bg-white p-3'
                    >
                      <div className='font-mono text-[10px] tracking-wider text-[#6b6478] uppercase'>
                        Nível {lvl}
                      </div>
                      <div className='mt-1 font-heading text-xl font-semibold text-[#1b1916]'>
                        {n}
                      </div>
                      <div className='text-[11px] text-[#6b6478]'>
                        −{n * lvl * 4} indep.
                      </div>
                    </div>
                  )
                })}
              </div>
            </Section>
          )}

          {/* Final code (for code track) */}
          {!isDesign && data.submission?.code && (
            <Section
              title='Código final submetido'
              icon={<Code2 className='size-3.5' />}
            >
              <pre className='overflow-x-auto rounded-2xl border border-[#DFE5E9] bg-[#0f1115] p-5 font-mono text-[12.5px] leading-relaxed text-[#e6e7eb]'>
                <code>{data.submission.code}</code>
              </pre>
            </Section>
          )}

          {/* AI review */}
          {data.submission?.review_response && (
            <Section
              title='Review socrático'
              icon={<GitPullRequestArrow className='size-3.5' />}
            >
              <div className='rounded-2xl border border-[#DFE5E9] bg-[#F7F9FA] p-5 text-[14px] leading-relaxed text-[#2c2330]'>
                <FormattedText text={data.submission.review_response} />
              </div>
            </Section>
          )}

          <div className='mt-12 rounded-2xl border border-[#DFE5E9] bg-[#F7F9FA] p-6 text-center'>
            <div className='mb-1.5 font-mono text-[11px] tracking-wider text-[#6b6478] uppercase'>
              Prova sem cola
            </div>
            <p className='text-[14px] text-[#2c2330]'>
              Essa sessão foi gerada por IA, com testes escondidos rodando no
              browser. O tutor nunca entrega a resposta — só pergunta. Cada hint
              custa independência. <strong>Quer tentar?</strong>
            </p>
            <Link
              href='/onboarding'
              className='mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90'
            >
              Começar meu próprio
            </Link>
          </div>

          <div className='mt-8 text-center font-mono text-[10px] text-[#6b6478]'>
            ID da sessão: <span className='text-[#1b1916]'>{session.id}</span>
          </div>
        </div>
      </main>
    </div>
  )
}

function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className='mt-10'>
      <div className='mb-3 inline-flex items-center gap-2 font-mono text-[11px] tracking-wider text-[#6b6478] uppercase'>
        {icon}
        {title}
      </div>
      {children}
    </section>
  )
}

function Metric({
  label,
  value,
  accent,
  hint,
}: {
  label: string
  value: string
  accent?: 'mint' | 'iris'
  hint?: string
}) {
  return (
    <div
      title={hint}
      className='rounded-xl border border-[#DFE5E9] bg-white p-3.5'
    >
      <div className='mb-1 inline-flex items-center gap-1 font-mono text-[10px] tracking-wider text-[#6b6478] uppercase'>
        {label === 'Independência' && <Brain className='size-3' />}
        {label === 'Tempo' && <Clock className='size-3' />}
        {label === 'Hints usados' && <Lightbulb className='size-3' />}
        {label}
      </div>
      <div
        className={cn(
          'font-heading text-2xl font-semibold tabular-nums text-[#1b1916]',
          accent === 'mint' && 'text-emerald-600',
          accent === 'iris' && 'text-iris',
        )}
      >
        {value}
      </div>
    </div>
  )
}
