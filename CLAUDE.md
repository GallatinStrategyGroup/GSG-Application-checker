# GSG Application Checker

## What this is
A college admissions review tool for Gallatin Strategy Group (GSG), a company
that matches families with independent college counselors. Students submit
their work; real human reviewers leave written feedback. Built with Next.js,
deployed on Vercel, database-backed.

## Users
- **Students** (mostly high school sophomores and juniors) — submit work, save
  drafts, return later to read feedback.
- **Reviewers** — log in to a separate dashboard, see a queue of submissions,
  open one, leave written feedback.

## The product: three checkers
The homepage is three boxes. All three first collect shared intake (intended
major, GPA, target schools tagged Reach/Match/Safety) so feedback is
school-specific. Then:
1. **Finished Application Checker** — full application incl. essays.
2. **Partial Application Checker** — same structure, nothing required, save at
   any stage.
3. **EC Checker** — just activities; answers "are these ECs strong enough for
   the listed schools?"

## Design
Mostly white, hints of black and blue. Clean, modern, trustworthy — the
audience is families. The three homepage boxes are the focal point.

## Standing rules
- Build in phases; commit and push after each working phase.
- Do NOT claim "former admissions officers" in any UI text — say "reviewers"
  until told otherwise.
- This stores personal data from minors. Treat persistence, access, and
  privacy carefully.
- Explain steps in plain language — the owner is new to coding.

## Current state (Phases 1–4 complete)
- **Stack:** Next.js 16 (App Router, TS, Tailwind v4) + Supabase (Postgres,
  Auth, Row Level Security). Deploys on Vercel.
- **DB schema + privacy rules:** `supabase/schema.sql` (run once in Supabase).
- **Supabase clients:** `src/lib/supabase/{client,server}.ts`; session refresh
  in `src/proxy.ts` (Next.js 16 renamed middleware → "proxy").
- **Auth:** email/password. Guests start with an anonymous session so drafts
  save immediately; signing up converts that session to a real account, keeping
  drafts. Role lives in `profiles.role` ('student'|'reviewer'); promote a
  reviewer by editing that row in Supabase.
- **Key routes:** `/` (three checker cards) · `/start/[type]` (intake + form,
  save draft / submit, ends with reviewer picker) · `/login` `/signup` ·
  `/submissions` + `/submissions/[id]` (student) · `/reviewer` +
  `/reviewer/[id]` (reviewer queue + feedback).
- **Reviewer picker:** `reviewers` table holds public-facing cards (name,
  headline, bio, avatar, accepting), decoupled from logins via optional
  `profile_id`. Schema seeds sample reviewers; real ones swap in later. Queue
  count = `reviewer_active_counts()` RPC (security definer, aggregate only);
  display rule + turn-around live in `src/lib/reviewers.ts` (real if ≥3 waiting,
  else a daily-fluctuating fake; turn-around capped ~2 days).
- **Setup steps for the owner:** `docs/SETUP.md`.

## Tech note (read before writing code)
This is Next.js 16 — a newer version with breaking changes from older Next.js.
APIs, conventions, and file structure may differ from what you expect. Before
writing any code, read the relevant guide in `node_modules/next/dist/docs/` and
heed deprecation notices. See `AGENTS.md` in the project root.
@AGENTS.md
