-- =============================================================
-- Auto-promote counselors by email.
-- Put a counselor's login email in reviewers.email. When someone signs up with
-- that email, they're automatically made a reviewer AND linked to their
-- counselor card — no manual promotion needed.
-- Run once in Supabase (SQL Editor → New query → Run). Safe to re-run.
-- =============================================================

alter table public.reviewers add column if not exists email text;

-- Upgrade the signup handler: create the profile, then auto-promote + link if
-- the email is on the counselor roster.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_reviewer_id uuid;
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');

  if new.email is not null then
    select id into v_reviewer_id
      from public.reviewers where lower(email) = lower(new.email) limit 1;
    if v_reviewer_id is not null then
      update public.profiles set role = 'reviewer' where id = new.id;
      update public.reviewers set profile_id = new.id where id = v_reviewer_id;
    end if;
  end if;

  return new;
end;
$$;

-- Backfill: if a counselor already signed up before their email was added to
-- the roster, promote + link them now.
update public.profiles p
  set role = 'reviewer'
  from public.reviewers r
  where lower(r.email) = lower(p.email) and p.role <> 'reviewer';

update public.reviewers r
  set profile_id = p.id
  from public.profiles p
  where lower(r.email) = lower(p.email) and r.profile_id is null;
