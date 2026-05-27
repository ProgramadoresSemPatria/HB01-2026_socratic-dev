import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(request: Request) {
  const { session_id, user_id, code } = await request.json()

  if (!session_id || !user_id || !code) {
    return Response.json(
      { error: 'session_id, user_id, and code are required' },
      { status: 400 },
    )
  }

  const { data, error } = await supabaseAdmin
    .from('code_submissions')
    .insert({ session_id, user_id, code })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json(data, { status: 201 })
}
