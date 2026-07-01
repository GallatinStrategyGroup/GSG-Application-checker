import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, isSignedIn } from "@/lib/auth";
import { getChecker } from "@/lib/checkers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { StatusBadge } from "@/components/status-badge";
import { Container } from "@/components/ui/container";
import {
  SubmissionDetail,
  type ActivityView,
  type EssayView,
  type SchoolView,
} from "@/components/submission-detail";
import { type SubmissionRow } from "@/lib/submissions";

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
    .select(
      "id, type, status, intended_major, gpa, supplemental_info, updated_at, submitted_at, assigned_reviewer_id",
    )
    .eq("id", id)
    .maybeSingle<SubmissionRow & { assigned_reviewer_id: string | null }>();

  if (!submission) {
    notFound();
  }

  // Name of the reviewer the student chose (if any).
  let reviewerName: string | null = null;
  if (submission.assigned_reviewer_id) {
    const { data: reviewer } = await supabase
      .from("reviewers")
      .select("name")
      .eq("id", submission.assigned_reviewer_id)
      .maybeSingle<{ name: string }>();
    reviewerName = reviewer?.name ?? null;
  }

  const [{ data: schools }, { data: activities }, { data: essays }, { data: feedback }, { data: atts }] =
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
      supabase
        .from("attachments")
        .select("title, file_name, file_path")
        .eq("submission_id", id)
        .order("created_at"),
    ]);

  const files = await Promise.all(
    (atts ?? []).map(async (a) => {
      const { data: signed } = await supabase.storage
        .from("uploads")
        .createSignedUrl(a.file_path, 3600);
      return { title: a.title, file_name: a.file_name, url: signed?.signedUrl ?? null };
    }),
  );

  const checker = getChecker(submission.type);

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-zinc-50/60">
        <Container size="lg" className="py-10 sm:py-14">
          <Link
            href="/submissions"
            className="text-sm font-medium text-blue-700 transition-colors hover:text-blue-800"
          >
            ← Your submissions
          </Link>

          <div className="mt-4 flex items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl font-medium tracking-tight text-zinc-900 sm:text-4xl">
                {checker?.title ?? submission.type}
              </h1>
              {reviewerName && (
                <p className="mt-1.5 text-sm text-zinc-500">Reviewer: {reviewerName}</p>
              )}
            </div>
            <StatusBadge status={submission.status} />
          </div>

          {/* Feedback first — it's what they came back for. */}
          <section className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="font-serif text-xl font-medium text-zinc-900">Reviewer feedback</h2>
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
          <div className="mt-8">
            <SubmissionDetail
              submission={submission}
              schools={(schools ?? []) as SchoolView[]}
              activities={(activities ?? []) as ActivityView[]}
              essays={(essays ?? []) as EssayView[]}
              files={files}
            />
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
