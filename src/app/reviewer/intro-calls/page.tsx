import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";

interface IntroCall {
  id: string;
  reviewer_id: string | null;
  student_name: string | null;
  email: string | null;
  phone: string | null;
  preferred_times: string | null;
  message: string | null;
  created_at: string;
}

export default async function IntroCallsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "reviewer") redirect("/submissions");

  const supabase = await createClient();
  const { data } = await supabase
    .from("intro_call_requests")
    .select("id, reviewer_id, student_name, email, phone, preferred_times, message, created_at")
    .order("created_at", { ascending: false });

  const requests = (data ?? []) as IntroCall[];

  const reviewerIds = Array.from(
    new Set(requests.map((r) => r.reviewer_id).filter(Boolean) as string[]),
  );
  const names = new Map<string, string>();
  if (reviewerIds.length) {
    const { data: revs } = await supabase.from("reviewers").select("id, name").in("id", reviewerIds);
    (revs ?? []).forEach((r) => names.set(r.id, r.name));
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-6 py-10 sm:py-14">
          <h1 className="font-serif text-3xl font-medium tracking-tight text-zinc-900">
            Intro call requests
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            {requests.length} request{requests.length === 1 ? "" : "s"} to follow up on.
          </p>

          {requests.length === 0 ? (
            <p className="mt-10 rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
              No intro call requests yet.
            </p>
          ) : (
            <ul className="mt-8 space-y-3">
              {requests.map((r) => (
                <li key={r.id} className="rounded-xl border border-zinc-200 bg-white p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-zinc-900">{r.student_name || "Someone"}</p>
                    <span className="text-xs text-zinc-400">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-600">
                    Wants: {r.reviewer_id ? names.get(r.reviewer_id) ?? "a counselor" : "a counselor"}
                  </p>
                  <dl className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
                    {r.email && (
                      <p className="text-zinc-700">
                        <span className="text-zinc-500">Email:</span> {r.email}
                      </p>
                    )}
                    {r.phone && (
                      <p className="text-zinc-700">
                        <span className="text-zinc-500">Phone:</span> {r.phone}
                      </p>
                    )}
                    {r.preferred_times && (
                      <p className="text-zinc-700">
                        <span className="text-zinc-500">Best times:</span> {r.preferred_times}
                      </p>
                    )}
                  </dl>
                  {r.message && (
                    <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-700">{r.message}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
