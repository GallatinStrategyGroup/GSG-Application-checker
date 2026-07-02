import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { getChecker } from "@/lib/checkers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { StatusBadge } from "@/components/status-badge";
import { Container } from "@/components/ui/container";
import { type SubmissionStatus } from "@/lib/submissions";

interface Row {
  id: string;
  type: "finished" | "partial" | "ec";
  status: SubmissionStatus;
  intended_major: string | null;
  student_id: string;
  assigned_reviewer_id: string | null;
  updated_at: string;
}

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!profile.isAdmin) redirect("/");

  const supabase = await createClient();

  const [
    { data: counselors },
    { count: signedCount },
    { count: activeCount },
    { data: counts },
    { data: recent },
  ] = await Promise.all([
    supabase.from("reviewers").select("id, name").order("display_order"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .not("signed_by_reviewer_id", "is", null),
    supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .in("status", ["submitted", "in_review"]),
    supabase.rpc("reviewer_active_counts"),
    supabase
      .from("submissions")
      .select("id, type, status, intended_major, student_id, assigned_reviewer_id, updated_at")
      .in("status", ["submitted", "in_review", "reviewed"])
      .order("updated_at", { ascending: false })
      .limit(30),
  ]);

  const counselorList = (counselors ?? []) as { id: string; name: string }[];
  const rows = (recent ?? []) as Row[];

  const load = new Map<string, number>();
  for (const c of (counts ?? []) as { reviewer_id: string; active_count: number }[]) {
    load.set(c.reviewer_id, Number(c.active_count) || 0);
  }

  // Names for the recent-applications list.
  const studentIds = Array.from(new Set(rows.map((r) => r.student_id)));
  const studentNames = new Map<string, string>();
  if (studentIds.length) {
    const { data: people } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", studentIds);
    (people ?? []).forEach((p) => studentNames.set(p.id, p.full_name || p.email || "Unknown"));
  }
  const reviewerNames = new Map(counselorList.map((c) => [c.id, c.name]));

  const stats = [
    { label: "Counselors onboarded", value: counselorList.length },
    { label: "Families signed", value: signedCount ?? 0 },
    { label: "Active applications", value: activeCount ?? 0 },
  ];

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-zinc-50/60">
        <Container className="py-10 sm:py-14">
          <h1 className="font-serif text-3xl font-medium tracking-tight text-zinc-900 sm:text-4xl">
            Admin
          </h1>
          <p className="mt-2 text-zinc-600">A live view of the GSG counselor network.</p>

          {/* Stat cards */}
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-zinc-500">{s.label}</p>
                <p className="mt-2 font-serif text-4xl font-medium text-zinc-900">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Per-counselor load */}
          <h2 className="mt-12 font-serif text-2xl font-medium text-zinc-900">Counselor load</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-100 text-left text-xs uppercase tracking-wide text-zinc-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Counselor</th>
                  <th className="px-5 py-3 font-medium">Applications in queue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {counselorList.map((c) => (
                  <tr key={c.id}>
                    <td className="px-5 py-3 font-medium text-zinc-900">{c.name}</td>
                    <td className="px-5 py-3 text-zinc-600">{load.get(c.id) ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent applications */}
          <h2 className="mt-12 font-serif text-2xl font-medium text-zinc-900">
            Recent applications
          </h2>
          {rows.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
              No applications yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {rows.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/admin/submissions/${r.id}`}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-900">
                        {getChecker(r.type)?.title ?? r.type}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-zinc-500">
                        {studentNames.get(r.student_id) ?? "Unknown"}
                        {r.assigned_reviewer_id
                          ? ` · ${reviewerNames.get(r.assigned_reviewer_id) ?? "counselor"}`
                          : " · Unassigned"}
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
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
