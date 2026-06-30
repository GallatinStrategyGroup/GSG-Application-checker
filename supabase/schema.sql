-- =============================================================
-- GSG Application Checker — database schema
--
-- HOW TO RUN THIS (one time):
--   1. Open your project at https://supabase.com
--   2. Left sidebar → SQL Editor → "New query"
--   3. Paste this whole file in, then click "Run"
--
-- Running it again is safe-ish, but it will error on the
-- "create type/table" lines because they already exist. To start
-- completely fresh, run the DROP block at the very bottom first.
-- =============================================================


-- -------------------------------------------------------------
-- 1. ENUM types — fixed lists of allowed values.
--    (Postgres rejects anything not in the list, which protects
--     us from typos like status = 'reviewd'.)
-- -------------------------------------------------------------
create type user_role         as enum ('student', 'reviewer');
create type checker_type       as enum ('finished', 'partial', 'ec');
create type submission_status  as enum ('draft', 'submitted', 'in_review', 'reviewed');
create type school_tier        as enum ('reach', 'match', 'safety');


-- -------------------------------------------------------------
-- 2. PROFILES — one row per person who logs in.
--    `id` is the same id Supabase Auth gives each account.
-- -------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  role        user_role not null default 'student',
  created_at  timestamptz not null default now()
);

-- When someone signs up, Supabase creates a row in auth.users.
-- This trigger automatically mirrors it into our profiles table
-- so every logged-in person always has a profile (default: student).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- -------------------------------------------------------------
-- 2b. REVIEWERS — the people students can choose to review their
--     application. These are PUBLIC-FACING cards (name, photo, bio)
--     and are intentionally separate from login accounts so we can
--     show sample reviewers now and link real accounts later:
--       - profile_id is null for a demo/sample reviewer
--       - set profile_id to a real reviewer's account once they join
-- -------------------------------------------------------------
create table public.reviewers (
  id             uuid primary key default gen_random_uuid(),
  profile_id     uuid references public.profiles (id) on delete set null,
  name           text not null,
  headline       text,        -- short specialty line, e.g. "STEM & research"
  bio            text,        -- a sentence or two of background
  avatar_url     text,        -- optional photo; if empty we show initials
  accepting      boolean not null default true,
  display_order  int not null default 0,
  created_at     timestamptz not null default now()
);


-- -------------------------------------------------------------
-- 3. SUBMISSIONS — the core record. One per checker a student fills.
--    Shared intake (major, gpa) lives here; target schools,
--    activities and essays hang off it in the tables below.
--    assigned_reviewer_id points at the reviewer the student picked.
-- -------------------------------------------------------------
create table public.submissions (
  id                    uuid primary key default gen_random_uuid(),
  student_id            uuid not null references public.profiles (id) on delete cascade,
  type                  checker_type not null,
  status                submission_status not null default 'draft',
  intended_major        text,
  gpa                   text,
  supplemental_info     text,
  assigned_reviewer_id  uuid references public.reviewers (id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  submitted_at          timestamptz
);


-- -------------------------------------------------------------
-- 4. TARGET SCHOOLS — the dream/match/safety list for a submission.
-- -------------------------------------------------------------
create table public.target_schools (
  id             uuid primary key default gen_random_uuid(),
  submission_id  uuid not null references public.submissions (id) on delete cascade,
  name           text not null,
  tier           school_tier not null,
  created_at     timestamptz not null default now()
);


-- -------------------------------------------------------------
-- 5. ACTIVITIES — the extracurricular list for a submission.
-- -------------------------------------------------------------
create table public.activities (
  id             uuid primary key default gen_random_uuid(),
  submission_id  uuid not null references public.submissions (id) on delete cascade,
  role           text,
  organization   text,
  years          text,
  hours          text,
  description    text,
  position       int not null default 0,
  created_at     timestamptz not null default now()
);


-- -------------------------------------------------------------
-- 6. ESSAYS — one or more essays (title + body) for a submission.
-- -------------------------------------------------------------
create table public.essays (
  id             uuid primary key default gen_random_uuid(),
  submission_id  uuid not null references public.submissions (id) on delete cascade,
  title          text,
  body           text,
  position       int not null default 0,
  created_at     timestamptz not null default now()
);


-- -------------------------------------------------------------
-- 7. FEEDBACK — what a reviewer writes back. Shown to the student.
-- -------------------------------------------------------------
create table public.feedback (
  id             uuid primary key default gen_random_uuid(),
  submission_id  uuid not null references public.submissions (id) on delete cascade,
  reviewer_id    uuid references public.profiles (id) on delete set null,
  body           text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);


-- =============================================================
-- ROW LEVEL SECURITY (RLS)
--
-- This is the privacy backbone. With RLS on, the database itself
-- refuses to hand back rows the current user is not allowed to see
-- — even if there is a bug in the app code. Because this app holds
-- personal data from minors, we lean on the database, not just the UI.
-- =============================================================

-- Helper: is the currently logged-in user a reviewer?
-- security definer = runs with elevated rights so it can read the
-- profiles table without tripping RLS (which would cause a loop).
create function public.is_reviewer()
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'reviewer'
  );
$$;

-- Helper: does the current user own this submission?
create function public.owns_submission(sub_id uuid)
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from public.submissions
    where id = sub_id and student_id = auth.uid()
  );
$$;

-- Helper: how many students is each reviewer currently helping?
-- "Currently helping" = submissions assigned to them that aren't reviewed yet.
-- This is security definer so a STUDENT can see the COUNT per reviewer
-- (to display turn-around times) WITHOUT being able to read anyone else's
-- submissions. Only the aggregate numbers come back, never the rows.
create function public.reviewer_active_counts()
returns table (reviewer_id uuid, active_count bigint)
language sql security definer stable set search_path = public
as $$
  select assigned_reviewer_id, count(*)
  from public.submissions
  where assigned_reviewer_id is not null
    and status in ('submitted', 'in_review')
  group by assigned_reviewer_id;
$$;

grant execute on function public.reviewer_active_counts() to anon, authenticated;

-- Turn RLS on for every table.
alter table public.profiles       enable row level security;
alter table public.reviewers      enable row level security;
alter table public.submissions    enable row level security;
alter table public.target_schools enable row level security;
alter table public.activities     enable row level security;
alter table public.essays         enable row level security;
alter table public.feedback       enable row level security;

-- PROFILES: you can see/edit your own profile; reviewers can see all
-- profiles (so the queue can show student names).
create policy "profiles_select" on public.profiles
  for select using (id = auth.uid() or public.is_reviewer());
create policy "profiles_update" on public.profiles
  for update using (id = auth.uid());

-- REVIEWERS: the cards are public so any visitor can browse and pick one.
-- Only reviewers (staff) can edit reviewer rows from the app; you can also
-- edit them directly in the Supabase Table Editor.
create policy "reviewers_select" on public.reviewers
  for select using (true);
create policy "reviewers_write" on public.reviewers
  for all using (public.is_reviewer()) with check (public.is_reviewer());

-- SUBMISSIONS: students see only their own; reviewers see all.
-- Students create/delete their own; reviewers can update (status, assign).
create policy "submissions_select" on public.submissions
  for select using (student_id = auth.uid() or public.is_reviewer());
create policy "submissions_insert" on public.submissions
  for insert with check (student_id = auth.uid());
create policy "submissions_update" on public.submissions
  for update using (student_id = auth.uid() or public.is_reviewer());
create policy "submissions_delete" on public.submissions
  for delete using (student_id = auth.uid());

-- CHILD TABLES (schools / activities / essays): access follows the
-- parent submission — you can touch a row if you own its submission,
-- and reviewers can read everything.
create policy "target_schools_select" on public.target_schools
  for select using (public.owns_submission(submission_id) or public.is_reviewer());
create policy "target_schools_write" on public.target_schools
  for all using (public.owns_submission(submission_id))
  with check (public.owns_submission(submission_id));

create policy "activities_select" on public.activities
  for select using (public.owns_submission(submission_id) or public.is_reviewer());
create policy "activities_write" on public.activities
  for all using (public.owns_submission(submission_id))
  with check (public.owns_submission(submission_id));

create policy "essays_select" on public.essays
  for select using (public.owns_submission(submission_id) or public.is_reviewer());
create policy "essays_write" on public.essays
  for all using (public.owns_submission(submission_id))
  with check (public.owns_submission(submission_id));

-- FEEDBACK: students can read feedback on their own submissions.
-- Only reviewers can write it.
create policy "feedback_select" on public.feedback
  for select using (public.owns_submission(submission_id) or public.is_reviewer());
create policy "feedback_insert" on public.feedback
  for insert with check (public.is_reviewer());
create policy "feedback_update" on public.feedback
  for update using (public.is_reviewer());


-- =============================================================
-- SAMPLE REVIEWERS (placeholders)
-- These let the "Choose your reviewer" screen look populated right away.
-- They have no login (profile_id is null) and no photo (initials show).
-- Replace these with real reviewers later — either edit these rows in the
-- Table Editor, or delete them and insert the real people.
-- =============================================================
insert into public.reviewers (name, headline, bio, display_order) values
  ('Dr. Bolger', 'STEM & research applications',
   'Works with students applying to competitive STEM programs and offers detailed, line-by-line essay feedback.', 1),
  ('Ms. Alvarez', 'Liberal arts & writing',
   'Focuses on narrative voice and "why us" essays for selective liberal arts colleges.', 2),
  ('Mr. Tanaka', 'Business & economics',
   'Helps applicants frame leadership and activities for business-focused programs.', 3),
  ('Dr. Okafor', 'Pre-med & life sciences',
   'Guides students on activities and essays for pre-health and life-science pathways.', 4);


-- =============================================================
-- START-OVER BLOCK (optional)
-- Uncomment and run this FIRST if you want to wipe everything and
-- re-run the schema from scratch. This deletes all data.
-- =============================================================
-- drop table if exists public.feedback       cascade;
-- drop table if exists public.essays         cascade;
-- drop table if exists public.activities     cascade;
-- drop table if exists public.target_schools cascade;
-- drop table if exists public.submissions    cascade;
-- drop table if exists public.reviewers      cascade;
-- drop table if exists public.profiles       cascade;
-- drop function if exists public.handle_new_user         cascade;
-- drop function if exists public.is_reviewer             cascade;
-- drop function if exists public.owns_submission         cascade;
-- drop function if exists public.reviewer_active_counts  cascade;
-- drop type if exists user_role         cascade;
-- drop type if exists checker_type      cascade;
-- drop type if exists submission_status cascade;
-- drop type if exists school_tier       cascade;
