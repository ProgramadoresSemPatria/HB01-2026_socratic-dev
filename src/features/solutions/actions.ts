'use server'

import { authActionUser } from '@/lib/api/guard'
import { supabaseAdmin } from '@/lib/supabase/server'

export type CommunitySolution = {
  name: string
  code: string
  independence: number | null
  isMe: boolean
  submittedAt: string
}

export type CommunitySolutionsResult =
  | { title: string; solutions: CommunitySolution[] }
  | { error: 'auth' | 'not-found' | 'not-completed' }

function publicName(
  displayName: string | null,
  email: string | null,
): string {
  if (displayName?.trim()) return displayName.trim()
  const local = (email ?? '').split('@')[0]
  if (!local) return 'anon'
  return local.length <= 3 ? `${local}***` : `${local.slice(0, 3)}***`
}

// Solutions are gated behind completing the challenge yourself — this page
// must never work as a free answer sheet.
export async function getCommunitySolutions(
  token: string,
  challengeId: string,
): Promise<CommunitySolutionsResult> {
  const a = await authActionUser(token)
  if ('error' in a) return { error: 'auth' }

  const [challengeR, ownR] = await Promise.all([
    supabaseAdmin
      .from('challenges')
      .select('title')
      .eq('id', challengeId)
      .maybeSingle(),
    supabaseAdmin
      .from('sessions')
      .select('id')
      .eq('user_id', a.userId)
      .eq('challenge_id', challengeId)
      .eq('status', 'completed')
      .limit(1)
      .maybeSingle(),
  ])
  if (!challengeR.data) return { error: 'not-found' }
  if (!ownR.data) return { error: 'not-completed' }

  const { data: subs } = await supabaseAdmin
    .from('code_submissions')
    .select(
      'user_id, code, submitted_at, sessions!inner(challenge_id, status, independence)',
    )
    .eq('sessions.challenge_id', challengeId)
    .eq('sessions.status', 'completed')
    .order('submitted_at', { ascending: false })
    .limit(300)

  const rows = (subs ?? []) as unknown as {
    user_id: string
    code: string
    submitted_at: string
    sessions: { independence: number | null }
  }[]
  if (!rows.length) {
    return { title: String(challengeR.data.title), solutions: [] }
  }

  const userIds = [...new Set(rows.map((r) => r.user_id))]
  const { data: profs } = await supabaseAdmin
    .from('profiles')
    .select('id, display_name, email, share_solutions')
    .in('id', userIds)
  const byId = new Map(
    ((profs ?? []) as unknown as {
      id: string
      display_name: string | null
      email: string | null
      share_solutions: boolean
    }[]).map((p) => [p.id, p]),
  )

  const seen = new Set<string>()
  const solutions: CommunitySolution[] = []
  for (const r of rows) {
    if (seen.has(r.user_id)) continue
    seen.add(r.user_id)
    const prof = byId.get(r.user_id)
    const isMe = r.user_id === a.userId
    if (!isMe && !prof?.share_solutions) continue
    if (!r.code?.trim()) continue
    solutions.push({
      name: publicName(prof?.display_name ?? null, prof?.email ?? null),
      code: r.code,
      independence: r.sessions?.independence ?? null,
      isMe,
      submittedAt: r.submitted_at,
    })
  }
  solutions.sort((x, y) => Number(y.isMe) - Number(x.isMe))

  return { title: String(challengeR.data.title), solutions }
}

export async function setShareSolutions(
  token: string,
  share: boolean,
): Promise<{ ok: true } | { error: string }> {
  const a = await authActionUser(token)
  if ('error' in a) return { error: 'Não autenticado.' }
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ share_solutions: share })
    .eq('id', a.userId)
  if (error) return { error: 'Não foi possível salvar.' }
  return { ok: true }
}
