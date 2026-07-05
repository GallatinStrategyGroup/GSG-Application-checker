# Graph Report - .  (2026-07-04)

## Corpus Check
- 15 files · ~29,339 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 335 nodes · 600 edges · 25 communities (16 shown, 9 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Admin & Reviewer Dashboards|Admin & Reviewer Dashboards]]
- [[_COMMUNITY_EC Estimator & Submission Views|EC Estimator & Submission Views]]
- [[_COMMUNITY_Auth & Profile Widgets|Auth & Profile Widgets]]
- [[_COMMUNITY_Product Docs & Domain Concepts|Product Docs & Domain Concepts]]
- [[_COMMUNITY_NPM Dependencies|NPM Dependencies]]
- [[_COMMUNITY_Checkout & Pricing|Checkout & Pricing]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Checker Form Builder|Checker Form Builder]]
- [[_COMMUNITY_Counselor Directory|Counselor Directory]]
- [[_COMMUNITY_Auth & Reviewer-Picker Concepts|Auth & Reviewer-Picker Concepts]]
- [[_COMMUNITY_Service Icons & Catalog|Service Icons & Catalog]]
- [[_COMMUNITY_UI Primitives & 404|UI Primitives & 404]]
- [[_COMMUNITY_Static SVG Assets|Static SVG Assets]]
- [[_COMMUNITY_Root Layout & Fonts|Root Layout & Fonts]]
- [[_COMMUNITY_Apply Page|Apply Page]]
- [[_COMMUNITY_Counselor Headshots|Counselor Headshots]]
- [[_COMMUNITY_OpenGraph Image|OpenGraph Image]]
- [[_COMMUNITY_Session Proxy Middleware|Session Proxy Middleware]]
- [[_COMMUNITY_Uploads Migration|Uploads Migration]]
- [[_COMMUNITY_Intro-Calls Migration|Intro-Calls Migration]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_Next.js 16 Agent Rules|Next.js 16 Agent Rules]]

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 24 edges
2. `getCurrentProfile()` - 16 edges
3. `compilerOptions` - 16 edges
4. `SiteHeader()` - 15 edges
5. `getChecker()` - 12 edges
6. `SiteFooter()` - 11 edges
7. `GSG Application Checker` - 10 edges
8. `Container()` - 8 edges
9. `SubmissionRow` - 8 edges
10. `getStripe()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Free EC Tier Estimate (/ec-estimate)` --semantically_similar_to--> `EC Checker`  [INFERRED] [semantically similar]
  docs/SETUP.md → CLAUDE.md
- `GSG App Favicon (blue rounded-square line chart)` --conceptually_related_to--> `Next.js Wordmark Logo (scaffold asset)`  [AMBIGUOUS]
  src/app/icon.svg → public/next.svg
- `Supabase Project Setup` --references--> `Supabase (Postgres, Auth, RLS)`  [INFERRED]
  docs/SETUP.md → CLAUDE.md
- `Vercel Deployment Connection` --references--> `Vercel (host)`  [INFERRED]
  docs/SETUP.md → CLAUDE.md
- `Anonymous Sign-ins` --references--> `Auth (email/password, anon session)`  [INFERRED]
  docs/SETUP.md → CLAUDE.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Three Checkers share intake flow** — claude_finished_application_checker, claude_partial_application_checker, claude_ec_checker, claude_shared_intake [EXTRACTED 1.00]
- **Deployment stack: Next.js 16 + Supabase + Vercel** — claude_nextjs_16_stack, claude_supabase, claude_vercel [EXTRACTED 1.00]
- **Reviewer picker: table, RPC count, display lib** — claude_reviewer_picker, claude_reviewers_table, claude_reviewer_active_counts_rpc, claude_reviewers_lib [EXTRACTED 1.00]
- **Reviewer Headshots** — public_counselors_arman_davtyan_arman_davtyan, public_counselors_benjamin_bolger_benjamin_bolger, public_counselors_karly_burke_karly_burke [INFERRED 0.85]

## Communities (25 total, 9 thin omitted)

### Community 0 - "Admin & Reviewer Dashboards"
Cohesion: 0.11
Nodes (36): AdminPage(), metadata, Row, AdminSubmission, AdminSubmissionPage(), Client, ClientsPage(), IntroCall (+28 more)

### Community 1 - "EC Estimator & Submission Views"
Cohesion: 0.08
Nodes (38): metadata, ReviewerSubmissionPage(), ReviewSubmission, SubmissionDetailPage(), update(), EcEstimator(), emptyRow(), Result (+30 more)

### Community 2 - "Auth & Profile Widgets"
Cohesion: 0.10
Nodes (20): Counselor, CounselorProfilePage(), metadata, metadata, AuthForm(), Avatar(), IntroCallForm(), LogoutButton() (+12 more)

### Community 3 - "Product Docs & Domain Concepts"
Cohesion: 0.08
Nodes (31): AGENTS.md, Design Guidelines (white/black/blue, families), EC Checker, Finished Application Checker, Gallatin Strategy Group (GSG), GSG Application Checker, Key Routes, Repo Knowledge Graph (graphify-out) (+23 more)

### Community 4 - "NPM Dependencies"
Cohesion: 0.08
Nodes (23): dependencies, next, react, react-dom, @supabase/ssr, @supabase/supabase-js, devDependencies, eslint (+15 more)

### Community 5 - "Checkout & Pricing"
Cohesion: 0.16
Nodes (14): stripe, POST(), POST(), PaySuccessPage(), Checker, CHECKERS, CheckerType, Price (+6 more)

### Community 6 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 7 - "Checker Form Builder"
Cohesion: 0.13
Nodes (14): ActivityRow, CheckerForm(), emptyActivity(), emptyEssay(), emptySchool(), EssayRow, PartialScope, removeAt() (+6 more)

### Community 8 - "Counselor Directory"
Cohesion: 0.22
Nodes (11): CounselingPage(), Counselor, metadata, STEPS, CounselorCard(), COUNSELOR_CVS, COUNSELOR_PHOTOS, CounselorPhoto (+3 more)

### Community 9 - "Auth & Reviewer-Picker Concepts"
Cohesion: 0.24
Nodes (10): Auth (email/password, anon session), profiles.role (student|reviewer), src/proxy.ts (session refresh), reviewer_active_counts() RPC, Reviewer Picker, src/lib/reviewers.ts, reviewers table (public cards), Anonymous Sign-ins (+2 more)

### Community 10 - "Service Icons & Catalog"
Cohesion: 0.22
Nodes (4): IconProps, Service, ServiceKey, SERVICES

### Community 11 - "UI Primitives & 404"
Cohesion: 0.29
Nodes (5): Button(), Size, sizes, Variant, variants

### Community 12 - "Static SVG Assets"
Cohesion: 0.40
Nodes (6): File Icon (document glyph), Globe Icon (world/web glyph), Next.js Wordmark Logo (scaffold asset), Vercel Triangle Logo (scaffold asset), Window Icon (browser window glyph), GSG App Favicon (blue rounded-square line chart)

### Community 13 - "Root Layout & Fonts"
Cohesion: 0.33
Nodes (4): fraunces, geistMono, geistSans, metadata

### Community 15 - "Counselor Headshots"
Cohesion: 1.00
Nodes (3): Arman Davtyan, Benjamin Bolger, Karly Burke

## Ambiguous Edges - Review These
- `Next.js Wordmark Logo (scaffold asset)` → `GSG App Favicon (blue rounded-square line chart)`  [AMBIGUOUS]
  src/app/icon.svg · relation: conceptually_related_to

## Knowledge Gaps
- **113 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+108 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Next.js Wordmark Logo (scaffold asset)` and `GSG App Favicon (blue rounded-square line chart)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `update()` connect `EC Estimator & Submission Views` to `Checker Form Builder`?**
  _High betweenness centrality (0.150) - this node is a cross-community bridge._
- **Why does `stripe` connect `Checkout & Pricing` to `NPM Dependencies`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _117 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin & Reviewer Dashboards` be split into smaller, more focused modules?**
  _Cohesion score 0.11250873515024458 - nodes in this community are weakly interconnected._
- **Should `EC Estimator & Submission Views` be split into smaller, more focused modules?**
  _Cohesion score 0.08156028368794327 - nodes in this community are weakly interconnected._
- **Should `Auth & Profile Widgets` be split into smaller, more focused modules?**
  _Cohesion score 0.10158730158730159 - nodes in this community are weakly interconnected._