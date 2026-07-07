
create table if not exists public.hint_purchases (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  stripe_session_id text not null unique,
  hints             integer not null,
  amount_cents      integer,
  currency          text,
  created_at        timestamptz not null default now()
);

alter table public.hint_purchases enable row level security;

create policy "Users can view their own purchases"
  on public.hint_purchases for select
  using (auth.uid() = user_id);

create index if not exists hint_purchases_user_id_idx
  on public.hint_purchases (user_id);
