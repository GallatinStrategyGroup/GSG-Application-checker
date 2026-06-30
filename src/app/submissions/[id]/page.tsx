import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, isSignedIn } from "@/lib/auth";
import { getChecker } from "@/lib/checkers";
import { SiteHeader } from "@/components/site-header";
import { StatusBadge } from "@/components/status-badge";
import { TIER_LABELS, type SubmissionRow } from "@/lib/submissions";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!isSignedIn(user)) {
    redirect("/login");
  }

  const supabase = await createClient();

  // RLS guarantees students can only read their own submissions.
  const { data: submission } = await supabase
    .from("submissions")
    .select("id, type, status, intended_major, gpa, supplemental_info, updated_at, submitted_at")
    .eq("id", id)
    .maybeSingle<SubmissionRow>();

  if (!submission) {
    notFound();
  }

  const [{ data: schools }, { data: activities }, { data: essays }, { data: feedback }] =
    await Promise.all([
      supabase.from("target_schools").select("name, tier").eq("submission_id", id),
      supabase
        .from("activities")
        .select("role, organization, years, hours, description")
        .eq("submission_id", id)
        .order("position"),
      supabase.from("essays").select("title, body").eq("submission_id", id).order("position"),
      supabase
        .from("feedback")
        .select("body, updated_at")
        .eq("submission_id", id)
        .maybeSingle<{ body: string | null; updated_at: string }>(),
    ]);

  const checker = getChecker(submission.type);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-6 py-10 sm:py-14">
          <Link href="/submissions" className="text-sm font-medium text-blue-700 hover:underline">
            ← Your submissions
          </Link>

          <div className="mt-4 flex items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              {checker?.title ?? submission.type}
            </h1>
            <StatusBadge status={submission.status} />
          </div>

          {/* Feedback first — it's what they came back for. */}
          <section className="mt-8 rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-zinc-900">Reviewer feedback</h2>
            {feedback?.body ? (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                {feedback.body}
              </p>
            ) : (
              <p className="mt-3 text-sm text-zinc-500">
                {submission.status === "draft"
                  ? "This is still a draft. Submit it for review to receive feedback."
                  : "Your submission is in the queue. Feedback will appear here once a reviewer responds."}
              </p>
            )}
          </section>

          {/* Read-only summary of what was submitted */}
          <section className="mt-8 space-y-6">
            <DetailBlock title="About you">
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <Row label="Intended major" value={submission.intended_major} />
                <Row label="GPA" value={submission.gpa} />
              </dl>
              {schools && schools.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm text-zinc-700">
                  {schools.map((s, i) => (
                    <li key={i}>
                      {s.name}{" "}
                      <span className="text-zinc-400">— {TIER_LABELS[s.tier] ?? s.tier}</span>
                    </li>
                  ))}
                </ul>
              )}
            </DetailBlock>

            {activities && activities.length > 0 && (
              <DetailBlock title="Activities">
                <ul className="space-y-3 text-sm text-zinc-700">
                  {activities.map((a, i) => (
                    <li key={i} className="border-l-2 border-zinc-200 pl-3">
                      <p className="font-medium text-zinc-900">
                        {[a.role, a.organization].filter(Boolean).join(" · ") || "Activity"}
                      </p>
                      {(a.years || a.hours) && (
                        <p className="text-zinc-500">
                          {[a.years, a.hours].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      {a.description && <p className="mt-1">{a.description}</p>}
                    </li>
                  ))}
                </ul>
              </DetailBlock>
            )}

            {essays && essays.length > 0 && (
              <DetailBlock title="Essays">
                <div className="space-y-4 text-sm text-zinc-700">
                  {essays.map((e, i) => (
                    <div key={i}>
                      {e.title && <p className="font-medium text-zinc-900">{e.title}</p>}
                      {e.body && <p className="mt-1 whitespace-pre-wrap">{e.body}</p>}
                    </div>
                  ))}
                </div>
              </DetailBlock>
            )}

            {submission.supplemental_info && (
              <DetailBlock title="Additional info">
                <p className="whitespace-pre-wrap text-sm text-zinc-700">
                  {submission.supplemental_info}
                </p>
              </DetailBlock>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

function DetailBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-zinc-500">{label}</dt>
      <dd className="text-zinc-900">{value || "—"}</dd>
    </div>
  );
}
