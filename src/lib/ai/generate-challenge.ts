import { askClaude } from '@/lib/ai/client'
import { supabaseAdmin } from '@/lib/supabase-server'

export type GenLevel = 'beginner' | 'intermediate' | 'advanced'

const SYSTEM = `Você gera desafios de programação realistas para uma plataforma de tutoria socrática.
Responda APENAS com um objeto JSON válido (sem markdown, sem comentários), com exatamente estas chaves:
{ "title": string, "description": string, "client_briefing": string, "intro": string, "initial_code": string, "tests_source": string }

Regras:
- title: curto e concreto. description: 1 frase do que implementar.
- client_briefing: 2 a 4 frases, com um cliente fictício e o FORMATO dos dados de entrada.
- intro: a primeira fala do tutor socrático — uma pergunta que faça o aluno pensar. NUNCA a resposta.
- initial_code: a(s) assinatura(s) da(s) função(ões) com "export", corpo vazio e comentários. SEM a solução. Código válido na linguagem da stack.
- tests_source: testes no formato test('nome', () => { expect(exports.NOME(args)).toBe(valor) }). Use exports.<funcao> para acessar a solução do aluno. Cubra os edge cases adequados ao nível.
- Tudo em português do Brasil. A DIFICULDADE deve seguir estritamente o nível pedido.`

const LEVEL_GUIDE: Record<GenLevel, string> = {
  beginner:
    'Nível INICIANTE: variáveis, condicionais, loops, arrays e strings. UMA função simples, sem algoritmos complexos. 2 a 3 testes diretos.',
  intermediate:
    'Nível INTERMEDIÁRIO: estruturas de dados (Map/Set), manipulação de objetos e arrays, async/await, e vários edge cases. Problema realista de produto. 3 a 4 testes, incluindo casos de borda.',
  advanced:
    'Nível AVANÇADO, pegada de entrevista de BIG TECH (Google, Meta, Amazon): algoritmo ou estrutura de dados NÃO-trivial, exija complexidade de tempo/espaço ótima, e cubra muitos edge cases (entrada vazia, muito grande, duplicados, limites/overflow). Inspire-se em problemas estilo LeetCode Hard / entrevista FAANG, mas embrulhados num briefing de cliente realista. 4 a 6 testes, incluindo os casos de borda difíceis. O initial_code pode ter assinatura com a complexidade esperada no comentário.',
}

const DESIGN_SYSTEM = `Você gera desafios de SYSTEM DESIGN (arquitetura de software) para uma plataforma de tutoria socrática, onde o aluno DESENHA a arquitetura num canvas — serviços, bancos de dados, filas, caches, APIs e como os dados fluem e são distribuídos. NÃO é design de UI/Figma e NÃO se escreve código.
Responda APENAS com um objeto JSON válido (sem markdown, sem comentários), com exatamente estas chaves:
{ "title": string, "description": string, "client_briefing": string, "intro": string }

Regras:
- title: curto e concreto (ex.: "Distribuir os dados de usuários entre serviços", "Arquitetura de um feed em tempo real").
- description: 1 frase do que o aluno deve ARQUITETAR no canvas.
- client_briefing: 3 a 5 frases com um cliente fictício, os requisitos (escala, latência, consistência) e os PASSOS do que desenhar (componentes/serviços, onde cada dado vive, como replica/particiona, o caminho de uma request), pedindo pra ligar com setas o fluxo dos dados.
- intro: a primeira fala do tutor socrático — uma pergunta que faça o aluno pensar antes de desenhar. NUNCA a resposta.
- Tudo em português do Brasil. Adeque a complexidade ao nível.`

const DESIGN_LEVEL_GUIDE: Record<GenLevel, string> = {
  beginner:
    'Nível INICIANTE: um serviço + um banco. Modelagem de dados simples, CRUD, onde guardar cada coisa. Sem distribuição complexa.',
  intermediate:
    'Nível INTERMEDIÁRIO: múltiplos serviços, cache, fila de mensagens, réplica de leitura. Trade-offs de consistência e latência.',
  advanced:
    'Nível AVANÇADO: alta escala — particionamento/sharding, distribuição e replicação de dados, consistência eventual, teorema CAP, multi-região e gargalos.',
}

function parseJson(raw: string): Record<string, unknown> {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  const text = (fenced ? fenced[1] : raw).trim()
  return JSON.parse(text)
}

async function existingTitles(
  kind: 'code' | 'design',
  level: GenLevel,
  stack: string,
): Promise<string[]> {
  let q = supabaseAdmin
    .from('challenges')
    .select('title')
    .eq('kind', kind)
    .eq('level', level)
  if (kind === 'code') q = q.eq('stack', stack)
  const { data } = await q
  return (data ?? []).map((c) => String(c.title)).filter(Boolean)
}

function avoidLine(titles: string[]): string {
  if (titles.length === 0) return ''
  return `\n\nESTES desafios JÁ EXISTEM — gere um tema CLARAMENTE diferente (não repita nem só troque o nome):\n- ${titles.join('\n- ')}`
}

// Generates a fresh challenge with the AI and persists it. Returns the
// Supabase insert result ({ data, error }). May throw on AI errors — callers
// should wrap with aiErrorResponse. Passes the existing titles so the AI
// avoids generating near-duplicates.
export async function generateChallenge(opts: {
  kind: 'code' | 'design'
  stack?: string
  level: GenLevel
}) {
  const stack = opts.stack === 'javascript' ? 'javascript' : 'typescript'
  const avoid = avoidLine(await existingTitles(opts.kind, opts.level, stack))

  if (opts.kind === 'design') {
    const raw = await askClaude({
      system: DESIGN_SYSTEM,
      user: `Gere um desafio de system design (arquitetura) novo. nível: ${opts.level}.\n\n${DESIGN_LEVEL_GUIDE[opts.level]}${avoid}`,
      maxTokens: 2048,
      effort: 'medium',
    })
    const json = parseJson(raw)
    return supabaseAdmin
      .from('challenges')
      .insert({
        title: String(json.title ?? 'Desafio de Design System'),
        description: String(json.description ?? ''),
        stack: 'design',
        level: opts.level,
        client_briefing: String(json.client_briefing ?? ''),
        intro: String(json.intro ?? ''),
        kind: 'design',
      })
      .select()
      .single()
  }

  const raw = await askClaude({
    system: SYSTEM,
    user: `Gere um desafio novo. stack: ${stack}. nível: ${opts.level}.\n\n${LEVEL_GUIDE[opts.level]}${avoid}`,
    maxTokens: opts.level === 'advanced' ? 6000 : 3500,
    effort: opts.level === 'advanced' ? 'high' : 'medium',
  })
  const json = parseJson(raw)
  return supabaseAdmin
    .from('challenges')
    .insert({
      title: String(json.title ?? 'Desafio'),
      description: String(json.description ?? ''),
      stack,
      level: opts.level,
      client_briefing: String(json.client_briefing ?? ''),
      intro: String(json.intro ?? ''),
      initial_code: String(json.initial_code ?? ''),
      tests_source: String(json.tests_source ?? ''),
    })
    .select()
    .single()
}
