import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { getChecker } from "@/lib/checkers";
import { SiteHeader } from "@/components/site-header";
import { StatusBadge } from "@/components/status-badge";
import {
  SubmissionDetail,
  type ActivityView,
  type EssayView,
  type SchoolView,
} from "@/components/submission-detail";
import { ReviewerActions } from "@/components/reviewer-actions";
import { type SubmissionRow } from "@/lib/submissions";

interface ReviewSubmission extends SubmissionRow {
  student_id: string;
  assigned_reviewer_id: string | null;
}

export default async function ReviewerSubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "reviewer") redirect("/submissions");

  const supabase = await createClient();

  const { data: submission } = await supabase
    .from("submissions")
    .select(
      "id, type, status, intended_major, gpa, supplemental_info, updated_at, submitted_at, student_id, assigned_reviewer_id",
    )
    .eq("id", id)
    .maybeSingle<ReviewSubmission>();

  if (!submission) {
    notFound();
  }

  const [{ data: schools }, { data: activities }, { data: essays }, { data: feedback }, { data: student }, { data: reviewerRows }, { data: myReviewer }] =
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
        .select("id, body")
        .eq("submission_id", id)
        .maybeSingle<{ id: string; body: string | null }>(),
      supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", submission.student_id)
        .maybeSingle<{ full_name: string | null; email: string | null }>(),
      supabase.from("reviewers").select("id, name").order("display_order"),
      supabase
        .from("reviewers")
        .select("id")
        .eq("profile_id", profile.user.id)
        .maybeSingle<{ id: string }>(),
    ]);

  const { data: atts } = await supabase
    .from("attachments")
    .select("title, file_name, file_path")
    .eq("submission_id", id)
    .order("created_at");

  const files = await Promise.all(
    (atts ?? []).map(async (a) => {
      const { data: signed } = await supabase.storage
        .from("uploads")
        .createSignedUrl(a.file_path, 3600);
      return { title: a.title, file_name: a.file_name, url: signed?.signedUrl ?? null };
    }),
  );

  const checker = getChecker(submission.type);
  const studentName = student?.full_name || student?.email || "Student";
  const reviewers = (reviewerRows ?? []).map((r) => ({
    id: r.id as string,
    name: r.name as string,
  }));
  const currentReviewerId = myReviewer?.id ?? null;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-6 py-10 sm:py-14">
          <Link href="/reviewer" className="text-sm font-medium text-blue-700 hover:underline">
            ← Review queue
          </Link>

          <div className="mt-4 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                {checker?.title ?? submission.type}
              </h1>
              <p className="mt-1 text-sm text-zinc-500">{studentName}</p>
            </div>
            <StatusBadge status={submission.status} />
          </div>

          <div className="mt-8">
            <ReviewerActions
              submissionId={submission.id}
              currentUserId={profile.user.id}
              currentReviewerId={currentReviewerId}
              reviewers={reviewers}
              initialStatus={submission.status}
              initialAssignee={submission.assigned_reviewer_id}
              initialFeedback={feedback?.body ?? ""}
              initialFeedbackId={feedback?.id ?? null}
            />
          </div>

          <h2 className="mt-10 text-lg font-semibold text-zinc-900">Submission</h2>
          <div className="mt-4">
            <SubmissionDetail
              submission={submission}
              schools={(schools ?? []) as SchoolView[]}
              activities={(activities ?? []) as ActivityView[]}
              essays={(essays ?? []) as EssayView[]}
              files={files}
            />
          </div>
        </div>
      </main>
    </>
  );
}
