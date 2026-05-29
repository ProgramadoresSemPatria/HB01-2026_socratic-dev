export function hintCost(level: 1 | 2 | 3): number {
  return level * 4
}

export function applyHintPenalty(score: number, level: 1 | 2 | 3): number {
  return Math.max(0, score - hintCost(level))
}

export function independenceTier(score: number): 'high' | 'mid' | 'low' {
  if (score > 70) return 'high'
  if (score > 40) return 'mid'
  return 'low'
}
