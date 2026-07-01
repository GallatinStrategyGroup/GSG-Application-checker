# Setup guide (plain language)

This walks you through the accounts and settings the app needs. You only do
this once. Take your time — nothing here is permanent or hard to undo.

## What you're setting up
- **Supabase** = the database (where submissions and feedback live) **and** the
  login system. One free account covers both.
- **Vercel** = the host. It watches your GitHub repo and puts the site online,
  re-deploying automatically every time we push code.

---

## Step 1 — Create the Supabase project
1. Go to https://supabase.com and sign up (the free plan is fine).
2. Click **New project**. Give it a name (e.g. `gsg-application-checker`).
3. Set a **database password** and save it somewhere safe.
4. Pick a region close to your users and create the project. Give it a minute
   to finish setting up.

## Step 2 — Create the database tables
1. In your Supabase project, open **SQL Editor** (left sidebar) → **New query**.
2. Open the file `supabase/schema.sql` from this project, copy everything, and
   paste it into the editor.
3. Click **Run**. You should see "Success". This creates all the tables and the
   privacy rules.

## Step 2b — Turn on anonymous sign-ins
Students can start filling out a checker before creating an account; their draft
saves to the database under a temporary anonymous session (and gets linked to a
real account in Phase 3).
1. In Supabase, go to **Authentication → Sign In / Providers** (or **Settings**).
2. Enable **Anonymous sign-ins**. Save.

## Step 2c — (Recommended for now) email confirmation
Supabase can require students to click a confirmation link in their email before
their account is active. While you're building and testing, it's simpler to turn
this off so accounts work instantly:
1. **Authentication → Sign In / Providers → Email**.
2. Turn **Confirm email** off (you can turn it back on before launch).

If you leave it on, the app still works — after signing up the student sees
"Check your email to confirm, then log in."

## Step 3 — Get your three keys
1. In Supabase, go to **Project Settings** (gear icon) → **API**.
2. You'll need three values:
   - **Project URL**
   - **anon public** key
   - **service_role** key (this one is secret)

## Step 4 — Put the keys in the project (for local development)
1. In this project, copy `.env.example` to a new file named `.env.local`.
2. Paste the three values from Step 3 into it.
3. `.env.local` is private and never gets committed to GitHub.

## Step 5 — Connect Vercel (to put it online)
1. Go to https://vercel.com and sign up with your GitHub account.
2. Click **Add New → Project** and import the
   `GallatinStrategyGroup/GSG-Application-checker` repo.
3. Before deploying, open **Environment Variables** and add the same three
   values from Step 3 (same names as in `.env.example`).
4. Click **Deploy**. From now on, every push to `main` re-deploys automatically.

---

## How someone becomes a reviewer
Everyone who signs up starts as a **student**. To turn an account into a
reviewer:
1. In Supabase, open **Table Editor** → `profiles`.
2. Find that person's row and change `role` from `student` to `reviewer`.
3. Save. That's it.

Once a person's role is `reviewer`, they log in at `/login` like anyone else and
are taken to the **Review queue** at `/reviewer`, where they can open
submissions, assign them, and write feedback.

## Payments (Stripe)
The EC Check ($63.99) and Application Check ($189.99) are paid via Stripe on the
last step of the wizard. To turn payments on:
1. In Stripe → **Developers → API keys**, copy your **Secret key** (`sk_live_…`
   for real charges, or `sk_test_…` to test with fake cards first).
2. Add it in **Vercel → Settings → Environment Variables** as `STRIPE_SECRET_KEY`
   (and in your local `.env.local` if testing locally), then **Redeploy**.
3. That's it — the pay button will redirect to Stripe's secure checkout, and on
   success the submission is marked submitted automatically.

Until `STRIPE_SECRET_KEY` is set, the pay button just completes the submission
without charging (so the flow still works while you set Stripe up).

### Webhook (reliable payment confirmation)
The redirect back from Stripe marks the submission paid, but a webhook makes it
bulletproof (it still works if the customer closes the tab). To enable it:
1. Add `SUPABASE_SERVICE_ROLE_KEY` in Vercel (from Supabase → Project Settings →
   API → `service_role` key). The webhook uses it to update the submission since
   it runs without a logged-in user.
2. In Stripe → **Developers → Webhooks → Add endpoint**:
   - Endpoint URL: `https://YOUR-SITE.vercel.app/api/stripe/webhook`
   - Event to send: **`checkout.session.completed`**
3. Stripe shows a **Signing secret** (`whsec_…`). Add it in Vercel as
   `STRIPE_WEBHOOK_SECRET`, then **Redeploy**.

> Security: `STRIPE_SECRET_KEY` is powerful — keep it server-side only (never
> `NEXT_PUBLIC_`), and if a secret key ever gets pasted into a chat, email, or
> log, roll it in Stripe (Developers → API keys → Roll).

## Reviewers students can choose from
Students pick a reviewer at the end of a checker. Those reviewer cards come from
the `reviewers` table (separate from logins, so we can show sample people now and
attach real accounts later). The schema seeds four **sample reviewers** (Dr.
Bolger, etc.) so the screen looks populated right away.

The number under each reviewer ("Helping N students now"):
- If 3 or more real students are actually waiting on that reviewer, it shows the
  **real** count.
- If fewer than 3, it shows a **lively placeholder** number that shifts day to
  day. Turn-around time (capped at ~2 days, faster when quiet) follows from it.

When you send me the real reviewers, I'll replace the samples. To do it yourself:
edit rows in **Table Editor → reviewers** (add `name`, `headline`, `bio`, and an
`avatar_url` for a photo). To let a real reviewer's login see their assigned work
in the queue, set that reviewer row's `profile_id` to their account's id.
