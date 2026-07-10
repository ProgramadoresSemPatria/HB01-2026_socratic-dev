-- ─── Close the points-farming loophole (solve → redo) ───────────────────────
-- award_session_points deduped only on prior sessions with points > 0, so a
-- user could "solve for me" on a challenge (independence 0 → 0 pts), reopen
-- the same challenge and retype the revealed solution for full points.
--
-- New rule: a challenge can only score on its FIRST completion, and any
-- earlier solve on the same challenge also zeroes the award (covers the
-- solve → abandon → redo variant, where the first session never completed).

create or replace function public.award_session_points(
  p_user uuid,
  p_session uuid,
  p_challenge uuid,
  p_points integer
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
begin
  perform 1 from profiles where id = p_user for update;

  update sessions
     set points = 0
   where id = p_session and user_id = p_user and points is null;
  if not found then
    return null;
  end if;

  -- Any other session of this challenge that already went through the award
  -- flow (points stamped — even 0) means this is not the first completion.
  if exists (
    select 1 from sessions
    where user_id = p_user
      and challenge_id = p_challenge
      and points is not null
      and id <> p_session
  ) then
    return 0;
  end if;

  -- Any earlier solve on this challenge (e.g. inside an abandoned session)
  -- blocks scoring too: the solution was already revealed to the user.
  if exists (
    select 1
    from hints_used h
    join sessions s on s.id = h.session_id
    where s.user_id = p_user
      and s.challenge_id = p_challenge
      and h.is_solve
      and h.session_id <> p_session
  ) then
    return 0;
  end if;

  update sessions set points = greatest(p_points, 0) where id = p_session;
  update profiles set total_points = total_points + greatest(p_points, 0)
  where id = p_user;
  return greatest(p_points, 0);
end;
$$;

revoke all on function public.award_session_points(uuid, uuid, uuid, integer) from public, anon, authenticated;
