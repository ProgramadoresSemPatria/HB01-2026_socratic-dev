'use client'

import type { RunnerLanguage } from '@/domain/stacks'
import { useT } from '@/lib/i18n'
import { Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'

const copy = {
  en: { loadingEditor: 'Loading editor...' },
  pt: { loadingEditor: 'Carregando editor...' },
}

export function EditorLoading() {
  const t = useT(copy)
  return (
    <div className='flex flex-1 items-center justify-center text-sm text-muted-foreground'>
      <Loader2 className='mr-2 size-4 animate-spin' /> {t.loadingEditor}
    </div>
  )
}

export const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <EditorLoading />,
})

export const DiffEditor = dynamic(
  () => import('@monaco-editor/react').then((m) => m.DiffEditor),
  { ssr: false, loading: () => <EditorLoading /> },
)

export type MonacoInstance = Parameters<
  NonNullable<React.ComponentProps<typeof MonacoEditor>['beforeMount']>
>[0]

export type EditorInstance = Parameters<
  NonNullable<React.ComponentProps<typeof MonacoEditor>['onMount']>
>[0]

export function monacoLanguage(language: RunnerLanguage): string {
  if (language === 'js') return 'javascript'
  if (language === 'py') return 'python'
  return 'typescript'
}

export function monacoPath(language: RunnerLanguage): string {
  if (language === 'react') return 'file:///solucao.tsx'
  if (language === 'py') return 'file:///solucao.py'
  if (language === 'js') return 'file:///solucao.js'
  return 'file:///solucao.ts'
}

// Minimal ambient types so React challenges type-check in the editor without
// shipping @types/react to the TS worker. Hooks stay loosely typed on purpose.
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

export function setupMonaco(monaco: MonacoInstance) {
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
