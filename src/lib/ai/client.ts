import Anthropic from '@anthropic-ai/sdk'
import * as Sentry from '@sentry/nextjs'

export const anthropic = new Anthropic()

type Effort = 'low' | 'medium' | 'high'

export const MODELS = {
  default: 'claude-sonnet-5',
  fast: 'claude-haiku-4-5',
} as const

export type TextBlock = {
  type: 'text'
  text: string
  cache_control?: { type: 'ephemeral' }
}

export type ChatTurn = {
  role: 'user' | 'assistant'
  content: string | TextBlock[]
}

function systemBlocks(system: string | TextBlock[]): TextBlock[] {
  if (typeof system !== 'string') return system
  return [
    { type: 'text', text: system, cache_control: { type: 'ephemeral' } },
  ]
}

function modelParams(model: string, effort: Effort) {
  if (model === MODELS.fast) return {}
  return {
    thinking: { type: 'adaptive' },
    output_config: { effort },
  }
}

export async function askClaude(opts: {
  system: string | TextBlock[]
  user?: string
  messages?: ChatTurn[]
  maxTokens?: number
  effort?: Effort
  model?: string
}): Promise<string> {
  const model = opts.model ?? MODELS.default
  const params = {
    model,
    max_tokens: opts.maxTokens ?? 1024,
    system: systemBlocks(opts.system),
    messages: opts.messages ?? [{ role: 'user', content: opts.user ?? '' }],
    ...modelParams(model, opts.effort ?? 'medium'),
  }
  const res = await anthropic.messages.create(params as never)
  return extractText(res)
}

export async function askClaudeVision(opts: {
  system: string | TextBlock[]
  userText: string
  imageBase64: string
  mediaType?: 'image/png' | 'image/jpeg'
  maxTokens?: number
  effort?: Effort
  model?: string
}): Promise<string> {
  const model = opts.model ?? MODELS.default
  const params = {
    model,
    max_tokens: opts.maxTokens ?? 1024,
    system: systemBlocks(opts.system),
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
    ...modelParams(model, opts.effort ?? 'medium'),
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
