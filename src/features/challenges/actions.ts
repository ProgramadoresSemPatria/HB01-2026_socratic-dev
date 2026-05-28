'use server'

import { supabaseAdmin } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function startSession(args: {
  userId: string
  challengeId: string
}): Promise<{ id: string } | null> {
  const { data } = await supabaseAdmin
    .from('sessions')
    .insert({ user_id: args.userId, challenge_id: args.challengeId })
    .select()
    .single()
  return data ? { id: (data as { id: string }).id } : null
}

export async function completeSession(args: {
  id: string
  status?: 'completed' | 'abandoned'
  durationSeconds?: number
}): Promise<void> {
  const status = args.status ?? 'completed'
  const update: Record<string, unknown> = {
    status,
    completed_at: new Date().toISOString(),
  }
  if (typeof args.durationSeconds === 'number') {
    update.duration_seconds = args.durationSeconds
  }
  await supabaseAdmin.from('sessions').update(update).eq('id', args.id)
  revalidatePath('/dashboard')
  revalidatePath('/profile')
}

export type SessionRow = {
  id: string
  challenge_id: string
  status: string
  started_at: string
  challenges: { title: string; stack: string; kind?: string } | null
}

export async function listSessionsForUser(
  userId: string,
): Promise<SessionRow[]> {
  const { data } = await supabaseAdmin
    .from('sessions')
    .select(
      'id, challenge_id, status, started_at, challenges(title, stack, kind)',
    )
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
  return (data ?? []) as unknown as SessionRow[]
}
