import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const user_id = searchParams.get('user_id')

  if (!user_id) {
    return Response.json({ error: 'user_id is required' }, { status: 400 })
  }

  const [sessionsResult, hintsResult, weekResult] = await Promise.all([
    supabaseAdmin
      .from('sessions')
      .select('id, status, started_at, completed_at, challenge_id')
      .eq('user_id', user_id),

    supabaseAdmin
      .from('hints_used')
      .select('hint_level, used_at, session_id')
      .eq('user_id', user_id),

    supabaseAdmin
      .from('sessions')
      .select('started_at, id')
      .eq('user_id', user_id)
      .eq('status', 'completed')
      .gte('started_at', getDateDaysAgo(7)),
  ])

  if (sessionsResult.error)
    return Response.json({ error: sessionsResult.error.message }, { status: 500 })
  if (hintsResult.error)
    return Response.json({ error: hintsResult.error.message }, { status: 500 })
  if (weekResult.error)
    return Response.json({ error: weekResult.error.message }, { status: 500 })

  const sessions = sessionsResult.data
  const hints = hintsResult.data
  const weekSessions = weekResult.data

  const completed = sessions.filter((s) => s.status === 'completed')
  const totalHints = hints.length
  const avgHintsPerSession = completed.length > 0
    ? Math.round((totalHints / completed.length) * 10) / 10
    : 0

  // Independence score: starts at 100, loses points per hint level used
  const hintPenalty = hints.reduce((sum, h) => sum + h.hint_level * 4, 0)
  const independenceScore = Math.max(0, 100 - Math.round(hintPenalty / Math.max(completed.length, 1)))

  const streak = calcStreak(completed.map((s) => s.started_at))

  const weekProgress = buildWeekProgress(weekSessions.map((s) => s.started_at))

  return Response.json({
    total_completed: completed.length,
    total_hints: totalHints,
    avg_hints_per_session: avgHintsPerSession,
    independence_score: independenceScore,
    streak_days: streak,
    week_progress: weekProgress,
  })
}

function getDateDaysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

function calcStreak(startedAtDates: string[]): number {
  if (startedAtDates.length === 0) return 0

  const days = Array.from(
    new Set(startedAtDates.map((d) => d.slice(0, 10))),
  ).sort((a, b) => b.localeCompare(a))

  const today = new Date().toISOString().slice(0, 10)
  if (days[0] !== today && days[0] !== getYesterday()) return 0

  let streak = 1
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1])
    const curr = new Date(days[i])
    const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
    if (diff === 1) streak++
    else break
  }
  return streak
}

function getYesterday(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

function buildWeekProgress(startedAtDates: string[]) {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
  const result = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const label = days[d.getDay()]
    const count = startedAtDates.filter((s) => s.startsWith(dateStr)).length
    result.push({ day: label, value: count })
  }

  return result
}
