import { levelById } from '@/domain/levels'
import { RunnerLanguage } from '@/domain/stacks'
import type { Locale } from '@/lib/i18n'
import type { Challenge } from './types'

export const LEVEL_LABEL: Record<string, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
}

export function levelLabel(level: string): string {
  return levelById(level)?.label ?? LEVEL_LABEL[level] ?? level
}

export function challengeLanguage(stack: string): RunnerLanguage {
  if (stack === 'javascript') return 'js'
  if (stack === 'react') return 'react'
  if (stack === 'python' || stack === 'py') return 'py'
  return 'ts'
}

const starterCopy = {
  en: {
    fnName: 'solution',
    todo: 'TODO: implement your solution here',
    componentTodo: 'TODO: implement your component here',
    readBrief: 'Read the brief on the left and implement the solution.',
    exportNote: 'Export your function so the tests can reach it (exports.<name>).',
    params: 'parameters',
  },
  pt: {
    fnName: 'solucao',
    todo: 'TODO: implemente sua solução aqui',
    componentTodo: 'TODO: implemente seu componente aqui',
    readBrief: 'Leia o briefing à esquerda e implemente a solução.',
    exportNote:
      'Exporte sua função para que os testes possam acessá-la (exports.<nome>).',
    params: 'parâmetros',
  },
} as const

export function starterCode(challenge: Challenge, locale: Locale = 'en'): string {
  if (challenge.initial_code) return challenge.initial_code
  const c = starterCopy[locale] ?? starterCopy.en
  if (challenge.stack === 'python' || challenge.stack === 'py') {
    return [
      `# ${challenge.title}`,
      ``,
      `def ${c.fnName}():`,
      `    # ${c.todo}`,
      `    pass`,
      ``,
    ].join('\n')
  }
  if (challenge.stack === 'react') {
    return [
      `// ${challenge.title}`,
      ``,
      `export default function App() {`,
      `  // ${c.componentTodo}`,
      `  return <div></div>`,
      `}`,
      ``,
    ].join('\n')
  }
  return [
    `// ${challenge.title}`,
    `//`,
    `// ${challenge.description || c.readBrief}`,
    `// ${c.exportNote}`,
    ``,
    `export function ${c.fnName}(/* ${c.params} */) {`,
    `  // ${c.todo}`,
    ``,
    `}`,
    ``,
  ].join('\n')
}

export function challengeIntro(challenge: Challenge, locale: Locale = 'en'): string {
  if (challenge.intro) return challenge.intro
  return locale === 'pt'
    ? 'Olá. Leia o briefing à esquerda e me diga: qual o primeiro passo pra resolver isso?'
    : 'Hi. Read the brief on the left and tell me: what is the first step to solve this?'
}
