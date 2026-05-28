import { aiErrorResponse, askClaude } from '@/lib/ai/client'
import { supabaseAdmin } from '@/lib/supabase-server'

const SYSTEM = `Você é um tech lead fazendo code review socrático de uma submissão de um aluno.
Avalie se o código resolve o briefing, cobre edge-cases e tem clareza.
NÃO reescreva o código por completo. Aponte, de forma honesta e específica: o que está bom, o que falta, e os riscos.
Termine com 1 ou 2 perguntas que levem o aluno a melhorar sozinho.
Português do Brasil. Markdown curto com bullets.`

export async function POST(req: Request) {
  try {
    const body = await req.json()
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

    const review = await askClaude({
      system: SYSTEM,
      user,
      maxTokens: 2048,
      effort: 'high',
    })

    // Persist the submission + review when we have an authenticated session.
    if (sessionId && userId) {
      await supabaseAdmin.from('code_submissions').insert({
        session_id: sessionId,
        user_id: userId,
        code,
        review_response: review,
      } as never)
    }

    return Response.json({ review })
  } catch (e) {
    return aiErrorResponse(e)
  }
}
