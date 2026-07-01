-- =============================================================
-- Real GSG counselors — run once in Supabase (SQL Editor → New query → Run).
-- Replaces the sample reviewers with the real counseling team.
-- Safe to re-run: it clears the table and re-inserts the current roster.
-- =============================================================

delete from public.reviewers;

insert into public.reviewers (name, headline, bio, avatar_url, display_order) values
  ('Dr. Benjamin Bolger', 'Founder, Bolger Strategic',
   'Founder of Bolger Strategic and among the most credentialed educators in the country — a Harvard doctorate plus more than a dozen graduate degrees from institutions including Stanford and Columbia. Over 20 years guiding students into the most selective colleges, and a multiple-time recipient of Harvard''s Derek Bok teaching award.',
   '/counselors/benjamin-bolger.webp', 1),

  ('Dr. Arman Davtyan', 'Founder, The Admissions Desk',
   'Founder of The Admissions Desk with over two decades in higher education, including service on admission committees at selective institutions. An immigrant who navigated the college search with little guidance, he blends deep industry knowledge with compassionate, individualized advising.',
   '/counselors/arman-davtyan.webp', 2),

  ('Dr. Daniel Sullivan', 'Harvard-trained admissions strategist',
   'Senior consultant at Bolger Strategic since 2011 and a Harvard teaching fellow. Builds highly customized admissions strategies using Howard Gardner''s Theory of Multiple Intelligences, with deep expertise in college essay editing and narrative storytelling.',
   null, 3),

  ('Karly Burke', 'Educator & curriculum specialist',
   'An influential educator with dual Bachelor''s and Master''s degrees. At Newton North High School she enhanced curricula and mentored incoming teachers, and she remains a leader in modern educational methodology focused on student success.',
   null, 4);
