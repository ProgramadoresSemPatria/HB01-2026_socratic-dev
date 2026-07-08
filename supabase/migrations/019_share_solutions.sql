-- ─── Community solutions opt-in ─────────────────────────────────────────────
-- Solutions only appear on the "how others solved it" page when the author
-- opted in. Writes go through service-role actions (user-update policy was
-- dropped in 010), so the flag can't be flipped from the anon client.

alter table public.profiles
  add column if not exists share_solutions boolean not null default false;
