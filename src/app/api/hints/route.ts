import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(request: Request) {
  const { session_id, user_id, hint_level } = await request.json()

  if (!session_id || !user_id || !hint_level) {
    return Response.json(
      { error: 'session_id, user_id, and hint_level are required' },
      { status: 400 },
    )
  }

  if (![1, 2, 3].includes(hint_level)) {
    return Response.json(
      { error: 'hint_level must be 1, 2, or 3' },
      { status: 400 },
    )
  }

  const { data, error } = await supabaseAdmin
    .from('hints_used')
    .insert({ session_id, user_id, hint_level })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json(data, { status: 201 })
}
