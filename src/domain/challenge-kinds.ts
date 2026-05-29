export type ChallengeKind = 'code' | 'design'

export type ChallengeKindMeta = {
  id: ChallengeKind
  label: string
  description: string
}

export const CHALLENGE_KINDS: readonly ChallengeKindMeta[] = [
  {
    id: 'code',
    label: 'Código',
    description: 'Implementar uma função com testes.',
  },
  {
    id: 'design',
    label: 'System design',
    description: 'Arquitetar serviços e fluxo de dados.',
  },
] as const

export function kindById(id: string): ChallengeKindMeta | undefined {
  return CHALLENGE_KINDS.find((k) => k.id === id)
}
