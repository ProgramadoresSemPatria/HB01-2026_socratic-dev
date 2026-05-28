import { aiErrorResponse, askClaude } from '@/lib/ai/client'
import { supabaseAdmin } from '@/lib/supabase-server'

const SYSTEM = `Você é um tech lead fazendo um code review socrático CURTO.
Responda em NO MÁXIMO 5 bullets em markdown — direto, sem floreio. NÃO reescreva o código.
- 1 a 2 bullets do que está bom.
- 1 a 2 bullets do que falta ou pode melhorar.
- 1 pergunta no final que faça o aluno pensar.
Cada bullet com 1 ou 2 frases curtas. Português do Brasil. Sem cabeçalhos longos.`

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const code: string = body.code ?? ''
  const title: string = body.title ?? ''
  const briefing: string = body.briefing ?? ''
  const sessionId: string | undefined = body.session_id
  const userId: string | undefined = body.user_id

  if (!code) {
    return Response.json({ error: 'code é obrigatório' }, { status: 400 })
  }

  const user = [
    `Desafio: ${title}`,
    `Briefing do cliente: ${briefing}`,
    '',
    'Código submetido:',
    '```',
    code,
    '```',
    '',
    'Faça o review.',
  ].join('\n')

  let review: string | null = null
  let aiError: unknown = null
  try {
    review = await askClaude({
      system: SYSTEM,
      user,
      maxTokens: 2048,
      effort: 'high',
    })
  } catch (e) {
    aiError = e
  }

  if (sessionId && userId) {
    await supabaseAdmin.from('code_submissions').insert({
      session_id: sessionId,
      user_id: userId,
      code,
      review_response: review,
    })
  }

  if (aiError) return aiErrorResponse(aiError)
  return Response.json({ review })
}
