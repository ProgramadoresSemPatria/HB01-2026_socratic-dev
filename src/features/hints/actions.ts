'use server'

import { authActionUser } from '@/lib/api/guard'
import { addBonus, consumeHints, getBalance } from '@/lib/api/hints-server'
import { revalidatePath } from 'next/cache'
import type { HintBalance } from './types'

const BONUS_PACK_SIZE = 10
const EMPTY: HintBalance = {
  usedThisWeek: 0,
  freeLimit: 0,
  bonus: 0,
  remaining: 0,
  resetsAt: '',
}

export async function getHintBalance(token: string): Promise<HintBalance> {
  const a = await authActionUser(token)
  if ('error' in a) return EMPTY
  return getBalance(a.userId)
}

export async function logHint(args: {
  token: string
  sessionId: string
  hintLevel: 1 | 2 | 3
  cost?: number
}): Promise<{ remaining: number } | { error: string }> {
  const a = await authActionUser(args.token)
  if ('error' in a) return a
  if (![1, 2, 3].includes(args.hintLevel)) {
    return { error: 'hint_level inválido' }
  }
  const spend = Math.min(Math.max(Number(args.cost) || 1, 1), 10)
  const remaining = await consumeHints(
    a.userId,
    args.sessionId,
    args.hintLevel,
    spend,
  )
  if (remaining === null) return { error: 'Limite de hints atingido' }
  return { remaining }
}

export async function buyHints(
  token: string,
): Promise<{ bonus: number; added: number } | { error: string }> {
  const a = await authActionUser(token)
  if ('error' in a) return a
  const bonus = await addBonus(a.userId, BONUS_PACK_SIZE)
  if (bonus === null) return { error: 'Não foi possível comprar hints.' }
  revalidatePath('/challenge')
  revalidatePath('/design')
  return { bonus, added: BONUS_PACK_SIZE }
}
