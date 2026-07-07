import Anthropic from '@anthropic-ai/sdk'
import * as Sentry from '@sentry/nextjs'

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
  return extractText(res)
}

export async function askClaudeVision(opts: {
  system: string
  userText: string
  imageBase64: string
  mediaType?: 'image/png' | 'image/jpeg'
  maxTokens?: number
  effort?: Effort
}): Promise<string> {
  const params = {
    model: MODEL,
    max_tokens: opts.maxTokens ?? 1024,
    system: opts.system,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: opts.mediaType ?? 'image/png',
              data: opts.imageBase64,
            },
          },
          { type: 'text', text: opts.userText },
        ],
      },
    ],
    thinking: { type: 'adaptive' },
    output_config: { effort: opts.effort ?? 'medium' },
  }
  const res = await anthropic.messages.create(params as never)
  return extractText(res)
}

function extractText(res: unknown): string {
  const blocks = (res as { content: Array<{ type: string; text?: string }> })
    .content
  return blocks
    .map((b) => (b.type === 'text' ? (b.text ?? '') : ''))
    .join('')
    .trim()
}

// Friendly message for server actions. Keeps our own thrown messages (e.g.
// parse errors with retry instructions) but masks raw SDK/API errors.
export function aiErrorMessage(e: unknown): string {
  Sentry.captureException(e)
  const msg = e instanceof Error ? e.message : ''
  if (/credit balance|too low|billing/i.test(msg)) {
    return 'A conta da Anthropic está sem créditos. Adicione em console.anthropic.com → Plans & Billing.'
  }
  if (e instanceof Anthropic.RateLimitError) {
    return 'A IA está sobrecarregada. Tente de novo em instantes.'
  }
  if (e instanceof Anthropic.APIError) {
    return 'Erro na IA. Tente novamente.'
  }
  return msg || 'Erro inesperado'
}

export function aiErrorResponse(e: unknown): Response {
  Sentry.captureException(e)
  if (e instanceof Anthropic.AuthenticationError) {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY ausente ou inválida no servidor.' },
      { status: 500 },
    )
  }
  const msg = e instanceof Error ? e.message : ''
  if (/credit balance|too low|billing/i.test(msg)) {
    return Response.json(
      {
        error:
          'A conta da Anthropic está sem créditos. Adicione em console.anthropic.com → Plans & Billing.',
      },
      { status: 402 },
    )
  }
  if (e instanceof Anthropic.RateLimitError) {
    return Response.json(
      { error: 'A IA está sobrecarregada. Tente de novo em instantes.' },
      { status: 429 },
    )
  }
  return Response.json(
    { error: 'Erro na IA. Tente novamente.' },
    { status: 500 },
  )
}
