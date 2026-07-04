"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge } from "@/components/status-badge";
import { type SubmissionStatus } from "@/lib/submissions";

interface ReviewerOption {
  id: string;
  name: string;
}

export function ReviewerActions({
  submissionId,
  currentUserId,
  currentReviewerId,
  reviewers,
  initialStatus,
  initialAssignee,
  initialFeedback,
  initialFeedbackId,
}: {
  submissionId: string;
  // The logged-in reviewer's profile id (used to author feedback).
  currentUserId: string;
  // The logged-in reviewer's row in the reviewers table, if their account is
  // linked to one (used for "assign to me"). Null for staff not set up as a card.
  currentReviewerId: string | null;
  reviewers: ReviewerOption[];
  initialStatus: SubmissionStatus;
  initialAssignee: string | null;
  initialFeedback: string;
  initialFeedbackId: string | null;
}) {
  const router = useRouter();

  const [status, setStatus] = useState<SubmissionStatus>(initialStatus);
  const [assignee, setAssignee] = useState<string | null>(initialAssignee);
  const [feedback, setFeedback] = useState(initialFeedback);
  const [feedbackId, setFeedbackId] = useState<string | null>(initialFeedbackId);
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

  async function saveFeedback() {
    if (!feedback.trim()) {
      setMessage({ kind: "error", text: "Write some feedback before marking this reviewed." });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const now = new Date().toISOString();

      if (feedbackId) {
        const { error } = await supabase
          .from("feedback")
          .update({ body: feedback, reviewer_id: currentUserId, updated_at: now })
          .eq("id", feedbackId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("feedback")
          .insert({ submission_id: submissionId, reviewer_id: currentUserId, body: feedback })
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

      {/* Feedback editor */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-zinc-700">Feedback for the student</label>
        <textarea
          className="mt-1 min-h-48 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Write specific, school-by-school feedback here. The student will see exactly this text."
        />
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
        className="mt-5 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
      >
        {busy ? "Working…" : "Save feedback & mark reviewed"}
      </button>
    </div>
  );
}
