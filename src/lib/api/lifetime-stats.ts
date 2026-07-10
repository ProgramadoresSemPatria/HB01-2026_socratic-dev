import { supabaseAdmin } from '@/lib/supabase/server'

// Lifetime stats derived from the source tables. The denormalized
// profiles.total_challenges_completed / total_hints_used columns are never
// incremented anywhere, so they are permanently stale — always compute from
// sessions/hints_used. Definitions match the dashboard: distinct challenges
// completed, and real hints only (solve rows excluded).
export async function lifetimeStats(userId: string): Promise<{
  challengesCompleted: number
  hintsUsed: number
}> {
  const [sessionsR, hintsR] = await Promise.all([
    supabaseAdmin
      .from('sessions')
      .select('challenge_id')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .limit(2000),
    supabaseAdmin
      .from('hints_used')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_solve', false),
  ])
  const distinct = new Set((sessionsR.data ?? []).map((s) => s.challenge_id))
  return {
    challengesCompleted: distinct.size,
    hintsUsed: hintsR.count ?? 0,
  }
}
