"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge } from "@/components/status-badge";
import { type SubmissionStatus } from "@/lib/submissions";
import {
  TIER_VALUES,
  CHANCE_VALUES,
  tierInfo,
  chanceInfo,
  type Tier,
  type ChanceLevel,
  type ActivityScore,
  type SchoolChance,
} from "@/lib/scoring";

interface ReviewerOption {
  id: string;
  name: string;
}

// Compact activity/school shapes the editor needs to render its rows.
export interface ScorableActivity {
  position: number;
  label: string;
}
export interface ScorableSchool {
  name: string;
  tier: string;
}

const fieldClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

export function ReviewerActions({
  submissionId,
  currentUserId,
  currentReviewerId,
  reviewers,
  activities,
  schools,
  initialStatus,
  initialAssignee,
  initialFeedback,
  initialStrengths,
  initialConcerns,
  initialActivityScores,
  initialSchoolChances,
  initialFeedbackId,
}: {
  submissionId: string;
  currentUserId: string;
  currentReviewerId: string | null;
  reviewers: ReviewerOption[];
  activities: ScorableActivity[];
  schools: ScorableSchool[];
  initialStatus: SubmissionStatus;
  initialAssignee: string | null;
  initialFeedback: string;
  initialStrengths: string;
  initialConcerns: string;
  initialActivityScores: ActivityScore[];
  initialSchoolChances: SchoolChance[];
  initialFeedbackId: string | null;
}) {
  const router = useRouter();

  const [status, setStatus] = useState<SubmissionStatus>(initialStatus);
  const [assignee, setAssignee] = useState<string | null>(initialAssignee);
  const [feedback, setFeedback] = useState(initialFeedback);
  const [strengths, setStrengths] = useState(initialStrengths);
  const [concerns, setConcerns] = useState(initialConcerns);
  const [feedbackId, setFeedbackId] = useState<string | null>(initialFeedbackId);

  // Per-activity tier scores, keyed by activity position.
  const [tiers, setTiers] = useState<Record<number, Tier>>(() => {
    const map: Record<number, Tier> = {};
    for (const s of initialActivityScores) map[s.position] = s.tier;
    return map;
  });
  const [tierNotes, setTierNotes] = useState<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    for (const s of initialActivityScores) if (s.note) map[s.position] = s.note;
    return map;
  });

  // Per-school chancing, keyed by school name.
  const [chances, setChances] = useState<Record<string, ChanceLevel>>(() => {
    const map: Record<string, ChanceLevel> = {};
    for (const c of initialSchoolChances) map[c.name] = c.chance;
    return map;
  });
  const [schoolNotes, setSchoolNotes] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const c of initialSchoolChances) if (c.note) map[c.name] = c.note;
    return map;
  });

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  function fail(err: unknown) {
    setMessage({
      kind: "error",
      text: err instanceof Error ? err.message : "Something went wrong.",
    });
  }

  async function changeStatus(next: SubmissionStatus) {
    setBusy(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("submissions")
        .update({ status: next, updated_at: new Date().toISOString() })
        .eq("id", submissionId);
      if (error) throw error;
      setStatus(next);
      router.refresh();
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  }

  async function changeAssignee(next: string | null) {
    setBusy(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("submissions")
        .update({ assigned_reviewer_id: next, updated_at: new Date().toISOString() })
        .eq("id", submissionId);
      if (error) throw error;
      setAssignee(next);
      router.refresh();
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  }

  function buildActivityScores(): ActivityScore[] {
    return activities
      .filter((a) => tiers[a.position] != null)
      .map((a) => ({
        position: a.position,
        tier: tiers[a.position],
        note: tierNotes[a.position]?.trim() || undefined,
      }));
  }

  function buildSchoolChances(): SchoolChance[] {
    return schools
      .filter((s) => chances[s.name] != null)
      .map((s) => ({
        name: s.name,
        tier: s.tier,
        chance: chances[s.name],
        note: schoolNotes[s.name]?.trim() || undefined,
      }));
  }

  async function saveFeedback() {
    if (!feedback.trim() && !strengths.trim() && !concerns.trim()) {
      setMessage({
        kind: "error",
        text: "Add an overall summary, strengths, or concerns before marking this reviewed.",
      });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const now = new Date().toISOString();

      const payload = {
        body: feedback.trim() || null,
        strengths: strengths.trim() || null,
        concerns: concerns.trim() || null,
        activity_scores: buildActivityScores(),
        school_chances: buildSchoolChances(),
      };

      if (feedbackId) {
        const { error } = await supabase
          .from("feedback")
          .update({ ...payload, reviewer_id: currentUserId, updated_at: now })
          .eq("id", feedbackId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("feedback")
          .insert({ submission_id: submissionId, reviewer_id: currentUserId, ...payload })
          .select("id")
          .single();
        if (error) throw error;
        setFeedbackId(data.id as string);
      }

      // Saving feedback marks the submission reviewed.
      await supabase
        .from("submissions")
        .update({ status: "reviewed", updated_at: now })
        .eq("id", submissionId);
      setStatus("reviewed");

      setMessage({ kind: "ok", text: "Feedback saved and shared with the student." });
      router.refresh();
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">Review</h2>
        <StatusBadge status={status} />
      </div>

      {/* Assignment */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label className="text-sm text-zinc-600">
          Assigned to
          <select
            className="ml-2 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none"
            value={assignee ?? ""}
            disabled={busy}
            onChange={(e) => changeAssignee(e.target.value || null)}
          >
            <option value="">Unassigned</option>
            {reviewers.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        {currentReviewerId && assignee !== currentReviewerId && (
          <button
            type="button"
            disabled={busy}
            onClick={() => changeAssignee(currentReviewerId)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
          >
            Assign to me
          </button>
        )}
      </div>

      {/* Status controls */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || status === "in_review"}
          onClick={() => changeStatus("in_review")}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
        >
          Mark in review
        </button>
        <button
          type="button"
          disabled={busy || status === "submitted"}
          onClick={() => changeStatus("submitted")}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
        >
          Move back to queue
        </button>
      </div>

      {/* ---- Structured feedback template ---- */}
      <div className="mt-6 space-y-6 border-t border-zinc-100 pt-6">
        <FieldBlock label="Overall summary" hint="The headline read the student sees first.">
          <textarea
            className={`${fieldClass} min-h-32`}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Your overall take on this application and where it stands for the listed schools."
          />
        </FieldBlock>

        <div className="grid gap-6 sm:grid-cols-2">
          <FieldBlock label="Strengths" hint="What's working — be specific.">
            <textarea
              className={`${fieldClass} min-h-28`}
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              placeholder="e.g. Clear narrative spike in robotics; strong 'why us' for MIT."
            />
          </FieldBlock>
          <FieldBlock label="Concerns / what to improve" hint="The most useful part for the student.">
            <textarea
              className={`${fieldClass} min-h-28`}
              value={concerns}
              onChange={(e) => setConcerns(e.target.value)}
              placeholder="e.g. Activities read as scattered; personal statement buries the lead."
            />
          </FieldBlock>
        </div>

        {/* Per-activity tier scores */}
        {activities.length > 0 && (
          <div>
            <p className="text-sm font-medium text-zinc-700">Activity tiers</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Rate each activity 1–4. Tier 1 = national/exceptional, Tier 4 = general
              participation.
            </p>
            <div className="mt-3 space-y-3">
              {activities.map((a) => (
                <div key={a.position} className="rounded-lg border border-zinc-200 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium text-zinc-900">{a.label}</span>
                    <select
                      className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none"
                      value={tiers[a.position] ?? ""}
                      onChange={(e) =>
                        setTiers({ ...tiers, [a.position]: Number(e.target.value) as Tier })
                      }
                    >
                      <option value="">Not rated</option>
                      {TIER_VALUES.map((t) => (
                        <option key={t} value={t}>
                          {tierInfo(t).label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    className={`${fieldClass} mt-2`}
                    value={tierNotes[a.position] ?? ""}
                    onChange={(e) => setTierNotes({ ...tierNotes, [a.position]: e.target.value })}
                    placeholder="Optional note for this activity"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Per-school chancing */}
        {schools.length > 0 && (
          <div>
            <p className="text-sm font-medium text-zinc-700">School-specific chances</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Your read on where this student stands for each target school.
            </p>
            <div className="mt-3 space-y-3">
              {schools.map((s) => (
                <div key={s.name} className="rounded-lg border border-zinc-200 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium text-zinc-900">{s.name}</span>
                    <select
                      className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none"
                      value={chances[s.name] ?? ""}
                      onChange={(e) =>
                        setChances({ ...chances, [s.name]: e.target.value as ChanceLevel })
                      }
                    >
                      <option value="">No read yet</option>
                      {CHANCE_VALUES.map((c) => (
                        <option key={c} value={c}>
                          {chanceInfo(c).label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    className={`${fieldClass} mt-2`}
                    value={schoolNotes[s.name] ?? ""}
                    onChange={(e) => setSchoolNotes({ ...schoolNotes, [s.name]: e.target.value })}
                    placeholder="Optional school-specific note"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {message && (
        <p
          className={`mt-4 rounded-lg px-3 py-2 text-sm ${
            message.kind === "ok" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </p>
      )}

      <button
        type="button"
        disabled={busy}
        onClick={saveFeedback}
        className="mt-6 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
      >
        {busy ? "Working…" : "Save feedback & mark reviewed"}
      </button>
    </div>
  );
}

function FieldBlock({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700">{label}</label>
      {hint && <p className="mt-0.5 text-xs text-zinc-500">{hint}</p>}
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
