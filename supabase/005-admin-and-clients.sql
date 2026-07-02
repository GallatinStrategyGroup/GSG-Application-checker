-- =============================================================
-- Admin + signed-client foundation.
-- Run once in Supabase (SQL Editor → New query → Run). Additive & safe to re-run.
-- =============================================================

-- 1) New columns on profiles:
--    - is_admin: the GSG owner account(s) who can see the admin dashboard
--    - signed_by_reviewer_id: which counselor signed this family (set by the
--      counselor portal in the next phase)
--    - free_checks_remaining: free Application Checks a signed family has left
alter table public.profiles
  add column if not exists is_admin boolean not null default false,
  add column if not exists signed_by_reviewer_id uuid references public.reviewers (id) on delete set null,
  add column if not exists free_checks_remaining int not null default 0;

-- 2) Admin helper.
create or replace function public.is_admin()
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and is_admin = true
  );
$$;

-- 3) Give admins the same broad read access reviewers have, by folding admin
--    into is_reviewer(). (One change here means every reviewer read policy also
--    covers admins — no other policies need editing.)
create or replace function public.is_reviewer()
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and (role = 'reviewer' or is_admin = true)
  );
$$;

-- -------------------------------------------------------------
-- TO BECOME AN ADMIN: in Table Editor → profiles, find your row and set
-- is_admin = true. Then log out and back in.
-- -------------------------------------------------------------
