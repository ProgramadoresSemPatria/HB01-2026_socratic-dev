export const SOLVE_CAP = 0

export function hintCost(level: 1 | 2 | 3): number {
  return level * 4
}

export function computeIndependence(
  hints: { hint_level: number; is_solve?: boolean }[],
): number {
  if (hints.some((h) => h.is_solve)) return SOLVE_CAP
  const penalty = hints.reduce((sum, h) => sum + h.hint_level * 4, 0)
  return Math.max(0, 100 - penalty)
}

export function applyHintPenalty(score: number, level: 1 | 2 | 3): number {
  return Math.max(0, score - hintCost(level))
}

export function independenceTier(score: number): 'high' | 'mid' | 'low' {
  if (score > 70) return 'high'
  if (score > 40) return 'mid'
  return 'low'
}
