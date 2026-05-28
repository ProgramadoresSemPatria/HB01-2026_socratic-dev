-- Allow the "advanced" (big-tech interview) tier on generated challenges.
-- The original 001 schema's check constraint only accepted 'beginner' and 'intermediate'.

alter table public.challenges drop constraint if exists challenges_level_check;
alter table public.challenges
  add constraint challenges_level_check
  check (level in ('beginner', 'intermediate', 'advanced'));
