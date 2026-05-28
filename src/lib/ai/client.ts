import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic()

type Effort = 'low' | 'medium' | 'high'

// Sonnet 4.6 during the testing phase to keep credit usage low.
// Swap back to 'claude-opus-4-7' for the highest-quality answers.
const MODEL = 'claude-sonnet-4-6'

// Single text completion with adaptive thinking. Params are passed with a cast
// so we don't depend on the exact SDK type version for `thinking: adaptive` /
// `output_config.effort`. Both work on Sonnet 4.6 and Opus 4.7.
export async function askClaude(opts: {
  system: string
  user: string
  maxTokens?: number
  effort?: Effort
}): Promise<string> {
  const params = {
    model: MODEL,
    max_tokens: opts.maxTokens ?? 1024,
    system: opts.system,
    messages: [{ role: 'user', content: opts.user }],
    thinking: { type: 'adaptive' },
    output_config: { effort: opts.effort ?? 'medium' },
  }
  const res = await anthropic.messages.create(params as never)
  const blocks = (res as { content: Array<{ type: string; text?: string }> })
    .content
  return blocks
    .map((b) => (b.type === 'text' ? (b.text ?? '') : ''))
    .join('')
    .trim()
}

export function aiErrorResponse(e: unknown): Response {
  if (e instanceof Anthropic.AuthenticationError) {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY ausente ou inválida no servidor.' },
      { status: 500 },
    )
  }
  const msg = e instanceof Error ? e.message : 'Erro na IA'
  if (/credit balance|too low|billing/i.test(msg)) {
    return Response.json(
      {
        error:
          'A conta da Anthropic está sem créditos. Adicione em console.anthropic.com → Plans & Billing.',
      },
      { status: 402 },
    )
  }
  return Response.json({ error: msg }, { status: 500 })
}
