// Hints economy. Every user gets a free weekly allowance that resets each
// Sunday 23:59 (America/Sao_Paulo, fixed UTC-3). Purchasable bonus credits
// live in `bonus_hints`, are only consumed after the weekly allowance runs
// out, and never reset.
export const FREE_WEEKLY_HINTS = 35

// "Resolver pra mim" — the expensive last-resort that reveals the full
// solution. Costs many hint credits and drops independence to zero (see
// SOLVE_CAP in domain/scoring).
export const SOLVE_COST = 5

// Purchasable pack (Stripe Checkout). Price is defined inline via price_data
// so no product needs to exist in the Stripe dashboard.
export const HINT_PACK = {
  hints: 20,
  amountCents: 990,
  currency: 'brl',
} as const
