export type Stats = {
  total_completed: number
  total_hints: number
  avg_hints_per_session: number
  independence_score: number
  streak_days: number
  week_progress: { day: string; value: number }[]
}
