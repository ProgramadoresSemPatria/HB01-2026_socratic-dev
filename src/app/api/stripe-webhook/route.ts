import { jsonError } from '@/lib/api/guard'
import { addBonus } from '@/lib/api/hints-server'
import { supabaseAdmin } from '@/lib/supabase/server'
import * as Sentry from '@sentry/nextjs'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!key || !secret) return jsonError('Webhook não configurado.', 503)

  const signature = req.headers.get('stripe-signature')
  if (!signature) return jsonError('Assinatura ausente.', 400)

  const stripe = new Stripe(key)
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      await req.text(),
      signature,
      secret,
    )
  } catch (e) {
    Sentry.captureException(e)
    return jsonError('Assinatura inválida.', 400)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = session.metadata?.user_id
    const hints = Number(session.metadata?.hints)
    if (!userId || !Number.isFinite(hints) || hints <= 0) {
      Sentry.captureMessage(`stripe-webhook: metadata inválida em ${session.id}`)
      return Response.json({ received: true })
    }

    // Unique stripe_session_id = idempotency: a retried delivery hits the
    // conflict and never credits twice.
    const { error } = await supabaseAdmin.from('hint_purchases').insert({
      user_id: userId,
      stripe_session_id: session.id,
      hints,
      amount_cents: session.amount_total,
      currency: session.currency,
    })
    if (error) {
      if (error.code === '23505') return Response.json({ received: true })
      Sentry.captureException(error)
      return jsonError('Erro ao registrar compra.', 500)
    }

    const bonus = await addBonus(userId, hints)
    if (bonus === null) {
      // Undo the purchase row so Stripe's retry can re-process and credit.
      await supabaseAdmin
        .from('hint_purchases')
        .delete()
        .eq('stripe_session_id', session.id)
      Sentry.captureMessage(
        `stripe-webhook: crédito falhou para ${session.id}, aguardando retry`,
      )
      return jsonError('Erro ao creditar hints.', 500)
    }
  }

  return Response.json({ received: true })
}
