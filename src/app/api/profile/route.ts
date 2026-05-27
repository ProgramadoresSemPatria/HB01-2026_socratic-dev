import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const user_id = searchParams.get('user_id')

  if (!user_id) {
    return Response.json({ error: 'user_id is required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user_id)
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json(data)
}
