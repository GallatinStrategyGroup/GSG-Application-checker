import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
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

interface AdminSubmission extends SubmissionRow {
  student_id: string;
  assigned_reviewer_id: string | null;
}

export default async function AdminSubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!profile.isAdmin) redirect("/");

  const supabase = await createClient();

  const { data: submission } = await supabase
    .from("submissions")
    .select(
      "id, type, status, intended_major, gpa, supplemental_info, updated_at, submitted_at, student_id, assigned_reviewer_id",
    )
    .eq("id", id)
    .maybeSingle<AdminSubmission>();

  if (!submission) notFound();

  const [{ data: schools }, { data: activities }, { data: essays }, { data: atts }, { data: feedback }, { data: student }] =
    await Promise.all([
      supabase.from("target_schools").select("name, tier").eq("submission_id", id),
      supabase
        .from("activities")
        .select("role, organization, years, hours, description")
        .eq("submission_id", id)
        .order("position"),
      supabase.from("essays").select("title, body").eq("submission_id", id).order("position"),
      supabase
        .from("attachments")
        .select("title, file_name, file_path")
        .eq("submission_id", id)
        .order("created_at"),
      supabase
        .from("feedback")
        .select("body")
        .eq("submission_id", id)
        .maybeSingle<{ body: string | null }>(),
      supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", submission.student_id)
        .maybeSingle<{ full_name: string | null; email: string | null }>(),
    ]);

  const files = await Promise.all(
    (atts ?? []).map(async (a) => {
      const { data: signed } = await supabase.storage
        .from("uploads")
        .createSignedUrl(a.file_path, 3600);
      return { title: a.title, file_name: a.file_name, url: signed?.signedUrl ?? null };
    }),
  );

  let counselorName: string | null = null;
  if (submission.assigned_reviewer_id) {
    const { data: rev } = await supabase
      .from("reviewers")
      .select("name")
      .eq("id", submission.assigned_reviewer_id)
      .maybeSingle<{ name: string }>();
    counselorName = rev?.name ?? null;
  }

  const checker = getChecker(submission.type);

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-zinc-50/60">
        <Container size="lg" className="py-10 sm:py-14">
          <Link href="/admin" className="text-sm font-medium text-blue-700 hover:text-blue-800">
            ← Admin
          </Link>

          <div className="mt-4 flex items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl font-medium tracking-tight text-zinc-900">
                {checker?.title ?? submission.type}
              </h1>
              <p className="mt-1.5 text-sm text-zinc-500">
                {student?.full_name || student?.email || "Student"}
                {counselorName ? ` · Counselor: ${counselorName}` : " · Unassigned"}
              </p>
            </div>
            <StatusBadge status={submission.status} />
          </div>

          {feedback?.body && (
            <section className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="font-serif text-xl font-medium text-zinc-900">Counselor feedback</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                {feedback.body}
              </p>
            </section>
          )}

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
