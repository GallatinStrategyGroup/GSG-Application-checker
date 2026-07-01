-- =============================================================
-- Real GSG counselors — run once in Supabase (SQL Editor → New query → Run).
-- Replaces the sample reviewers with the real counseling team.
-- Sullivan has his full bio; the other three get names + headlines now, with
-- full bios/photos to follow once their CVs are available.
-- =============================================================

delete from public.reviewers;

insert into public.reviewers (name, headline, bio, display_order) values
  ('Dr. Benjamin Bolger', 'Founder, Bolger Strategic', null, 1),
  ('Dr. Arman Davtyan', 'College admissions counselor', null, 2),
  ('Karly Burke', 'College admissions counselor', null, 3),
  ('Dr. Daniel Sullivan', 'Harvard-trained admissions strategist',
   'Senior consultant at Bolger Strategic since 2011 and a Harvard teaching fellow. Builds highly customized admissions strategies using Howard Gardner''s Theory of Multiple Intelligences, with deep expertise in college essay editing and narrative storytelling.',
   4);
