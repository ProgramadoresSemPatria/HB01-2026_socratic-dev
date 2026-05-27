import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(request: Request) {
  const { user_id, challenge_id } = await request.json()

  if (!user_id || !challenge_id) {
    return Response.json(
      { error: 'user_id and challenge_id are required' },
      { status: 400 },
    )
  }

  const { data, error } = await supabaseAdmin
    .from('sessions')
    .insert({ user_id, challenge_id })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json(data, { status: 201 })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const user_id = searchParams.get('user_id')

  if (!user_id) {
    return Response.json({ error: 'user_id is required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select('*, challenges(*)')
    .eq('user_id', user_id)
    .order('started_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json(data)
}
