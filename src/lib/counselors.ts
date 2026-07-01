// Rich counselor data: photos (with face-framing) and bullet-point CVs.
// Keyed by the EXACT `reviewers.name` so we can match a DB counselor.

export interface CvSection {
  heading: string;
  items: string[];
}

export interface CounselorPhoto {
  src: string;
  // object-position to keep the face nicely framed in the round avatar crop.
  position?: string;
}

export const COUNSELOR_PHOTOS: Record<string, CounselorPhoto> = {
  "Dr. Benjamin Bolger": { src: "/counselors/benjamin-bolger.webp", position: "28% 26%" },
  "Dr. Arman Davtyan": { src: "/counselors/arman-davtyan.webp", position: "50% 16%" },
};

export function getCounselorPhoto(name: string): CounselorPhoto | null {
  return COUNSELOR_PHOTOS[name] ?? null;
}

export const COUNSELOR_CVS: Record<string, CvSection[]> = {
  "Dr. Benjamin Bolger": [
    {
      heading: "Education",
      items: [
        "Doctorate — Harvard University",
        "More than a dozen graduate degrees from institutions including Stanford and Columbia",
        "B.A. with highest honors — University of Michigan",
      ],
    },
    {
      heading: "Experience",
      items: [
        "Founder, Bolger Strategic — 20+ years of college admissions consulting",
        "Has guided students into many of the most selective colleges in the world",
        "Previously worked at the White House",
      ],
    },
    {
      heading: "Honors",
      items: ["Multiple-time recipient of Harvard's Derek Bok teaching award"],
    },
  ],

  "Dr. Arman Davtyan": [
    {
      heading: "Experience",
      items: [
        "Founder, The Admissions Desk",
        "Over two decades of experience in higher education",
        "Served on admission committees at selective institutions",
      ],
    },
    {
      heading: "Approach",
      items: [
        "Personalized, one-on-one advising focused on clarity, structure, and self-discovery",
        "Helps each student present their narrative authentically",
      ],
    },
  ],

  "Karly Burke": [
    {
      heading: "Education",
      items: ["Dual Bachelor's and Master's degrees"],
    },
    {
      heading: "Experience",
      items: [
        "Educator at Newton North High School — curriculum development and mentoring new teachers",
        "A leader in modern educational methodology focused on student success",
      ],
    },
  ],

  "Dr. Daniel Sullivan": [
    {
      heading: "Experience",
      items: [
        "Senior Consultant, Bolger Strategic (2011–present) — comprehensive college admissions consulting alongside Dr. Benjamin Bolger; strategy built on Howard Gardner's Theory of Multiple Intelligences; extensive essay editing and narrative storytelling.",
        "Teaching Fellow, Harvard University (2021–present) — Socratic instruction on moral and political philosophy; two-time recipient of the Derek Bok Certificate of Distinction in Teaching.",
        "Inaugural Fellow & Ambassador, Shafik Gabr Foundation, East-West Initiative (2013–present) — the Foundation's first American Ambassador; a decade of US–Egypt citizen diplomacy.",
        "Chief of Staff / Legislative Aide, Massachusetts House of Representatives (2000–2011) — directed legislative strategy across education, veterans' affairs, land use, and budget.",
      ],
    },
    {
      heading: "Education",
      items: [
        "Master of Liberal Arts, Globalization — Dartmouth College (expected 2027)",
        "B.A., Government — Harvard University (2003)",
        "Graduate, Harvard Mediation Program — Harvard Law School (2017)",
        "Certificate in Theology and Ministry — Princeton Theological Seminary (2016)",
        "Seminar in Moral Foundations of Law — The Witherspoon Institute, Princeton (2021)",
      ],
    },
    {
      heading: "Fellowships",
      items: [
        "Edmund Burke Fellow — The Academy of Philosophy & Letters (2026)",
        "C.S. Lewis Fellow — Discovery Institute (2026)",
        "Burke to Buckley Fellow — National Review Institute (2024)",
        "Constitution Fellow — Center for the Study of Statesmanship (2020)",
      ],
    },
    {
      heading: "Honors",
      items: [
        "Derek Bok Certificate of Distinction in Teaching, Harvard University (2024 & 2026)",
        "Ten Outstanding Young Americans, U.S. Jaycees (2010)",
        "Henry Toll Fellow, Council of State Governments (2004)",
      ],
    },
  ],
};

export function getCounselorCv(name: string): CvSection[] | null {
  return COUNSELOR_CVS[name] ?? null;
}
