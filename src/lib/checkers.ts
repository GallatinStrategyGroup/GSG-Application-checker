// The three checkers, defined once and reused across the app
// (homepage, intake forms, and later the reviewer queue).

export type CheckerType = "finished" | "partial" | "ec";

export interface Checker {
  type: CheckerType;
  title: string;
  tagline: string;
  description: string;
  /** Heading shown on the form page. */
  intro: string;
  /** Does this checker collect full essays? */
  hasEssays: boolean;
  /** Does this checker collect free-text supplemental info? */
  hasSupplemental: boolean;
  /** Is anything required to submit? (Partial = save anything, nothing required.) */
  requiresIntakeToSubmit: boolean;
}

export const CHECKERS: Checker[] = [
  {
    type: "finished",
    title: "Finished Application Checker",
    tagline: "Ready to submit",
    description:
      "Share your complete application — activities and full essays — and get thorough written feedback before you apply.",
    intro:
      "Share your complete application. Add your activities and essays, then submit for written feedback.",
    hasEssays: true,
    hasSupplemental: true,
    requiresIntakeToSubmit: true,
  },
  {
    type: "partial",
    title: "Partial Application Checker",
    tagline: "Work in progress",
    description:
      "Submit whatever you have so far. Nothing is required — save your draft and come back to add more any time.",
    intro:
      "A work in progress is welcome. Fill in whatever is ready, save your draft, and return any time to add more.",
    hasEssays: true,
    hasSupplemental: true,
    requiresIntakeToSubmit: false,
  },
  {
    type: "ec",
    title: "Extracurricular (EC) Checker",
    tagline: "Activities only",
    description:
      "Just your activities. Find out whether your extracurriculars are strong enough for the schools on your list.",
    intro:
      "Just your activities. We'll look at whether your extracurriculars are competitive for the schools on your list.",
    hasEssays: false,
    hasSupplemental: false,
    requiresIntakeToSubmit: true,
  },
];

export function getChecker(type: string): Checker | undefined {
  return CHECKERS.find((c) => c.type === type);
}

export function checkerPath(type: CheckerType): string {
  return `/start/${type}`;
}
