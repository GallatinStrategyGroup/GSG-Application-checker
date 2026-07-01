import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, isSignedIn } from "@/lib/auth";
import { getChecker } from "@/lib/checkers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { StatusBadge } from "@/components/status-badge";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { type SubmissionRow } from "@/lib/submissions";

export default async function SubmissionsPage() {
  const user = await getCurrentUser();
  if (!isSignedIn(user)) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("submissions")
    .select("id, type, status, intended_major, gpa, supplemental_info, updated_at, submitted_at")
    .eq("student_id", user!.id)
    .order("updated_at", { ascending: false });

  const submissions = (data ?? []) as SubmissionRow[];

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-zinc-50/60">
        <Container size="lg" className="py-10 sm:py-14">
          <div className="flex items-center justify-between gap-4">
            <h1 className="font-serif text-3xl font-medium tracking-tight text-zinc-900 sm:text-4xl">
              Your submissions
            </h1>
            <Button href="/">New submission</Button>
          </div>

          {submissions.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
              <p className="text-sm text-zinc-500">
                You don&apos;t have any submissions yet. Choose a checker from the{" "}
                <Link href="/" className="font-semibold text-blue-700 hover:underline">
                  home page
                </Link>{" "}
                to get started.
              </p>
            </div>
          ) : (
            <ul className="mt-8 space-y-3">
              {submissions.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/submissions/${s.id}`}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-900">
                        {getChecker(s.type)?.title ?? s.type}
                      </p>
                      <p className="mt-0.5 text-sm text-zinc-500">
                        {s.intended_major ? `${s.intended_major} · ` : ""}
                        Updated {new Date(s.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={s.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
