'use client'

import { Button } from '@/components/ui/button'
import type { RunnerLanguage } from '@/domain/stacks'
import { runCode } from '@/features/runner/run-code'
import type { RunResult } from '@/features/runner/types'
import { track } from '@/lib/analytics'
import { apiFetch } from '@/lib/api/client'
import { useLocale, useT } from '@/lib/i18n'
import { useIsDark } from '@/lib/theme'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'
import {
  CheckCircle2,
  Loader2,
  PlayCircle,
  Sparkles,
  Terminal,
  XCircle,
} from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useSocraticSession } from '../hooks/use-socratic-session'
import type { Challenge } from '../types'
import { challengeIntro, challengeLanguage, starterCode } from '../utils'
import { BriefingPanel } from './briefing-panel'
import { ChallengeSkeleton } from './challenge-skeleton'
import { ChatPanel } from './chat-panel'
import { LineCitationContext } from './formatted-text'
import { ReactPreview } from './react-preview'
import { ReviewModal } from './review-modal'
import { RunTerminal } from './run-terminal'
import { WorkspaceHeader } from './workspace-header'

const copy = {
  en: {
    loadingEditor: 'Loading editor...',
    replyFallback: "Couldn't respond right now.",
    hintUnavailable: 'Hint unavailable.',
    solutionApplied:
      "Here's the solution as a diff — study it and apply when it makes sense.",
    askTutor: 'Ask the tutor',
    selectionMsg: (a: number, b: number, code: string) =>
      `${a === b ? `About line ${a}` : `About lines ${a}–${b}`}:\n\`\`\`\n${code}\n\`\`\`\nCan you guide me through this part?`,
    proposedSolution: 'Proposed solution — review the diff before applying',
    apply: 'Apply',
    discard: 'Discard',
    teachDecisions: 'Key decisions:',
    teachThink: 'Now you, before moving on:',
    solveFallback: "Couldn't solve it right now.",
    noSolutionYet:
      "You haven't written a solution yet. Implement something in the editor and submit again.",
    reviewFallback: "Couldn't generate the review.",
    pythonNote:
      'Python is evaluated by the AI on submit. Click "Submit" to get Socratic feedback.',
    run: 'Run',
    statusRunning: 'running',
    statusPassed: (n: number, total: number) => `${n}/${total} passed`,
    statusFailed: (n: number, total: number) => `${n}/${total} failed`,
    statusError: 'error',
    toggleTerminal: 'Toggle terminal',
    errNetwork: 'Lost connection to the tutor — try again.',
    notFound: 'Challenge not found',
    backToDashboard: 'Back to dashboard',
    panelBriefing: 'Briefing',
    panelWork: 'Code',
    panelTutor: 'Tutor',
  },
  pt: {
    loadingEditor: 'Carregando editor...',
    replyFallback: 'Não consegui responder agora.',
    hintUnavailable: 'Hint indisponível.',
    solutionApplied:
      'Preparei a solução como diff — estude e aplique quando fizer sentido.',
    askTutor: 'Perguntar ao tutor',
    selectionMsg: (a: number, b: number, code: string) =>
      `${a === b ? `Sobre a linha ${a}` : `Sobre as linhas ${a}–${b}`}:\n\`\`\`\n${code}\n\`\`\`\nPode me guiar nesse trecho?`,
    proposedSolution: 'Solução proposta — revise o diff antes de aplicar',
    apply: 'Aplicar',
    discard: 'Descartar',
    teachDecisions: 'Decisões-chave:',
    teachThink: 'Agora você, antes de seguir:',
    solveFallback: 'Não consegui resolver agora.',
    noSolutionYet:
      'Você ainda não escreveu uma solução. Implemente algo no editor e submeta de novo.',
    reviewFallback: 'Não foi possível gerar o review.',
    pythonNote:
      'Python é avaliado pela IA ao submeter. Clique em "Submeter" para receber o feedback socrático.',
    run: 'Rodar',
    statusRunning: 'rodando',
    statusPassed: (n: number, total: number) => `${n}/${total} passaram`,
    statusFailed: (n: number, total: number) => `${n}/${total} falharam`,
    statusError: 'erro',
    toggleTerminal: 'Abrir/fechar terminal',
    errNetwork: 'Sem conexão com o tutor — tente de novo.',
    notFound: 'Desafio não encontrado',
    backToDashboard: 'Voltar ao dashboard',
    panelBriefing: 'Briefing',
    panelWork: 'Código',
    panelTutor: 'Tutor',
  },
}

function EditorLoading() {
  const t = useT(copy)
  return (
    <div className='flex flex-1 items-center justify-center text-sm text-muted-foreground'>
      <Loader2 className='mr-2 size-4 animate-spin' /> {t.loadingEditor}
    </div>
  )
}

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <EditorLoading />,
})

const DiffEditor = dynamic(
  () => import('@monaco-editor/react').then((m) => m.DiffEditor),
  { ssr: false, loading: () => <EditorLoading /> },
)

const REACT_EDITOR_TYPES = `
declare const React: any
declare namespace JSX {
  interface IntrinsicElements { [elemName: string]: any }
  interface Element {}
  interface ElementChildrenAttribute { children: {} }
}
declare module 'react' {
  export type ReactNode = any
  export type CSSProperties = any
  export type FC<P = any> = (props: P) => any
  export function useState<T = any>(
    initial?: T | (() => T),
  ): [T, (v: T | ((p: T) => T)) => void]
  export function useEffect(fn: () => any, deps?: any[]): void
  export function useMemo<T = any>(fn: () => T, deps?: any[]): T
  export function useCallback<T extends (...a: any[]) => any>(
    fn: T,
    deps?: any[],
  ): T
  export function useRef<T = any>(initial?: T): { current: T }
  export function useReducer(...args: any[]): any
  export function useContext(...args: any[]): any
  export function createContext(...args: any[]): any
  const ReactDefault: any
  export default ReactDefault
}
`

type MonacoInstance = Parameters<
  NonNullable<React.ComponentProps<typeof MonacoEditor>['beforeMount']>
>[0]

type EditorInstance = Parameters<
  NonNullable<React.ComponentProps<typeof MonacoEditor>['onMount']>
>[0]

function setupMonaco(monaco: MonacoInstance) {
  const ts = monaco.languages.typescript
  ts.typescriptDefaults.setCompilerOptions({
    jsx: ts.JsxEmit.React,
    target: ts.ScriptTarget.ES2020,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    allowNonTsExtensions: true,
    esModuleInterop: true,
  })
  ts.typescriptDefaults.addExtraLib(
    REACT_EDITOR_TYPES,
    'file:///node_modules/@types/react/index.d.ts',
  )
}

const POST = { method: 'POST', headers: { 'content-type': 'application/json' } }

export function CodeChallengeWorkspace({ user: _user }: { user: User }) {
  const router = useRouter()
  const t = useT(copy)
  const { locale } = useLocale()
  const isDark = useIsDark()
  const [challenge, setChallenge] = React.useState<Challenge | null>(null)
  const [loadError, setLoadError] = React.useState(false)
  const [activePanel, setActivePanel] = React.useState<
    'brief' | 'work' | 'chat'
  >('brief')
  const [reviewOpen, setReviewOpen] = React.useState(false)

  const s = useSocraticSession<string>({
    challenge: challenge ? { id: challenge.id } : null,
    initialWork: challenge ? starterCode(challenge, locale) : '',
    initialMessages: challenge
      ? [{ role: 'ai', text: challengeIntro(challenge, locale) }]
      : [],
    paused: reviewOpen,
  })

  const [review, setReview] = React.useState<string | null>(null)
  const [reviewing, setReviewing] = React.useState(false)
  const [running, setRunning] = React.useState(false)
  const [result, setResult] = React.useState<RunResult | null>(null)
  const [showPanel, setShowPanel] = React.useState(false)
  const [submitTests, setSubmitTests] = React.useState<{
    passed: number
    total: number
  } | null>(null)
  const [outcome, setOutcome] = React.useState<'pass' | 'fail'>('pass')
  const [pendingSolution, setPendingSolution] = React.useState<string | null>(
    null,
  )
  const [selAction, setSelAction] = React.useState<{
    top: number
    left: number
  } | null>(null)
  const editorRef = React.useRef<EditorInstance | null>(null)
  const monacoRef = React.useRef<MonacoInstance | null>(null)
  const askSelectionRef = React.useRef<() => void>(() => {})
  const [cursorPos, setCursorPos] = React.useState({ line: 1, col: 1 })
  const [problems, setProblems] = React.useState(0)

  const language: RunnerLanguage = challenge
    ? challengeLanguage(challenge.stack)
    : 'ts'

  React.useEffect(() => {
    let active = true
    ;(async () => {
      const id =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('id')
          : null
      const query = supabase.from('challenges').select('*')
      const { data, error } = id
        ? await query.eq('id', id).single()
        : await query.order('created_at', { ascending: true }).limit(1).single()
      if (!active) return
      if (error || !data) setLoadError(true)
      else setChallenge(data as unknown as Challenge)
    })().catch(() => {
      if (active) setLoadError(true)
    })
    return () => {
      active = false
    }
  }, [])

  async function sendTutorMessage(text: string) {
    if (!text.trim() || s.thinking || !challenge) return
    const next = [...s.messages, { role: 'user' as const, text: text.trim() }]
    s.setMessages(next)
    s.setThinking(true)
    try {
      const res = await apiFetch('/api/tutor', {
        ...POST,
        body: JSON.stringify({
          mode: 'reply',
          messages: next,
          code: s.work,
          title: challenge.title,
          briefing: challenge.client_briefing,
        }),
      })
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        s.pushMessage({ role: 'ai', text: data.error || t.replyFallback })
      } else {
        await s.streamIntoMessage(res, { fallback: t.replyFallback })
      }
    } catch {
      s.pushMessage({ role: 'ai', text: t.errNetwork })
    } finally {
      s.setThinking(false)
    }
  }

  async function sendUser() {
    const text = s.input.trim()
    if (!text) return
    s.setInput('')
    await sendTutorMessage(text)
  }

  function askAboutSelection() {
    const editor = editorRef.current
    const sel = editor?.getSelection()
    const model = editor?.getModel()
    if (!editor || !sel || !model || sel.isEmpty()) return
    const text = model.getValueInRange(sel)
    if (!text.trim()) return
    setSelAction(null)
    track('selection_asked', { challenge_id: challenge?.id })
    void sendTutorMessage(
      t.selectionMsg(sel.startLineNumber, sel.endLineNumber, text),
    )
    if (window.innerWidth < 1024) setActivePanel('chat')
  }
  React.useEffect(() => {
    askSelectionRef.current = askAboutSelection
  })

  function highlightLines(start: number, end?: number) {
    const editor = editorRef.current
    const monaco = monacoRef.current
    const model = editor?.getModel()
    if (!editor || !monaco || !model) return
    const last = model.getLineCount()
    const a = Math.min(Math.max(1, start), last)
    const b = Math.min(Math.max(a, end ?? a), last)
    if (window.innerWidth < 1024) setActivePanel('work')
    editor.revealLinesInCenterIfOutsideViewport(a, b)
    const decorations = editor.createDecorationsCollection([
      {
        range: new monaco.Range(a, 1, b, model.getLineMaxColumn(b)),
        options: { isWholeLine: true, className: 'tutor-line-flash' },
      },
    ])
    window.setTimeout(() => decorations.clear(), 2400)
  }

  function onEditorMount(editor: EditorInstance, monaco: MonacoInstance) {
    editorRef.current = editor
    monacoRef.current = monaco
    editor.onDidChangeCursorPosition(
      (e: { position: { lineNumber: number; column: number } }) => {
        setCursorPos({ line: e.position.lineNumber, col: e.position.column })
      },
    )
    monaco.editor.onDidChangeMarkers((uris: readonly { toString(): string }[]) => {
      const model = editor.getModel()
      if (
        !model ||
        !uris.some(
          (u: { toString(): string }) =>
            u.toString() === model.uri.toString(),
        )
      )
        return
      setProblems(
        monaco.editor
          .getModelMarkers({ resource: model.uri })
          .filter(
            (mk: { severity: number }) =>
              mk.severity === monaco.MarkerSeverity.Error,
          ).length,
      )
    })
    const update = () => {
      const sel = editor.getSelection()
      if (!sel || sel.isEmpty()) {
        setSelAction(null)
        return
      }
      const pos = editor.getScrolledVisiblePosition(sel.getStartPosition())
      if (!pos) {
        setSelAction(null)
        return
      }
      setSelAction({
        top: Math.max(pos.top - 40, 6),
        left: Math.max(pos.left, 12),
      })
    }
    editor.onDidChangeCursorSelection(update)
    editor.onDidScrollChange(update)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () =>
      askSelectionRef.current(),
    )
  }

  async function askHint(level: 1 | 2 | 3) {
    if (s.thinking || !challenge) return
    s.setThinking(true)
    try {
      const res = await apiFetch('/api/tutor', {
        ...POST,
        body: JSON.stringify({
          mode: 'hint',
          hintLevel: level,
          messages: s.messages,
          code: s.work,
          title: challenge.title,
          briefing: challenge.client_briefing,
          session_id: s.sessionId,
        }),
      })
      const remaining = res.headers.get('X-Hints-Remaining')
      if (remaining != null) s.syncRemaining(Number(remaining))
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        s.pushMessage({
          role: 'ai',
          text: data.error || t.hintUnavailable,
          hintLevel: level,
        })
      } else {
        s.applyHint(level)
        await s.streamIntoMessage(res, {
          hintLevel: level,
          fallback: t.hintUnavailable,
        })
      }
    } catch {
      s.pushMessage({ role: 'ai', text: t.errNetwork })
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
          kind: 'code',
          title: challenge.title,
          briefing: challenge.client_briefing,
          work: s.work,
          tests: challenge.tests_source,
          session_id: s.sessionId,
        }),
      })
      const data = await res.json()
      s.syncRemaining(data.remaining)
      if (data.code) {
        setPendingSolution(data.code)
        setActivePanel('work')
        const teach = data.teach as
          | {
              flow?: string
              decisions?: { what: string; why: string }[]
              questions?: string[]
            }
          | undefined
        const parts: string[] = []
        if (teach?.flow) parts.push(teach.flow)
        if (teach?.decisions?.length) {
          parts.push('', `**${t.teachDecisions}**`)
          for (const d of teach.decisions) {
            parts.push(`- **${d.what}**: ${d.why}`)
          }
        }
        if (teach?.questions?.length) {
          parts.push('', `**${t.teachThink}**`)
          for (const q of teach.questions) parts.push(`- ${q}`)
        }
        s.pushMessage({
          role: 'ai',
          text: parts.length ? parts.join('\n') : t.solutionApplied,
        })
      } else {
        s.pushMessage({
          role: 'ai',
          text: data.error || t.solveFallback,
        })
      }
    } catch {
      s.pushMessage({ role: 'ai', text: t.errNetwork })
    } finally {
      s.setThinking(false)
    }
  }

  async function submitReview() {
    if (!challenge || reviewing) return
    track('challenge_submitted', { challenge_id: challenge.id, kind: 'code' })
    setReviewOpen(true)
    setReviewing(true)
    setReview(null)
    setSubmitTests(null)

    const code = s.work
    const touched =
      code.trim().length > 0 &&
      code.trim() !== starterCode(challenge, locale).trim()
    if (!touched) {
      setOutcome('fail')
      setReview(t.noSolutionYet)
      s.complete(s.elapsed, 'abandoned')
      setReviewing(false)
      return
    }

    let passed = 0
    let total = 0
    if (challenge.tests_source && language !== 'react' && language !== 'py') {
      const r = await runCode(
        { code, language, testsSource: challenge.tests_source },
        { timeoutMs: 5000 },
      )
      total = r.tests.length
      passed = r.tests.filter((t) => t.passed).length
      setResult(r)
      if (passed < total) setShowPanel(true)
    }
    setSubmitTests({ passed, total })
    const solved = total === 0 || passed === total
    setOutcome(solved ? 'pass' : 'fail')
    s.complete(s.elapsed, solved ? 'completed' : 'abandoned')

    try {
      const res = await apiFetch('/api/review', {
        ...POST,
        body: JSON.stringify({
          code,
          title: challenge.title,
          briefing: challenge.client_briefing,
          tests_passed: passed,
          tests_total: total,
          session_id: s.sessionId,
        }),
      })
      const data = await res.json()
      setReview(data.review || data.error || t.reviewFallback)
    } catch {
      setReviewOpen(false)
      s.pushMessage({ role: 'ai', text: t.errNetwork })
    } finally {
      setReviewing(false)
    }
  }

  async function run() {
    if (running || !challenge) return
    setShowPanel(true)
    if (language === 'react') return
    if (language === 'py') {
      setResult({
        logs: [{ level: 'info', text: t.pythonNote }],
        tests: [],
        ok: false,
        durationMs: 0,
      })
      return
    }
    setRunning(true)
    setResult(null)
    const r = await runCode(
      { code: s.work, language, testsSource: challenge.tests_source },
      { timeoutMs: 5000 },
    )
    setResult(r)
    setRunning(false)
    if (!r.ok) setShowPanel(true)
  }

  if (loadError)
    return (
      <div className='flex h-dvh flex-col items-center justify-center gap-4 bg-background'>
        <span className='font-mono text-4xl text-muted-foreground'>∅</span>
        <h1 className='text-xl font-light'>{t.notFound}</h1>
        <Button variant='outline' onClick={() => router.push('/dashboard')}>
          {t.backToDashboard}
        </Button>
      </div>
    )

  if (!challenge) return <ChallengeSkeleton />

  return (
    <div className='relative flex h-dvh flex-col overflow-hidden'>
      <WorkspaceHeader
        title={challenge.title}
        elapsed={s.elapsed}
        independence={s.independence}
        submitting={reviewing}
        onSubmit={submitReview}
      />

      <div className='flex shrink-0 items-center gap-1 border-b border-border bg-muted px-4 py-2 lg:hidden'>
        {(['brief', 'work', 'chat'] as const).map((p) => (
          <button
            key={p}
            type='button'
            onClick={() => setActivePanel(p)}
            className={cn(
              'rounded-full px-3 py-1 font-mono text-[12px] transition-colors',
              activePanel === p
                ? 'bg-ink text-background'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {p === 'brief'
              ? t.panelBriefing
              : p === 'work'
                ? t.panelWork
                : t.panelTutor}
          </button>
        ))}
      </div>

      <div className='flex min-h-0 flex-1 flex-col overflow-hidden lg:grid lg:grid-cols-[360px_1fr_400px] lg:grid-rows-[minmax(0,1fr)]'>
        <aside
          className={cn(
            'min-h-0 overflow-y-auto border-border bg-muted lg:border-r',
            activePanel === 'brief' ? 'flex-1' : 'hidden lg:block',
          )}
        >
          <BriefingPanel challenge={challenge} />
        </aside>

        <section
          className={cn(
            'relative min-h-0 flex-col',
            activePanel === 'work' ? 'flex flex-1' : 'hidden lg:flex',
          )}
        >
          <div className='flex h-10 items-center justify-between border-b border-border bg-muted px-4'>
            <div className='flex items-center gap-2 font-mono text-[12px] text-muted-foreground'>
              <Code2Tag language={language} />
              <span className='hidden sm:inline'>solucao.{language === 'js' ? 'js' : language === 'py' ? 'py' : language === 'react' ? 'tsx' : 'ts'}</span>
              <span className='ml-1 hidden size-1 rounded-full bg-warning/70 sm:inline-block' />
              <span className='hidden text-[11px] text-warning-foreground/80 sm:inline'>unsaved</span>
            </div>
            <div className='flex items-center gap-1.5'>
              {language !== 'react' && (
                <RunStatusChip
                  running={running}
                  result={result}
                  onClick={() => setShowPanel((v) => !v)}
                />
              )}
              <Button
                size='xs'
                variant='ghost'
                onClick={() => setShowPanel((v) => !v)}
                aria-label={language === 'react' ? 'Preview' : language === 'py' ? 'Console' : 'Terminal'}
                className={cn(
                  'gap-1.5 rounded-md hover:text-foreground',
                  showPanel ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                <Terminal className='size-3.5' />
                <span className='hidden sm:inline'>
                  {language === 'react' ? 'Preview' : language === 'py' ? 'Console' : 'Terminal'}
                </span>
              </Button>
              <Button
                size='xs'
                variant='ghost'
                onClick={run}
                disabled={running}
                aria-label={t.run}
                className='gap-1.5 rounded-md text-muted-foreground hover:text-foreground'
              >
                {running ? (
                  <Loader2 className='size-3.5 animate-spin' />
                ) : (
                  <PlayCircle className='size-3.5' />
                )}
                <span className='hidden sm:inline'>{t.run}</span>
              </Button>
            </div>
          </div>
          <div className='relative min-h-0 flex-1'>
            {pendingSolution === null ? (
              <MonacoEditor
                height='100%'
                language={language === 'js' ? 'javascript' : language === 'py' ? 'python' : 'typescript'}
                path={
                  language === 'react'
                    ? 'file:///solucao.tsx'
                    : language === 'py'
                      ? 'file:///solucao.py'
                      : language === 'js'
                        ? 'file:///solucao.js'
                        : 'file:///solucao.ts'
                }
                beforeMount={setupMonaco}
                onMount={onEditorMount}
                value={s.work}
                onChange={(v) => s.setWork(v ?? '')}
                theme={isDark ? 'vs-dark' : 'light'}
                options={{
                  fontSize: 14,
                  fontFamily: 'var(--font-mono)',
                  fontLigatures: true,
                  minimap: { enabled: false },
                  padding: { top: 20, bottom: 20 },
                  scrollBeyondLastLine: false,
                  lineNumbersMinChars: 3,
                  renderLineHighlight: 'none',
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  smoothScrolling: true,
                  tabSize: 2,
                }}
              />
            ) : (
              <>
                <DiffEditor
                  height='100%'
                  language={language === 'js' ? 'javascript' : language === 'py' ? 'python' : 'typescript'}
                  original={s.work}
                  modified={pendingSolution}
                  theme={isDark ? 'vs-dark' : 'light'}
                  options={{
                    readOnly: true,
                    renderSideBySide: false,
                    fontSize: 14,
                    fontFamily: 'var(--font-mono)',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbersMinChars: 3,
                  }}
                />
                <div className='absolute inset-x-0 bottom-0 z-10 flex items-center justify-between gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur'>
                  <span className='min-w-0 truncate text-[13px] text-muted-foreground'>
                    {t.proposedSolution}
                  </span>
                  <div className='flex shrink-0 gap-2'>
                    <Button
                      size='xs'
                      variant='ghost'
                      onClick={() => setPendingSolution(null)}
                    >
                      {t.discard}
                    </Button>
                    <Button
                      size='xs'
                      variant='ink'
                      onClick={() => {
                        s.setWork(pendingSolution)
                        setPendingSolution(null)
                      }}
                    >
                      {t.apply}
                    </Button>
                  </div>
                </div>
              </>
            )}
            {selAction && pendingSolution === null && (
              <button
                type='button'
                onMouseDown={(e) => e.preventDefault()}
                onClick={askAboutSelection}
                style={{ top: selAction.top, left: selAction.left }}
                className='absolute z-10 flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-[12px] font-medium text-ink shadow-md transition-colors duration-150 hover:bg-secondary'
              >
                <Sparkles className='size-3.5 text-primary' strokeWidth={1.5} />
                {t.askTutor}
                <span className='font-mono text-[10px] text-muted-foreground'>
                  ⌘K
                </span>
              </button>
            )}
          </div>
          {pendingSolution === null && (
            <div className='flex h-6 shrink-0 items-center justify-between border-t border-border bg-muted px-4 font-mono text-[11px] text-muted-foreground'>
              <div className='flex items-center gap-3'>
                <span>{language === 'react' ? 'tsx' : language}</span>
                <span className={cn(problems > 0 && 'text-destructive')}>
                  {problems === 0 ? '✓' : `✕ ${problems}`}
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <span className='hidden sm:inline'>⌘K → tutor</span>
                <span>
                  Ln {cursorPos.line}, Col {cursorPos.col}
                </span>
              </div>
            </div>
          )}
          {showPanel &&
            (language === 'react' ? (
              <ReactPreview code={s.work} onClose={() => setShowPanel(false)} />
            ) : (
              <RunTerminal
                result={result}
                running={running}
                onClose={() => setShowPanel(false)}
              />
            ))}
        </section>

        <aside
          className={cn(
            'min-h-0 flex-col border-border bg-muted lg:border-l',
            activePanel === 'chat' ? 'flex flex-1' : 'hidden lg:flex',
          )}
        >
          <LineCitationContext.Provider value={highlightLines}>
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
              buying={s.buying}
              buyError={s.buyError}
              bought={s.bought}
            />
          </LineCitationContext.Provider>
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
            tests={submitTests}
            outcome={outcome}
            sessionId={s.sessionId}
            solutionsHref={challenge ? `/solutions/${challenge.id}` : null}
            onClose={() => setReviewOpen(false)}
            onComplete={() => router.push('/dashboard')}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function RunStatusChip({
  running,
  result,
  onClick,
}: {
  running: boolean
  result: RunResult | null
  onClick: () => void
}) {
  const t = useT(copy)
  if (running)
    return (
      <button
        type='button'
        onClick={onClick}
        aria-label={t.toggleTerminal}
        className='flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground'
      >
        <Loader2 className='size-3 animate-spin' /> {t.statusRunning}
      </button>
    )
  if (!result) return null
  const total = result.tests.length
  const passed = result.tests.filter((x) => x.passed).length
  const failed = total - passed
  if (total === 0 && !result.error) return null
  const solved = total > 0 && failed === 0 && !result.error
  return (
    <button
      type='button'
      onClick={onClick}
      aria-label={t.toggleTerminal}
      className={cn(
        'flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] transition-colors',
        solved
          ? 'border-mint/30 bg-mint/10 text-mint hover:bg-mint/20'
          : 'border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20',
      )}
    >
      {solved ? (
        <CheckCircle2 className='size-3' />
      ) : (
        <XCircle className='size-3' />
      )}
      {total === 0
        ? t.statusError
        : solved
          ? t.statusPassed(passed, total)
          : t.statusFailed(failed, total)}
    </button>
  )
}

function Code2Tag({ language }: { language: RunnerLanguage }) {
  const label = { js: 'JS', ts: 'TS', react: 'RX', py: 'PY' }[language]
  return (
    <span className='grid size-4 place-items-center rounded border border-primary/20 bg-primary/10 text-[8px] font-semibold text-primary uppercase'>
      {label}
    </span>
  )
}
