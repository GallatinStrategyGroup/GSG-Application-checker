import { TIER_LABELS, type SubmissionRow } from "@/lib/submissions";

export interface SchoolView {
  name: string;
  tier: string;
}
export interface ActivityView {
  role: string | null;
  organization: string | null;
  years: string | null;
  hours: string | null;
  description: string | null;
}
export interface EssayView {
  title: string | null;
  body: string | null;
}

// Read-only view of everything a student entered. Shared by the student's own
// submission page and the reviewer's submission page.
export function SubmissionDetail({
  submission,
  schools,
  activities,
  essays,
}: {
  submission: SubmissionRow;
  schools: SchoolView[];
  activities: ActivityView[];
  essays: EssayView[];
}) {
  return (
    <section className="space-y-6">
      <DetailBlock title="About you">
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <Row label="Intended major" value={submission.intended_major} />
          <Row label="GPA" value={submission.gpa} />
        </dl>
        {schools.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm text-zinc-700">
            {schools.map((s, i) => (
              <li key={i}>
                {s.name} <span className="text-zinc-400">— {TIER_LABELS[s.tier] ?? s.tier}</span>
              </li>
            ))}
          </ul>
        )}
      </DetailBlock>

      {activities.length > 0 && (
        <DetailBlock title="Activities">
          <ul className="space-y-3 text-sm text-zinc-700">
            {activities.map((a, i) => (
              <li key={i} className="border-l-2 border-zinc-200 pl-3">
                <p className="font-medium text-zinc-900">
                  {[a.role, a.organization].filter(Boolean).join(" · ") || "Activity"}
                </p>
                {(a.years || a.hours) && (
                  <p className="text-zinc-500">{[a.years, a.hours].filter(Boolean).join(" · ")}</p>
                )}
                {a.description && <p className="mt-1">{a.description}</p>}
              </li>
            ))}
          </ul>
        </DetailBlock>
      )}

      {essays.length > 0 && (
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
          <p className="whitespace-pre-wrap text-sm text-zinc-700">{submission.supplemental_info}</p>
        </DetailBlock>
      )}
    </section>
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
