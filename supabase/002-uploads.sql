-- =============================================================
-- Uploads — run this once in Supabase (SQL Editor → New query → Run).
-- Additive: it does not touch your existing tables or data.
-- Adds a private file bucket + a table linking uploaded files to submissions.
-- =============================================================

-- 1) Private storage bucket for uploaded files (PDFs, etc.)
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', false)
on conflict (id) do nothing;

-- 2) Table that records each uploaded file (with the student's title for it)
create table if not exists public.attachments (
  id            uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions (id) on delete cascade,
  title         text,
  file_path     text not null,
  file_name     text,
  created_at    timestamptz not null default now()
);

alter table public.attachments enable row level security;

drop policy if exists "attachments_select" on public.attachments;
drop policy if exists "attachments_write" on public.attachments;

create policy "attachments_select" on public.attachments
  for select using (public.owns_submission(submission_id) or public.is_reviewer());
create policy "attachments_write" on public.attachments
  for all using (public.owns_submission(submission_id))
  with check (public.owns_submission(submission_id));

-- 3) Storage access rules for the 'uploads' bucket.
-- Files are stored under a folder named after the uploader's user id, so a
-- student can only touch their own files; reviewers can read everything.
drop policy if exists "uploads_insert" on storage.objects;
drop policy if exists "uploads_select" on storage.objects;
drop policy if exists "uploads_delete" on storage.objects;

create policy "uploads_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "uploads_select" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'uploads'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_reviewer())
  );

create policy "uploads_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
