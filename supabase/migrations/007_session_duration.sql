-- Persist how long the user actively spent on each challenge attempt.
-- `started_at`/`completed_at` already give wall-clock duration, but that's
-- inflated by idle time and visits across days. This column captures the
-- elapsed seconds the user reports from the client at submit time.

alter table public.sessions
  add column if not exists duration_seconds integer;
