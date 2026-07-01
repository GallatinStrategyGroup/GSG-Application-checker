-- =============================================================
-- Intro calls — run this once in Supabase (SQL Editor → New query → Run).
-- Additive: it does not touch your existing tables or data.
-- Stores "book a free intro call" requests from the counseling pages.
-- =============================================================

create table if not exists public.intro_call_requests (
  id              uuid primary key default gen_random_uuid(),
  reviewer_id     uuid references public.reviewers (id) on delete set null,
  student_name    text,
  email           text,
  phone           text,
  preferred_times text,
  message         text,
  created_at      timestamptz not null default now()
);

alter table public.intro_call_requests enable row level security;

drop policy if exists "intro_calls_insert" on public.intro_call_requests;
drop policy if exists "intro_calls_select" on public.intro_call_requests;

-- Anyone can submit a request (it's a public booking form).
create policy "intro_calls_insert" on public.intro_call_requests
  for insert with check (true);

-- Only reviewers (staff) can read the requests.
create policy "intro_calls_select" on public.intro_call_requests
  for select using (public.is_reviewer());
