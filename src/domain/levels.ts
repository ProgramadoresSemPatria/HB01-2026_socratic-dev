export type LevelId = 'beginner' | 'intermediate' | 'advanced'
export type LevelUiId = 'starter' | 'junior' | 'mid' | 'advanced'

export type Level = {
  id: LevelId
  uiId: LevelUiId
  label: string
}

export const LEVELS: readonly Level[] = [
  { id: 'beginner', uiId: 'starter', label: 'Iniciante' },
  { id: 'intermediate', uiId: 'mid', label: 'Intermediário' },
  { id: 'advanced', uiId: 'advanced', label: 'Avançado' },
] as const

export type LevelUiOption = { uiId: LevelUiId; id: LevelId }

export const LEVEL_UI_OPTIONS: readonly LevelUiOption[] = [
  { uiId: 'starter', id: 'beginner' },
  { uiId: 'junior', id: 'beginner' },
  { uiId: 'mid', id: 'intermediate' },
  { uiId: 'advanced', id: 'advanced' },
] as const

export function levelByUiId(uiId: string): LevelUiOption | undefined {
  return LEVEL_UI_OPTIONS.find((l) => l.uiId === uiId)
}

export function levelById(id: string): Level | undefined {
  return LEVELS.find((l) => l.id === id)
}
