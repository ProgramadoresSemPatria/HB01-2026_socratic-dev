create or replace function public.next_challenge_for_user(
  p_user uuid,
  p_kind text,
  p_level text,
  p_stack text
)
returns setof public.challenges
language sql
security definer
set search_path = public
as $$
  select c.*
  from challenges c
  where c.kind = p_kind
    and c.level = p_level
    and (p_kind <> 'code' or c.stack = p_stack)
    and not exists (
      select 1 from sessions s
      where s.user_id = p_user and s.challenge_id = c.id
    )
  order by random()
  limit 1;
$$;

revoke all on function public.next_challenge_for_user(uuid, text, text, text) from public, anon, authenticated;
