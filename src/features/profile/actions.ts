'use server'

import { authActionUser } from '@/lib/api/guard'
import { lifetimeStats } from '@/lib/api/lifetime-stats'
import { supabaseAdmin } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type Profile = {
  id: string
  email: string | null
  preferred_stack: string | null
  preferred_level: string | null
  total_challenges_completed: number
  total_hints_used: number
  share_solutions: boolean
  created_at: string
}

export async function getProfile(token: string): Promise<Profile | null> {
  const a = await authActionUser(token)
  if ('error' in a) return null
  const [{ data, error }, stats] = await Promise.all([
    supabaseAdmin.from('profiles').select('*').eq('id', a.userId).single(),
    lifetimeStats(a.userId),
  ])
  if (error) return null
  return {
    ...(data as Profile),
    total_challenges_completed: stats.challengesCompleted,
    total_hints_used: stats.hintsUsed,
  }
}

export async function updateProfile(input: {
  token: string
  preferred_stack?: string
  preferred_level?: string
}): Promise<Profile | { error: string }> {
  const a = await authActionUser(input.token)
  if ('error' in a) return a
  const [{ data, error }, stats] = await Promise.all([
    supabaseAdmin
      .from('profiles')
      .update({
        preferred_stack: input.preferred_stack,
        preferred_level: input.preferred_level,
      })
      .eq('id', a.userId)
      .select()
      .single(),
    lifetimeStats(a.userId),
  ])
  if (error) return { error: 'Não foi possível salvar o perfil.' }
  revalidatePath('/profile')
  return {
    ...(data as Profile),
    total_challenges_completed: stats.challengesCompleted,
    total_hints_used: stats.hintsUsed,
  }
}
