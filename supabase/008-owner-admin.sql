-- =============================================================
-- Owner admin by email. Signing up (or already having signed up) with
-- gallatinstrategygroup@gmail.com grants full admin access to /admin.
-- Self-contained & safe to re-run — it also makes sure all the columns the
-- admin + peer-review features need exist.
-- Run once in Supabase (SQL Editor → New query → Run).
-- =============================================================

-- Make sure required columns exist (no-ops if already present).
alter table public.profiles
  add column if not exists is_admin boolean not null default false,
  add column if not exists signed_by_reviewer_id uuid references public.reviewers (id) on delete set null,
  add column if not exists free_checks_remaining int not null default 0;
alter table public.reviewers add column if not exists email text;

-- Admins can read everything reviewers can.
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and is_admin = true); $$;

create or replace function public.is_reviewer()
returns boolean language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and (role = 'reviewer' or is_admin = true)
  );
$$;

-- Signup handler: create the profile, auto-admin the owner email, and
-- auto-promote/link counselors whose email is on the roster.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_reviewer_id uuid;
  v_is_admin    boolean := (lower(new.email) = 'gallatinstrategygroup@gmail.com');
begin
  insert into public.profiles (id, email, full_name, is_admin)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name', coalesce(v_is_admin, false));

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

-- Backfill: if the owner already signed up, make them admin now.
update public.profiles set is_admin = true
  where lower(email) = 'gallatinstrategygroup@gmail.com';
