import { HINT_PACK } from '@/features/hints/constants'
import { jsonError, rateLimit, requireUser, tooMany } from '@/lib/api/guard'
import { addBonus } from '@/lib/api/hints-server'
import Stripe from 'stripe'

function safePath(input: unknown): string {
  const path = typeof input === 'string' ? input : ''
  return path.startsWith('/') && !path.startsWith('//') ? path : '/challenge'
}

export async function POST(req: Request) {
  const auth = await requireUser(req)
  if (auth instanceof Response) return auth
  const userId = auth.user.id

  if (!(await rateLimit(`checkout:${userId}`, 5, 60_000))) return tooMany()

  const body = await req.json().catch(() => ({}))
  const path = safePath((body as { path?: string }).path)
  const origin =
    req.headers.get('origin') ?? new URL(req.url).origin

  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    // Dev fallback: credit the pack directly so the flow is testable without
    // Stripe keys. Never in production.
    if (process.env.NODE_ENV !== 'production') {
      const bonus = await addBonus(userId, HINT_PACK.hints)
      if (bonus === null) return jsonError('Não foi possível creditar.', 500)
      return Response.json({ mock: true, added: HINT_PACK.hints })
    }
    return jsonError('Pagamentos indisponíveis no momento.', 503)
  }

  const stripe = new Stripe(key)
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: HINT_PACK.currency,
          unit_amount: HINT_PACK.amountCents,
          product_data: {
            name: `${HINT_PACK.hints} hints — socratic.dev`,
          },
        },
      },
    ],
    metadata: {
      user_id: userId,
      hints: String(HINT_PACK.hints),
    },
    success_url: `${origin}${path}?purchase=success`,
    cancel_url: `${origin}${path}?purchase=cancelled`,
  })

  return Response.json({ url: session.url })
}
