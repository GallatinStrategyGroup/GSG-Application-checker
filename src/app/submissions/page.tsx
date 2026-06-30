import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, isSignedIn } from "@/lib/auth";
import { getChecker } from "@/lib/checkers";
import { SiteHeader } from "@/components/site-header";
import { StatusBadge } from "@/components/status-badge";
import { type SubmissionRow } from "@/lib/submissions";

export default async function SubmissionsPage() {
  // Must be a real (non-anonymous) account.
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
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-6 py-10 sm:py-14">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Your submissions</h1>
            <Link
              href="/"
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
            >
              New submission
            </Link>
          </div>

          {submissions.length === 0 ? (
            <p className="mt-10 rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
              You don&apos;t have any submissions yet. Choose a checker from the{" "}
              <Link href="/" className="font-semibold text-blue-700 hover:underline">
                home page
              </Link>{" "}
              to get started.
            </p>
          ) : (
            <ul className="mt-8 space-y-3">
              {submissions.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/submissions/${s.id}`}
                    className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
                  >
                    <div>
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
        </div>
      </main>
    </>
  );
}
