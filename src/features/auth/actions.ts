'use server'

import { rateLimit } from '@/lib/api/guard'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function signUp(input: {
  email: string
  password: string
}): Promise<{ ok: true } | { error: string }> {
  if (!input.email || !input.password) {
    return { error: 'E-mail e senha são obrigatórios.' }
  }
  if (String(input.password).length < 6) {
    return { error: 'A senha precisa ter pelo menos 6 caracteres.' }
  }
  if (!(await rateLimit(`signup:${String(input.email).toLowerCase()}`, 5, 600_000))) {
    return { error: 'Muitas tentativas. Aguarde alguns minutos.' }
  }
  const { error } = await supabaseAdmin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
  })
  if (error) return { error: error.message }
  return { ok: true }
}
