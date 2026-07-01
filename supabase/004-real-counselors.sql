-- =============================================================
-- Real GSG counselors — run once in Supabase (SQL Editor → New query → Run).
-- Replaces the sample reviewers with the real counseling team.
-- Safe to re-run: it clears the table and re-inserts the current roster.
-- =============================================================

delete from public.reviewers;

insert into public.reviewers (name, headline, bio, avatar_url, display_order) values
  ('Dr. Benjamin Bolger', 'Founder, Bolger Strategic',
   'Among the most credentialed people in the country — 16+ degrees including a Harvard doctorate (Doctor of Design) and master''s from Oxford, Cambridge, and Stanford. Featured in The New York Times Magazine and The Harvard Crimson, and a multiple-time recipient of Harvard''s Derek Bok teaching award.',
   '/counselors/benjamin-bolger.webp', 1),

  ('Dr. Arman Davtyan', 'Assistant Dean of Enrollment Mgmt, Pepperdine',
   'Founder of The Admissions Desk and Assistant Dean of Enrollment Management at Pepperdine''s Graziadio Business School, with over two decades reading applications and leading admissions at the university level. Blends insider admissions knowledge with compassionate, individualized advising.',
   '/counselors/arman-davtyan.webp', 2),

  ('Karly Burke', 'Educator & curriculum specialist',
   'An influential educator with dual Bachelor''s and Master''s degrees. At Newton North High School she enhanced curricula and mentored incoming teachers, and she remains a leader in modern educational methodology focused on student success.',
   '/counselors/karly-burke.webp', 3),

  ('Dr. Daniel Sullivan', 'Harvard-trained admissions strategist',
   'Senior consultant at Bolger Strategic since 2011 and a Harvard teaching fellow. Builds highly customized admissions strategies using Howard Gardner''s Theory of Multiple Intelligences, with deep expertise in college essay editing and narrative storytelling.',
   null, 4);
