import { aiErrorResponse, askClaude } from '@/lib/ai/client'
import { supabaseAdmin } from '@/lib/supabase-server'

const SYSTEM = `Você gera desafios de programação realistas para uma plataforma de tutoria socrática.
Responda APENAS com um objeto JSON válido (sem markdown, sem comentários), com exatamente estas chaves:
{ "title": string, "description": string, "client_briefing": string, "intro": string, "initial_code": string, "tests_source": string }

Regras:
- title: curto e concreto. description: 1 frase do que implementar.
- client_briefing: 2 a 4 frases, com um cliente fictício e o FORMATO dos dados de entrada.
- intro: a primeira fala do tutor socrático — uma pergunta que faça o aluno pensar. NUNCA a resposta.
- initial_code: a(s) assinatura(s) da(s) função(ões) com "export", corpo vazio e comentários. SEM a solução. Código válido na linguagem da stack.
- tests_source: 2 a 4 testes no formato test('nome', () => { expect(exports.NOME(args)).toBe(valor) }). Use exports.<funcao> para acessar a solução do aluno.
- Tudo em português do Brasil, adequado ao nível pedido.`

function parseJson(raw: string): Record<string, unknown> {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  const text = (fenced ? fenced[1] : raw).trim()
  return JSON.parse(text)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const stack = body.stack === 'javascript' ? 'javascript' : 'typescript'
    const level = body.level === 'intermediate' ? 'intermediate' : 'beginner'

    const raw = await askClaude({
      system: SYSTEM,
      user: `Gere um desafio novo. stack: ${stack}. nível: ${level}.`,
      maxTokens: 4096,
      effort: 'high',
    })

    const json = parseJson(raw)
    const row = {
      title: String(json.title ?? 'Desafio'),
      description: String(json.description ?? ''),
      stack,
      level,
      client_briefing: String(json.client_briefing ?? ''),
      intro: String(json.intro ?? ''),
      initial_code: String(json.initial_code ?? ''),
      tests_source: String(json.tests_source ?? ''),
    }

    const { data, error } = await supabaseAdmin
      .from('challenges')
      .insert(row as never)
      .select()
      .single()

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }
    return Response.json(data, { status: 201 })
  } catch (e) {
    return aiErrorResponse(e)
  }
}
