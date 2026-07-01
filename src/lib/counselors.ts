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
      heading: "Featured in",
      items: [
        "The New York Times Magazine",
        "The Harvard Crimson",
        "The Chronicle of Higher Education",
      ],
    },
    {
      heading: "Education",
      items: [
        "Doctor of Design — Harvard University Graduate School of Design",
        "Master's degrees from Oxford, Cambridge, Stanford, Columbia, Brown, Dartmouth, and Brandeis",
        "B.A. with highest honors — University of Michigan",
        "16+ academic degrees — among the most credentialed people in the country",
      ],
    },
    {
      heading: "Experience",
      items: [
        "Founder, Bolger Strategic — 20+ years of college admissions consulting",
        "Multiple-time recipient of Harvard's Derek Bok teaching award",
        "Has guided students into many of the world's most selective colleges",
      ],
    },
  ],

  "Dr. Arman Davtyan": [
    {
      heading: "Experience",
      items: [
        "Assistant Dean of Enrollment Management, Pepperdine University (Graziadio Business School)",
        "Founder, The Admissions Desk",
        "Over two decades reading applications and leading admissions in higher education",
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
        "Senior Consultant, Bolger Strategic (2011–present) — comprehensive admissions consulting and expert college essay editing.",
        "Teaching Fellow, Harvard University — two-time recipient of the Derek Bok Certificate of Distinction in Teaching.",
      ],
    },
    {
      heading: "Education",
      items: [
        "B.A., Government — Harvard University",
        "Master of Liberal Arts, Globalization — Dartmouth College (expected 2027)",
      ],
    },
  ],
};

export function getCounselorCv(name: string): CvSection[] | null {
  return COUNSELOR_CVS[name] ?? null;
}
