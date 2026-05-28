import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic()

type Effort = 'low' | 'medium' | 'high'

// Single text completion via Claude Opus 4.7 with adaptive thinking.
// Params are passed with a cast so we don't depend on the exact SDK type
// version for `thinking: adaptive` / `output_config.effort`.
export async function askClaude(opts: {
  system: string
  user: string
  maxTokens?: number
  effort?: Effort
}): Promise<string> {
  const params = {
    model: 'claude-opus-4-7',
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
  return Response.json(
    { error: e instanceof Error ? e.message : 'Erro na IA' },
    { status: 500 },
  )
}
