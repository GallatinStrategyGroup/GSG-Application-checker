# Graph Report - .  (2026-07-04)

## Corpus Check
- Corpus is ~25,184 words - fits in a single context window. You may not need a graph.

## Summary
- 276 nodes · 585 edges · 19 communities (14 shown, 5 thin omitted)
- Extraction: 97% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Public Page Routes|Public Page Routes]]
- [[_COMMUNITY_Product & Domain Concepts|Product & Domain Concepts]]
- [[_COMMUNITY_Submission Review UI|Submission Review UI]]
- [[_COMMUNITY_NPM Dependencies|NPM Dependencies]]
- [[_COMMUNITY_Admin & Reviewer Pages|Admin & Reviewer Pages]]
- [[_COMMUNITY_Checker Form Builder|Checker Form Builder]]
- [[_COMMUNITY_Profile & Auth Widgets|Profile & Auth Widgets]]
- [[_COMMUNITY_Checkout & Pricing|Checkout & Pricing]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Counselor Directory|Counselor Directory]]
- [[_COMMUNITY_Service Icons & Catalog|Service Icons & Catalog]]
- [[_COMMUNITY_Static SVG Assets|Static SVG Assets]]
- [[_COMMUNITY_Root Layout & Fonts|Root Layout & Fonts]]
- [[_COMMUNITY_Counselor Headshots|Counselor Headshots]]
- [[_COMMUNITY_OpenGraph Image|OpenGraph Image]]
- [[_COMMUNITY_Session Proxy Middleware|Session Proxy Middleware]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 28 edges
2. `SiteHeader()` - 19 edges
3. `getCurrentProfile()` - 18 edges
4. `getChecker()` - 16 edges
5. `compilerOptions` - 16 edges
6. `SiteFooter()` - 14 edges
7. `Container()` - 11 edges
8. `SubmissionRow` - 11 edges
9. `GSG Application Checker` - 11 edges
10. `createClient()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `GSG App Favicon (blue rounded-square line chart)` --conceptually_related_to--> `Next.js Wordmark Logo (scaffold asset)`  [AMBIGUOUS]
  src/app/icon.svg → public/next.svg
- `GSG Application Checker` --cites--> `Next.js 16 Agent Rules`  [EXTRACTED]
  CLAUDE.md → AGENTS.md
- `Next.js create-next-app project` --conceptually_related_to--> `Next.js 16 (App Router, TS, Tailwind v4)`  [INFERRED]
  README.md → CLAUDE.md
- `supabase/002-uploads.sql (uploads bucket, attachments)` --conceptually_related_to--> `supabase/schema.sql`  [INFERRED]
  docs/SETUP.md → CLAUDE.md
- `Setup Guide (plain language)` --references--> `profiles.role (student|reviewer)`  [EXTRACTED]
  docs/SETUP.md → CLAUDE.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Three Checkers with Shared Intake** — claude_finished_application_checker, claude_partial_application_checker, claude_ec_checker, claude_shared_intake [EXTRACTED 1.00]
- **Reviewer Picker Display Mechanism** — claude_reviewer_picker, claude_reviewer_active_counts_rpc, claude_reviewers_lib [EXTRACTED 1.00]
- **Stripe Payment Confirmation Flow** — docs_setup_stripe_payments, docs_setup_stripe_webhook, docs_setup_service_role_key [EXTRACTED 0.75]
- **Reviewer Headshots** — public_counselors_arman_davtyan_arman_davtyan, public_counselors_benjamin_bolger_benjamin_bolger, public_counselors_karly_burke_karly_burke [INFERRED 0.85]

## Communities (19 total, 5 thin omitted)

### Community 0 - "Public Page Routes"
Cohesion: 0.13
Nodes (17): metadata, OPTIONS, metadata, metadata, StartPage(), AuthForm(), BrandMark(), SiteFooter() (+9 more)

### Community 1 - "Product & Domain Concepts"
Cohesion: 0.10
Nodes (28): Next.js 16 Agent Rules, Anonymous session / draft conversion, EC Checker, Finished Application Checker, Gallatin Strategy Group (GSG), GSG Application Checker, Next.js 16 (App Router, TS, Tailwind v4), Partial Application Checker (+20 more)

### Community 2 - "Submission Review UI"
Cohesion: 0.19
Nodes (17): Row, AdminSubmission, ReviewSubmission, QueueRow, ReviewerActions(), ReviewerOption, StatusBadge(), ActivityView (+9 more)

### Community 3 - "NPM Dependencies"
Cohesion: 0.08
Nodes (24): dependencies, next, react, react-dom, stripe, @supabase/ssr, @supabase/supabase-js, devDependencies (+16 more)

### Community 4 - "Admin & Reviewer Pages"
Cohesion: 0.22
Nodes (18): AdminPage(), metadata, AdminSubmissionPage(), Client, ClientsPage(), ReviewerSubmissionPage(), IntroCall, IntroCallsPage() (+10 more)

### Community 5 - "Checker Form Builder"
Cohesion: 0.12
Nodes (17): ActivityRow, CheckerForm(), emptyActivity(), emptyEssay(), emptySchool(), EssayRow, removeAt(), SchoolRow (+9 more)

### Community 6 - "Profile & Auth Widgets"
Cohesion: 0.17
Nodes (14): Counselor, CounselorProfilePage(), Avatar(), IntroCallForm(), LogoutButton(), ReviewerPicker(), SignStudentForm(), displayedLoad() (+6 more)

### Community 7 - "Checkout & Pricing"
Cohesion: 0.18
Nodes (13): POST(), POST(), PaySuccessPage(), Checker, CHECKERS, CheckerType, Price, PRICES (+5 more)

### Community 8 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 9 - "Counselor Directory"
Cohesion: 0.22
Nodes (11): CounselingPage(), Counselor, metadata, STEPS, CounselorCard(), COUNSELOR_CVS, COUNSELOR_PHOTOS, CounselorPhoto (+3 more)

### Community 10 - "Service Icons & Catalog"
Cohesion: 0.22
Nodes (5): IconProps, ServiceIcon(), Service, ServiceKey, SERVICES

### Community 11 - "Static SVG Assets"
Cohesion: 0.40
Nodes (6): File Icon (document glyph), Globe Icon (world/web glyph), Next.js Wordmark Logo (scaffold asset), Vercel Triangle Logo (scaffold asset), Window Icon (browser window glyph), GSG App Favicon (blue rounded-square line chart)

### Community 12 - "Root Layout & Fonts"
Cohesion: 0.33
Nodes (4): fraunces, geistMono, geistSans, metadata

### Community 13 - "Counselor Headshots"
Cohesion: 1.00
Nodes (3): Arman Davtyan, Benjamin Bolger, Karly Burke

## Ambiguous Edges - Review These
- `Next.js Wordmark Logo (scaffold asset)` → `GSG App Favicon (blue rounded-square line chart)`  [AMBIGUOUS]
  src/app/icon.svg · relation: conceptually_related_to

## Knowledge Gaps
- **89 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+84 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Next.js Wordmark Logo (scaffold asset)` and `GSG App Favicon (blue rounded-square line chart)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `stripe` connect `NPM Dependencies` to `Checkout & Pricing`?**
  _High betweenness centrality (0.112) - this node is a cross-community bridge._
- **Why does `createClient()` connect `Admin & Reviewer Pages` to `Public Page Routes`, `Submission Review UI`, `Profile & Auth Widgets`, `Checkout & Pricing`, `Counselor Directory`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _89 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Public Page Routes` be split into smaller, more focused modules?**
  _Cohesion score 0.1265597147950089 - nodes in this community are weakly interconnected._
- **Should `Product & Domain Concepts` be split into smaller, more focused modules?**
  _Cohesion score 0.09788359788359788 - nodes in this community are weakly interconnected._
- **Should `NPM Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._