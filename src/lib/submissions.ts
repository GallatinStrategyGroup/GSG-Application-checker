import type { CheckerType } from "@/lib/checkers";

export type SubmissionStatus = "draft" | "submitted" | "in_review" | "reviewed";

export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  in_review: "In review",
  reviewed: "Reviewed",
};

// Tailwind classes for the little status pill.
export const STATUS_STYLES: Record<SubmissionStatus, string> = {
  draft: "bg-zinc-100 text-zinc-600",
  submitted: "bg-blue-100 text-blue-700",
  in_review: "bg-amber-100 text-amber-800",
  reviewed: "bg-green-100 text-green-700",
};

export const TIER_LABELS: Record<string, string> = {
  reach: "Reach",
  match: "Match",
  safety: "Safety",
};

// Shared row shapes read back from the database.
export interface SubmissionRow {
  id: string;
  type: CheckerType;
  status: SubmissionStatus;
  intended_major: string | null;
  gpa: string | null;
  supplemental_info: string | null;
  updated_at: string;
  submitted_at: string | null;
}
