import { supabaseAdmin } from '@/lib/supabase-server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const { status } = await request.json()

  if (!status) {
    return Response.json({ error: 'status is required' }, { status: 400 })
  }

  const update: Record<string, string> = { status }
  if (status === 'completed' || status === 'abandoned') {
    update.completed_at = new Date().toISOString()
  }

  const { data, error } = await supabaseAdmin
    .from('sessions')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json(data)
}
