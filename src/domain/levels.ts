export type LevelId = 'beginner' | 'intermediate' | 'advanced'
export type LevelUiId = 'starter' | 'junior' | 'mid' | 'advanced'

export type Level = {
  id: LevelId
  uiId: LevelUiId
  label: string
  tagline: string
  description: string
  intensity: 1 | 2 | 3 | 4
}

export const LEVELS: readonly Level[] = [
  {
    id: 'beginner',
    uiId: 'starter',
    label: 'Iniciante',
    tagline: 'Comecei agora',
    description: 'Variáveis, condicionais, loops, arrays. Sem traumas.',
    intensity: 1,
  },
  {
    id: 'beginner',
    uiId: 'junior',
    label: 'Júnior',
    tagline: 'Já fiz alguns projetos',
    description: 'Funções, objetos, fetch, async/await. Confortável com docs.',
    intensity: 2,
  },
  {
    id: 'intermediate',
    uiId: 'mid',
    label: 'Intermediário',
    tagline: 'Quero crescer',
    description: 'Padrões, arquitetura, performance. Code review mais duro.',
    intensity: 3,
  },
  {
    id: 'advanced',
    uiId: 'advanced',
    label: 'Avançado',
    tagline: 'Quero nível big tech',
    description:
      'Algoritmos, complexidade ótima, edge cases. Pegada de entrevista FAANG.',
    intensity: 4,
  },
] as const

export function levelByUiId(uiId: string): Level | undefined {
  return LEVELS.find((l) => l.uiId === uiId)
}
export function levelById(id: string): Level | undefined {
  return LEVELS.find((l) => l.id === id)
}
