// The three checkers, defined once and reused across the app
// (homepage now; intake + forms in later phases).

export type CheckerType = "finished" | "partial" | "ec";

export interface Checker {
  type: CheckerType;
  title: string;
  tagline: string;
  description: string;
}

export const CHECKERS: Checker[] = [
  {
    type: "finished",
    title: "Finished Application Checker",
    tagline: "Ready to submit",
    description:
      "Share your complete application — activities and full essays — and get thorough written feedback before you apply.",
  },
  {
    type: "partial",
    title: "Partial Application Checker",
    tagline: "Work in progress",
    description:
      "Submit whatever you have so far. Nothing is required — save your draft and come back to add more any time.",
  },
  {
    type: "ec",
    title: "Extracurricular (EC) Checker",
    tagline: "Activities only",
    description:
      "Just your activities. Find out whether your extracurriculars are strong enough for the schools on your list.",
  },
];
