-- =============================================================
-- 010 — Structured feedback
--
-- Adds structure to what a reviewer writes back. Before this, all
-- feedback was one free-text box (`feedback.body`). Now a reviewer
-- also fills in:
--   - strengths / concerns        (short prose sections)
--   - activity_scores  (jsonb)    a 1–4 "tier" per activity, mirroring
--                                 the real admissions four-tier framework
--   - school_chances   (jsonb)    a chance level + note PER target school
--                                 (school-specific chancing)
--
-- `body` stays as the overall summary so old feedback still shows.
--
-- HOW TO RUN (one time): Supabase → SQL Editor → New query → paste → Run.
-- Safe to re-run: every statement uses "if not exists".
-- =============================================================

alter table public.feedback
  add column if not exists strengths       text,
  add column if not exists concerns        text,
  -- [{ "position": 0, "tier": 2, "note": "..." }]  (position matches activities.position)
  add column if not exists activity_scores jsonb not null default '[]'::jsonb,
  -- [{ "name": "Boston University", "tier": "reach", "chance": "target", "note": "..." }]
  add column if not exists school_chances  jsonb not null default '[]'::jsonb;

-- No RLS changes needed: these are new columns on an existing table, so they
-- inherit the feedback policies already in place (students read feedback on
-- their own submissions; only reviewers can write it).
