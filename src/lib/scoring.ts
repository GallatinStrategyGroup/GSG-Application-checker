// Shared scoring model — used by the reviewer feedback editor, the student's
// feedback view, and the free (rule-based, no-AI) EC tier estimator.
//
// The "four tiers" mirror how selective-admissions readers commonly bucket
// extracurriculars: a small number of exceptional, national-level activities
// at the top, down to broad participation at the bottom.

export type Tier = 1 | 2 | 3 | 4;

export interface TierInfo {
  tier: Tier;
  label: string;
  blurb: string;
  /** Tailwind classes for the little pill. */
  pill: string;
}

// Ordered strongest → most common.
export const TIERS: Record<Tier, TierInfo> = {
  1: {
    tier: 1,
    label: "Tier 1 — Exceptional",
    blurb:
      "National or international distinction. Rare achievements that stand out on their own (e.g. major award, recognized founder, elite competitor).",
    pill: "bg-blue-700 text-white",
  },
  2: {
    tier: 2,
    label: "Tier 2 — Standout",
    blurb:
      "Strong, sustained leadership or real, measurable impact — clearly above typical involvement (e.g. president, captain, editor, notable results).",
    pill: "bg-blue-100 text-blue-800",
  },
  3: {
    tier: 3,
    label: "Tier 3 — Solid",
    blurb:
      "Consistent involvement with some leadership or responsibility. A dependable part of a well-rounded application.",
    pill: "bg-zinc-200 text-zinc-800",
  },
  4: {
    tier: 4,
    label: "Tier 4 — Common",
    blurb:
      "General membership or participation. Shows interest, but is widely shared among applicants.",
    pill: "bg-zinc-100 text-zinc-500",
  },
};

export const TIER_VALUES: Tier[] = [1, 2, 3, 4];

export function tierInfo(tier: Tier): TierInfo {
  return TIERS[tier];
}

// -------------------------------------------------------------
// School-specific chancing — a reviewer's read on the student's
// standing for one target school, given everything they submitted.
// -------------------------------------------------------------

export type ChanceLevel = "reach" | "target" | "likely" | "safe";

export interface ChanceInfo {
  level: ChanceLevel;
  label: string;
  pill: string;
}

export const CHANCES: Record<ChanceLevel, ChanceInfo> = {
  reach: { level: "reach", label: "Reach", pill: "bg-amber-100 text-amber-800" },
  target: { level: "target", label: "Target", pill: "bg-blue-100 text-blue-800" },
  likely: { level: "likely", label: "Likely", pill: "bg-green-100 text-green-700" },
  safe: { level: "safe", label: "Safe", pill: "bg-green-100 text-green-700" },
};

export const CHANCE_VALUES: ChanceLevel[] = ["reach", "target", "likely", "safe"];

export function chanceInfo(level: ChanceLevel): ChanceInfo {
  return CHANCES[level] ?? CHANCES.target;
}

// -------------------------------------------------------------
// JSON shapes stored on the feedback row (see migration 010).
// -------------------------------------------------------------

export interface ActivityScore {
  position: number; // matches activities.position
  tier: Tier;
  note?: string;
}

export interface SchoolChance {
  name: string;
  tier?: string; // the student's own reach/match/safety tag, for context
  chance: ChanceLevel;
  note?: string;
}

// Narrowing helpers for values read back from jsonb (which is `unknown`).
export function asTier(v: unknown): Tier {
  const n = typeof v === "number" ? v : Number(v);
  return (n >= 1 && n <= 4 ? n : 3) as Tier;
}

export function asChance(v: unknown): ChanceLevel {
  return CHANCE_VALUES.includes(v as ChanceLevel) ? (v as ChanceLevel) : "target";
}

export function parseActivityScores(raw: unknown): ActivityScore[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((r) => {
    const o = (r ?? {}) as Record<string, unknown>;
    return {
      position: typeof o.position === "number" ? o.position : Number(o.position) || 0,
      tier: asTier(o.tier),
      note: typeof o.note === "string" ? o.note : undefined,
    };
  });
}

export function parseSchoolChances(raw: unknown): SchoolChance[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((r) => {
    const o = (r ?? {}) as Record<string, unknown>;
    return {
      name: typeof o.name === "string" ? o.name : "",
      tier: typeof o.tier === "string" ? o.tier : undefined,
      chance: asChance(o.chance),
      note: typeof o.note === "string" ? o.note : undefined,
    };
  });
}

// =============================================================
// Rule-based tier estimator — NO AI.
//
// Powers the free "EC tier estimate" hook and can pre-inform students.
// It is intentionally transparent: a set of keyword + commitment signals
// nudges an activity up or down the four tiers. This is an estimate, not a
// verdict — the paid product is a real human read.
// =============================================================

export interface ActivityLike {
  role?: string | null;
  organization?: string | null;
  years?: string | null;
  hours?: string | null;
  description?: string | null;
}

export interface TierEstimate {
  tier: Tier;
  reasons: string[];
}

// National / exceptional signals (Tier 1 territory).
const ELITE_WORDS = [
  "national",
  "international",
  "olympiad",
  "olympic",
  "isef",
  "intel",
  "regeneron",
  "world",
  "usa",
  "team usa",
  "gold medal",
  "first place",
  "1st place",
  "champion",
  "championship",
  "valedictorian",
  "published",
  "patent",
  "recruited",
  "division i",
  "d1",
];

// Leadership / distinction signals (Tier 2 territory).
const LEADER_WORDS = [
  "founder",
  "co-founder",
  "founded",
  "president",
  "captain",
  "editor-in-chief",
  "editor in chief",
  "director",
  "lead",
  "leader",
  "head",
  "chair",
  "captained",
  "award",
  "awarded",
  "won",
  "winner",
  "scholarship",
  "state",
  "regional",
  "selected",
  "competitive",
];

// Impact signals — real, measurable outcomes (Tier 2 territory).
const IMPACT_WORDS = [
  "raised",
  "founded",
  "launched",
  "organized",
  "grew",
  "increased",
  "built",
  "created",
  "managed",
  "mentored",
  "taught",
  "$",
  "members",
  "volunteers",
];

function hasAny(haystack: string, words: string[]): string | null {
  for (const w of words) {
    if (haystack.includes(w)) return w;
  }
  return null;
}

// Pull the biggest number out of a free-text field like "10 hrs/wk, 30 wks/yr".
function biggestNumber(s: string | null | undefined): number {
  if (!s) return 0;
  const nums = s.match(/\d+(\.\d+)?/g);
  if (!nums) return 0;
  return Math.max(...nums.map(Number));
}

// Count distinct years mentioned (e.g. "9, 10, 11, 12" → 4).
function countYears(s: string | null | undefined): number {
  if (!s) return 0;
  const nums = s.match(/\d+/g);
  return nums ? new Set(nums).size : 0;
}

export function estimateActivityTier(a: ActivityLike): TierEstimate {
  const text = [a.role, a.organization, a.description].filter(Boolean).join(" ").toLowerCase();
  const reasons: string[] = [];

  // Start at the middle of the pack.
  let score = 0;

  const elite = hasAny(text, ELITE_WORDS);
  if (elite) {
    score += 3;
    reasons.push(`National / distinction signal ("${elite}")`);
  }

  const leader = hasAny(text, LEADER_WORDS);
  if (leader) {
    score += 2;
    reasons.push(`Leadership or recognition ("${leader}")`);
  }

  const impact = hasAny(text, IMPACT_WORDS);
  if (impact) {
    score += 1;
    reasons.push(`Signs of real impact ("${impact}")`);
  }

  const yrs = countYears(a.years);
  if (yrs >= 3) {
    score += 1;
    reasons.push(`Sustained commitment (${yrs} years)`);
  } else if (yrs === 1) {
    reasons.push("Only one year shown — sustained commitment matters");
  }

  const hrs = biggestNumber(a.hours);
  if (hrs >= 10) {
    score += 1;
    reasons.push(`Significant time commitment (${hrs}+ hrs)`);
  }

  const detail = (a.description ?? "").trim().length;
  if (detail >= 120) {
    score += 1;
    reasons.push("Described with specific, concrete detail");
  } else if (detail > 0 && detail < 40) {
    reasons.push("Description is thin — add specifics and outcomes");
  }

  // Map the score to a tier.
  let tier: Tier;
  if (elite && score >= 4) tier = 1;
  else if (score >= 3) tier = 2;
  else if (score >= 1) tier = 3;
  else tier = 4;

  if (reasons.length === 0) {
    reasons.push("Reads as general participation — add leadership, results, or impact");
  }

  return { tier, reasons };
}
