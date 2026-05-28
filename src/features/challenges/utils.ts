import { levelById } from '@/domain/levels'
import { RunnerLanguage } from '@/domain/stacks'
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
  return stack === 'javascript' ? 'js' : 'ts'
}

export function starterCode(challenge: Challenge): string {
  if (challenge.initial_code) return challenge.initial_code
  return [
    `// ${challenge.title}`,
    `//`,
    `// ${challenge.description || 'Leia o briefing à esquerda e implemente a solução.'}`,
    `// Exporte sua função para que os testes possam acessá-la (exports.<nome>).`,
    ``,
    `export function solucao(/* parâmetros */) {`,
    `  // TODO: implemente sua solução aqui`,
    ``,
    `}`,
    ``,
  ].join('\n')
}

export function challengeIntro(challenge: Challenge): string {
  return (
    challenge.intro ||
    'Olá. Leia o briefing à esquerda e me diga: qual o primeiro passo pra resolver isso?'
  )
}
