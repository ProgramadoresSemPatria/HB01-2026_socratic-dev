-- Persist the user's onboarding choices on their profile.
alter table public.profiles
  add column if not exists preferred_stack text,
  add column if not exists preferred_level text;
