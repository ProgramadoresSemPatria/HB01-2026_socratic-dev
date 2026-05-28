import { askClaude } from '@/lib/ai/client'
import { supabaseAdmin } from '../supabase/server'
import { challengeSystem, levelGuide } from './prompts/challenge-generator'

export type GenLevel = 'beginner' | 'intermediate' | 'advanced'

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
  const stackMap: Record<string, string> = {
    javascript: 'javascript',
    typescript: 'typescript',
    react: 'react',
    python: 'python',
  }
  const stack = stackMap[opts.stack ?? ''] ?? 'typescript'
  const avoid = avoidLine(await existingTitles(opts.kind, opts.level, stack))
  const noTestsNote =
    stack === 'react'
      ? '\n\nIMPORTANTE: tests_source deve ser "" (string vazia). initial_code deve ser um componente TSX com "export default function App()". Sem testes automáticos — o aluno vê o resultado no preview visual.'
      : stack === 'python'
        ? '\n\nIMPORTANTE: tests_source deve ser "" (string vazia). initial_code deve ser Python 3 válido (def + pass, sem export). Sem runner automático no browser nesta versão.'
        : ''

  if (opts.kind === 'design') {
    const raw = await askClaude({
      system: challengeSystem('design'),
      user: `Gere um desafio de system design (arquitetura) novo. nível: ${opts.level}.\n\n${levelGuide('design', opts.level)}${avoid}`,
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
    system: challengeSystem('code'),
    user: `Gere um desafio novo. stack: ${stack}. nível: ${opts.level}.\n\n${levelGuide('code', opts.level)}${avoid}${noTestsNote}`,
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
