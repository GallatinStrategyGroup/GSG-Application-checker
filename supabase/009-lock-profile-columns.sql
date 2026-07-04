-- =============================================================
-- 009 — Lock down profile self-updates (privilege-escalation fix).
-- Run once in Supabase (SQL Editor → New query → Run). Safe to re-run.
--
-- THE BUG
--   The profiles_update policy let a signed-in user update their own profile
--   row with NO restriction on which columns. Because role / is_admin /
--   free_checks_remaining / signed_by_reviewer_id all live on that row, any
--   student could run, straight from the browser:
--       supabase.from('profiles').update({ role: 'reviewer' })   // or is_admin: true
--   and instantly read EVERY other family's submissions, essays and activities
--   (a full breach of minors' data), or grant themselves unlimited free reviews.
--
-- THE FIX
--   Keep letting users edit their own row, but only the two harmless columns
--   (email, full_name). RLS can't restrict columns, so we use column privileges
--   — the database itself now refuses UPDATEs to any other column. The sensitive
--   columns are written only by security-definer functions (the signup trigger,
--   sign_student, submit_free_check) or by staff in the Supabase Table Editor,
--   none of which are affected by this change.
-- =============================================================

-- 1) Re-add the row policy WITH a check clause (belt and suspenders).
drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- 2) Column-level lockdown: authenticated users may change only email/full_name.
--    Any column not listed here (incl. ones added by future migrations) is
--    unwritable by an ordinary user.
revoke update on public.profiles from anon, authenticated;
grant  update (email, full_name) on public.profiles to authenticated;

-- 3) Same hardening for submissions: a student can edit their own submission,
--    but the WITH CHECK stops them re-pointing it at another student_id.
drop policy if exists "submissions_update" on public.submissions;
create policy "submissions_update" on public.submissions
  for update using (student_id = auth.uid() or public.is_reviewer())
  with check (student_id = auth.uid() or public.is_reviewer());
