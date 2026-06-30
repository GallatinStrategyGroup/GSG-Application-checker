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

## Tech note (read before writing code)
This is Next.js 16 — a newer version with breaking changes from older Next.js.
APIs, conventions, and file structure may differ from what you expect. Before
writing any code, read the relevant guide in `node_modules/next/dist/docs/` and
heed deprecation notices. See `AGENTS.md` in the project root.
@AGENTS.md
