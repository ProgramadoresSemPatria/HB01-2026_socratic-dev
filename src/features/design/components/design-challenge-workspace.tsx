'use client'

import { Button } from '@/components/ui/button'
import { BriefingPanel } from '@/features/challenges/components/briefing-panel'
import { ChallengeSkeleton } from '@/features/challenges/components/challenge-skeleton'
import { ChatPanel } from '@/features/challenges/components/chat-panel'
import { ReviewModal } from '@/features/challenges/components/review-modal'
import { WorkspaceHeader } from '@/features/challenges/components/workspace-header'
import { useSocraticSession } from '@/features/challenges/hooks/use-socratic-session'
import type { Challenge } from '@/features/challenges/types'
import {
  buildSceneElements,
  exportScenePng,
  summarizeElements,
  type ExcalidrawApi,
} from '@/features/design/utils/scene'
import { apiFetch } from '@/lib/api/client'
import { useT } from '@/lib/i18n'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { Loader2, Wand2 } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { DesignCanvas } from './design-canvas'

const POST = { method: 'POST', headers: { 'content-type': 'application/json' } }

const copy = {
  en: {
    intro:
      'Hi. Read the briefing on the left and tell me: where would you start this design?',
    replyFallback: "Couldn't respond right now.",
    analyzeFallback: "Couldn't analyze right now.",
    hintUnavailable: 'Hint unavailable.',
    solutionDrawn:
      'I drew the architecture on the canvas. Study the flow and why each piece is there.',
    solveFallback: "Couldn't solve it right now.",
    nothingDrawn:
      "You haven't drawn anything yet — start the diagram and submit again.",
    reviewFallback: "Couldn't generate the review.",
    canvasLabel: 'Canvas — draw your architecture',
    askAnalysis: 'Ask for analysis',
  },
  pt: {
    intro:
      'Olá. Leia o briefing à esquerda e me diga: por onde você começa esse design?',
    replyFallback: 'Não consegui responder agora.',
    analyzeFallback: 'Não consegui analisar agora.',
    hintUnavailable: 'Hint indisponível.',
    solutionDrawn:
      'Desenhei a arquitetura no canvas. Estude o fluxo e por que cada peça está ali.',
    solveFallback: 'Não consegui resolver agora.',
    nothingDrawn:
      'Você ainda não desenhou nada — comece o diagrama e submeta de novo.',
    reviewFallback: 'Não foi possível gerar o review.',
    canvasLabel: 'Canvas — desenhe sua arquitetura',
    askAnalysis: 'Pedir análise',
  },
}

export function DesignChallengeWorkspace({ user }: { user: User }) {
  const router = useRouter()
  const t = useT(copy)
  const [challenge, setChallenge] = React.useState<Challenge | null>(null)
  const apiRef = React.useRef<ExcalidrawApi | null>(null)
  const saveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const intro = challenge?.intro || t.intro

  const s = useSocraticSession<readonly unknown[]>({
    challenge: challenge ? { id: challenge.id } : null,
    initialWork: [],
    initialMessages: [{ role: 'ai', text: intro }],
  })

  const [outcome, setOutcome] = React.useState<'pass' | 'fail'>('pass')

  const [reviewOpen, setReviewOpen] = React.useState(false)
  const [review, setReview] = React.useState<string | null>(null)
  const [reviewing, setReviewing] = React.useState(false)

  React.useEffect(() => {
    let active = true
    ;(async () => {
      const id =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('id')
          : null
      const { data } = id
        ? await supabase.from('challenges').select('*').eq('id', id).single()
        : await supabase
            .from('challenges')
            .select('*')
            .eq('kind', 'design')
            .order('created_at', { ascending: true })
            .limit(1)
            .single()
      if (active && data) setChallenge(data as unknown as Challenge)
    })()
    return () => {
      active = false
    }
  }, [])

  function currentElements(): readonly unknown[] {
    return apiRef.current?.getSceneElements() ?? s.work
  }

  function tutorBody(extra: Record<string, unknown>) {
    return JSON.stringify({
      domain: 'design',
      title: challenge?.title ?? '',
      briefing: challenge?.client_briefing ?? '',
      code: summarizeElements(currentElements()),
      ...extra,
    })
  }

  async function sendUser() {
    if (!s.input.trim() || s.thinking || !challenge) return
    const text = s.input.trim()
    const next = [...s.messages, { role: 'user' as const, text }]
    s.setMessages(next)
    s.setInput('')
    s.setThinking(true)
    try {
      const res = await apiFetch('/api/tutor', {
        ...POST,
        body: tutorBody({ mode: 'reply', messages: next }),
      })
      const data = await res.json()
      s.pushMessage({
        role: 'ai',
        text: data.text || data.error || t.replyFallback,
      })
    } finally {
      s.setThinking(false)
    }
  }

  async function askAnalysis() {
    if (s.thinking || !challenge) return
    s.setThinking(true)
    try {
      const res = await apiFetch('/api/tutor', {
        ...POST,
        body: tutorBody({ mode: 'reply', messages: s.messages }),
      })
      const data = await res.json()
      s.pushMessage({
        role: 'ai',
        text: data.text || data.error || t.analyzeFallback,
      })
    } finally {
      s.setThinking(false)
    }
  }

  async function askHint(level: 1 | 2 | 3) {
    if (s.thinking || !challenge) return
    s.setThinking(true)
    s.applyHint(level)
    try {
      const res = await apiFetch('/api/tutor', {
        ...POST,
        body: tutorBody({
          mode: 'hint',
          hintLevel: level,
          messages: s.messages,
          session_id: s.sessionId,
        }),
      })
      const data = await res.json()
      s.syncRemaining(data.remaining)
      s.pushMessage({
        role: 'ai',
        text: data.text || data.error || t.hintUnavailable,
        hintLevel: level,
      })
    } finally {
      s.setThinking(false)
    }
  }

  async function askSolve() {
    if (s.thinking || !challenge) return
    s.setThinking(true)
    s.spendSolve()
    try {
      const res = await apiFetch('/api/solve', {
        ...POST,
        body: JSON.stringify({
          kind: 'design',
          title: challenge.title,
          briefing: challenge.client_briefing,
          work: summarizeElements(currentElements()),
          session_id: s.sessionId,
        }),
      })
      const data = await res.json()
      s.syncRemaining(data.remaining)
      if (Array.isArray(data.nodes) && data.nodes.length > 0) {
        const elements = await buildSceneElements(data.nodes, data.edges ?? [])
        apiRef.current?.updateScene({ elements })
        apiRef.current?.scrollToContent(elements, {
          fitToContent: true,
          animate: true,
        })
        s.setWork(elements)
        s.pushMessage({
          role: 'ai',
          text: t.solutionDrawn,
        })
      } else {
        s.pushMessage({
          role: 'ai',
          text: data.error || t.solveFallback,
        })
      }
    } finally {
      s.setThinking(false)
    }
  }

  async function submitDesign() {
    if (!challenge || reviewing) return
    setReviewOpen(true)
    setReviewing(true)
    setReview(null)

    const elements = currentElements()
    if (elements.length === 0) {
      setOutcome('fail')
      setReview(t.nothingDrawn)
      s.complete(s.elapsed, 'abandoned')
      setReviewing(false)
      return
    }
    setOutcome('pass')
    s.complete(s.elapsed, 'completed')

    const summary = summarizeElements(elements)
    let imageBase64: string | null = null
    try {
      imageBase64 = apiRef.current ? await exportScenePng(apiRef.current) : null
    } catch {
      imageBase64 = null
    }

    try {
      const res = await apiFetch('/api/design-review', {
        ...POST,
        body: JSON.stringify({
          title: challenge.title,
          brief: challenge.client_briefing,
          summary,
          imageBase64,
          scene: JSON.stringify(elements),
          session_id: s.sessionId,
        }),
      })
      const data = await res.json()
      setReview(data.review || data.error || t.reviewFallback)
    } finally {
      setReviewing(false)
    }
  }

  function onCanvasChange(elements: readonly unknown[]) {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => s.setWork(elements), 500)
  }

  if (!challenge) return <ChallengeSkeleton />

  return (
    <div className='relative flex h-screen flex-col overflow-hidden bg-white'>
      <WorkspaceHeader
        title={challenge.title}
        elapsed={s.elapsed}
        independence={s.independence}
        submitting={reviewing}
        onSubmit={submitDesign}
      />

      <div className='grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[360px_1fr_400px] lg:grid-rows-[minmax(0,1fr)]'>
        <aside className='min-h-0 overflow-y-auto border-r border-border bg-muted'>
          <BriefingPanel challenge={challenge} />
        </aside>

        <section className='relative flex min-h-0 flex-col border-r border-border'>
          <div className='flex h-10 shrink-0 items-center justify-between border-b border-border bg-muted px-4'>
            <div className='font-mono text-[12px] text-muted-foreground'>
              {t.canvasLabel}
            </div>
            <Button
              size='xs'
              variant='ghost'
              onClick={askAnalysis}
              disabled={s.thinking}
              className='gap-1.5 rounded-md text-muted-foreground hover:text-ink'
            >
              {s.thinking ? (
                <Loader2 className='size-3.5 animate-spin' />
              ) : (
                <Wand2 className='size-3.5' />
              )}
              {t.askAnalysis}
            </Button>
          </div>
          <div className='relative min-h-0 flex-1'>
            {s.ready ? (
              <DesignCanvas
                initialElements={s.work}
                onApi={(api) => {
                  apiRef.current = api
                }}
                onChange={onCanvasChange}
              />
            ) : (
              <div className='grid h-full place-items-center text-muted-foreground'>
                <Loader2 className='size-4 animate-spin' />
              </div>
            )}
          </div>
        </section>

        <aside className='flex min-h-0 flex-col border-l border-border bg-muted'>
          <ChatPanel
            messages={s.messages}
            scrollRef={s.scrollRef}
            thinking={s.thinking}
            input={s.input}
            setInput={s.setInput}
            sendUser={sendUser}
            askHint={askHint}
            hintsUsed={s.hintsUsed}
            hintsRemaining={s.hintsRemaining}
            onSolve={askSolve}
            onBuy={s.buyHints}
          />
        </aside>
      </div>

      <AnimatePresence>
        {reviewOpen && (
          <ReviewModal
            review={review}
            reviewing={reviewing}
            independence={s.independence}
            hintsUsed={s.hintsUsed}
            elapsed={s.elapsed}
            tests={null}
            outcome={outcome}
            sessionId={s.sessionId}
            onClose={() => setReviewOpen(false)}
            onComplete={() => router.push('/dashboard')}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
