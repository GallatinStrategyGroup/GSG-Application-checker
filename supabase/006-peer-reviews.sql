-- =============================================================
-- Counselor portal + free peer reviews.
-- Run once in Supabase (SQL Editor → New query → Run). Safe to re-run.
-- =============================================================

-- 1) A counselor signs a family: grants the student 3 free checks and records
--    which counselor signed them. Called from the counselor portal.
create or replace function public.sign_student(student_email text)
returns json
language plpgsql security definer set search_path = public
as $$
declare
  v_reviewer_id uuid;
  v_student_id  uuid;
begin
  if not public.is_reviewer() then
    return json_build_object('ok', false, 'error', 'Not authorized.');
  end if;

  -- The calling counselor must be linked to a reviewers row.
  select id into v_reviewer_id from public.reviewers where profile_id = auth.uid();
  if v_reviewer_id is null then
    return json_build_object('ok', false, 'error',
      'Your counselor profile is not linked yet. Ask an admin to set your reviewers.profile_id.');
  end if;

  select id into v_student_id
    from public.profiles
    where lower(email) = lower(trim(student_email)) and role = 'student';
  if v_student_id is null then
    return json_build_object('ok', false, 'error',
      'No student found with that email. They need to create an account first.');
  end if;

  update public.profiles
    set signed_by_reviewer_id = v_reviewer_id,
        free_checks_remaining = 3
  where id = v_student_id;

  return json_build_object('ok', true);
end;
$$;

grant execute on function public.sign_student(text) to authenticated;

-- 2) A signed student submits a free check: assigns it round-robin to the
--    least-busy OTHER counselor (never their own), submits it, and spends one
--    free credit — all atomically and server-side.
create or replace function public.submit_free_check(p_submission_id uuid)
returns json
language plpgsql security definer set search_path = public
as $$
declare
  v_user         uuid := auth.uid();
  v_free         int;
  v_own_reviewer uuid;
  v_peer         uuid;
  v_peer_name    text;
begin
  if not exists (
    select 1 from public.submissions where id = p_submission_id and student_id = v_user
  ) then
    return json_build_object('ok', false, 'error', 'Not your submission.');
  end if;

  select free_checks_remaining, signed_by_reviewer_id
    into v_free, v_own_reviewer
    from public.profiles where id = v_user;

  if coalesce(v_free, 0) <= 0 then
    return json_build_object('ok', false, 'error', 'No free checks remaining.');
  end if;

  -- Round-robin: fewest active submissions first, excluding their own counselor.
  select r.id, r.name into v_peer, v_peer_name
  from public.reviewers r
  where r.accepting = true
    and (v_own_reviewer is null or r.id <> v_own_reviewer)
  order by (
    select count(*) from public.submissions s
    where s.assigned_reviewer_id = r.id and s.status in ('submitted', 'in_review')
  ) asc, r.display_order asc
  limit 1;

  if v_peer is null then
    return json_build_object('ok', false, 'error', 'No peer counselor is available right now.');
  end if;

  update public.submissions
    set status = 'submitted', submitted_at = now(), assigned_reviewer_id = v_peer, updated_at = now()
  where id = p_submission_id;

  update public.profiles
    set free_checks_remaining = free_checks_remaining - 1
  where id = v_user;

  return json_build_object('ok', true, 'reviewer_name', v_peer_name);
end;
$$;

grant execute on function public.submit_free_check(uuid) to authenticated;
