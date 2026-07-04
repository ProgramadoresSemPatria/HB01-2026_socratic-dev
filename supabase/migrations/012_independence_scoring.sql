-- One canonical independence score per session (0-100), written when the
-- session is finished. Replaces the three drifting client-side calculations.
alter table public.sessions
  add column if not exists independence smallint;

-- Tag the rows created by "solve" (reveal full solution). They still cost 5
-- weekly credits, so they stay in hints_used, but they must not count as
-- normal hints and they force independence to 0.
alter table public.hints_used
  add column if not exists is_solve boolean not null default false;

-- ─── Backfill old data ───────────────────────────────────────────────────────
-- A solve inserts exactly 5 level-3 rows in one statement, so they share the
-- same used_at timestamp. Mark those groups as solves.
update public.hints_used h
set is_solve = true
where h.hint_level = 3
  and (h.session_id, h.used_at) in (
    select session_id, used_at
    from public.hints_used
    where hint_level = 3
    group by session_id, used_at
    having count(*) = 5
  );

-- Fill the score for finished sessions: 0 if a solve was used, otherwise
-- 100 minus the hint penalty (level * 4 per real hint).
update public.sessions s
set independence = greatest(0, least(100,
  case
    when exists (
      select 1 from public.hints_used h
      where h.session_id = s.id and h.is_solve
    ) then 0
    else 100 - coalesce((
      select sum(h.hint_level * 4)
      from public.hints_used h
      where h.session_id = s.id and not h.is_solve
    ), 0)
  end
))
where s.independence is null
  and s.status in ('completed', 'abandoned');
