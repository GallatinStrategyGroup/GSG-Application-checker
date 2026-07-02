import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { SignStudentForm } from "@/components/sign-student-form";
import { Container } from "@/components/ui/container";

interface Client {
  id: string;
  full_name: string | null;
  email: string | null;
  free_checks_remaining: number;
}

export default async function ClientsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "reviewer" && !profile.isAdmin) redirect("/");

  const supabase = await createClient();

  const { data: myReviewer } = await supabase
    .from("reviewers")
    .select("id, name")
    .eq("profile_id", profile.user.id)
    .maybeSingle<{ id: string; name: string }>();

  let clients: Client[] = [];
  if (myReviewer) {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, free_checks_remaining")
      .eq("signed_by_reviewer_id", myReviewer.id)
      .order("created_at", { ascending: false });
    clients = (data ?? []) as Client[];
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-zinc-50/60">
        <Container size="lg" className="py-10 sm:py-14">
          <h1 className="font-serif text-3xl font-medium tracking-tight text-zinc-900 sm:text-4xl">
            Your clients
          </h1>
          <p className="mt-2 text-zinc-600">
            Sign a family to give them 3 free Application Checks, reviewed by the rest of the network.
          </p>

          {!myReviewer ? (
            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
              Your account isn&apos;t linked to a counselor profile yet. Ask an admin to set your{" "}
              <code className="font-mono">reviewers.profile_id</code> to your account, then reload.
            </div>
          ) : (
            <>
              <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-zinc-900">Sign a new family</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Enter the student&apos;s account email. They must have created an account first.
                </p>
                <div className="mt-4">
                  <SignStudentForm />
                </div>
              </div>

              <h2 className="mt-12 font-serif text-2xl font-medium text-zinc-900">
                Signed families
              </h2>
              {clients.length === 0 ? (
                <p className="mt-4 rounded-2xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
                  You haven&apos;t signed any families yet.
                </p>
              ) : (
                <ul className="mt-4 space-y-2.5">
                  {clients.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-zinc-900">{c.full_name || "Student"}</p>
                        <p className="truncate text-sm text-zinc-500">{c.email}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {c.free_checks_remaining} free left
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </Container>
      </main>
    </>
  );
}
