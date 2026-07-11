-- ─── League fixes ────────────────────────────────────────────────────────────
-- 1) join_league (migration 020) listed columns (season, cohort, user_id) but
--    inserted values in the order (user, season, cohort) — a runtime type
--    error, so JOINING A LEAGUE ALWAYS FAILED and league_members stayed empty.
-- 2) The app called join_league and add_league_points as two separate RPCs; a
--    failure between them dropped the points silently. Fused into one atomic
--    function so either the member exists AND the points land, or the whole
--    thing fails loudly.

create or replace function public.join_league(p_user uuid, p_season text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cohort integer;
begin
  select cohort into v_cohort
  from league_members
  where season = p_season and user_id = p_user;
  if found then
    return v_cohort;
  end if;

  perform pg_advisory_xact_lock(hashtext('league:' || p_season));

  select cohort into v_cohort
  from league_members
  where season = p_season
  group by cohort
  having count(*) < 25
  order by cohort
  limit 1;

  if v_cohort is null then
    select coalesce(max(cohort), 0) + 1 into v_cohort
    from league_members
    where season = p_season;
  end if;

  insert into league_members (season, cohort, user_id)
  values (p_season, v_cohort, p_user)
  on conflict (season, user_id) do nothing;

  select cohort into v_cohort
  from league_members
  where season = p_season and user_id = p_user;
  return v_cohort;
end;
$$;

-- Join (idempotent) + add points in one transaction. Returns the member's
-- league points after the update, or null if the join could not happen.
create or replace function public.join_and_add_league_points(
  p_user uuid,
  p_season text,
  p_amount integer
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cohort integer;
  v_points integer;
begin
  v_cohort := join_league(p_user, p_season);
  if v_cohort is null then
    return null;
  end if;

  update league_members
     set points = points + greatest(p_amount, 0)
   where season = p_season and user_id = p_user
  returning points into v_points;
  return v_points;
end;
$$;

revoke all on function public.join_league(uuid, text) from public, anon, authenticated;
revoke all on function public.join_and_add_league_points(uuid, text, integer) from public, anon, authenticated;
