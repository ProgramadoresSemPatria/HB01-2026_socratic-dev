export function activityLevel(value: number, max: number): 0 | 1 | 2 | 3 | 4 {
  if (value <= 0) return 0
  const r = value / max
  if (r > 0.75) return 4
  if (r > 0.5) return 3
  if (r > 0.25) return 2
  return 1
}
