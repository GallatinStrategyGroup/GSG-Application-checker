import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { getChecker } from "@/lib/checkers";
import { SiteHeader } from "@/components/site-header";
import { StatusBadge } from "@/components/status-badge";
import { type SubmissionRow } from "@/lib/submissions";

interface QueueRow extends SubmissionRow {
  student_id: string;
  assigned_reviewer_id: string | null;
}

export default async function ReviewerQueuePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "reviewer") redirect("/submissions");

  const supabase = await createClient();

  // Only real submissions appear in the queue — drafts stay private.
  const { data } = await supabase
    .from("submissions")
    .select(
      "id, type, status, intended_major, gpa, supplemental_info, updated_at, submitted_at, student_id, assigned_reviewer_id",
    )
    .in("status", ["submitted", "in_review", "reviewed"])
    .order("submitted_at", { ascending: true, nullsFirst: false });

  const rows = (data ?? []) as QueueRow[];

  // Student names come from profiles; assignee names come from the reviewers table.
  const studentIds = Array.from(new Set(rows.map((r) => r.student_id)));
  const reviewerIds = Array.from(
    new Set(rows.map((r) => r.assigned_reviewer_id).filter(Boolean) as string[]),
  );

  const studentNames = new Map<string, string>();
  if (studentIds.length) {
    const { data: people } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", studentIds);
    (people ?? []).forEach((p) =>
      studentNames.set(p.id, p.full_name || p.email || "Unknown"),
    );
  }

  const reviewerNames = new Map<string, string>();
  if (reviewerIds.length) {
    const { data: revs } = await supabase
      .from("reviewers")
      .select("id, name")
      .in("id", reviewerIds);
    (revs ?? []).forEach((r) => reviewerNames.set(r.id, r.name));
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-4xl px-6 py-10 sm:py-14">
          <h1 className="font-serif text-3xl font-medium tracking-tight text-zinc-900">
            Review queue
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            {rows.length} submission{rows.length === 1 ? "" : "s"} in the queue.
          </p>

          {rows.length === 0 ? (
            <p className="mt-10 rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
              Nothing to review yet. Submitted work will appear here.
            </p>
          ) : (
            <ul className="mt-8 space-y-3">
              {rows.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/reviewer/${r.id}`}
                    className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-900">
                        {getChecker(r.type)?.title ?? r.type}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-zinc-500">
                        {studentNames.get(r.student_id) ?? "Unknown student"}
                        {r.intended_major ? ` · ${r.intended_major}` : ""}
                        {r.assigned_reviewer_id
                          ? ` · Assigned to ${reviewerNames.get(r.assigned_reviewer_id) ?? "reviewer"}`
                          : " · Unassigned"}
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
