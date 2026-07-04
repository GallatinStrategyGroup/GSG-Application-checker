import {
  tierInfo,
  chanceInfo,
  type ActivityScore,
  type SchoolChance,
} from "@/lib/scoring";

export interface ActivityLabel {
  position: number;
  label: string;
}

// Read-only, student-facing render of a reviewer's structured feedback.
export function FeedbackView({
  body,
  strengths,
  concerns,
  activityScores,
  schoolChances,
  activityLabels,
}: {
  body: string | null;
  strengths: string | null;
  concerns: string | null;
  activityScores: ActivityScore[];
  schoolChances: SchoolChance[];
  activityLabels: ActivityLabel[];
}) {
  const labelFor = (position: number) =>
    activityLabels.find((a) => a.position === position)?.label ?? "Activity";

  const hasAnything =
    body?.trim() ||
    strengths?.trim() ||
    concerns?.trim() ||
    activityScores.length > 0 ||
    schoolChances.length > 0;

  if (!hasAnything) return null;

  return (
    <div className="space-y-6">
      {body?.trim() && (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">{body}</p>
      )}

      {(strengths?.trim() || concerns?.trim()) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {strengths?.trim() && (
            <Panel title="Strengths" tone="good">
              {strengths}
            </Panel>
          )}
          {concerns?.trim() && (
            <Panel title="What to improve" tone="warn">
              {concerns}
            </Panel>
          )}
        </div>
      )}

      {activityScores.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">Activity tiers</h3>
          <p className="mt-0.5 text-xs text-zinc-500">
            Tier 1 = national / exceptional · Tier 4 = general participation.
          </p>
          <ul className="mt-3 space-y-2">
            {activityScores.map((s) => {
              const info = tierInfo(s.tier);
              return (
                <li
                  key={s.position}
                  className="rounded-lg border border-zinc-200 p-3 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-zinc-900">{labelFor(s.position)}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${info.pill}`}
                    >
                      {info.label}
                    </span>
                  </div>
                  {s.note && <p className="mt-1.5 text-zinc-600">{s.note}</p>}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {schoolChances.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">School-specific read</h3>
          <ul className="mt-3 space-y-2">
            {schoolChances.map((c) => {
              const info = chanceInfo(c.chance);
              return (
                <li key={c.name} className="rounded-lg border border-zinc-200 p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-zinc-900">{c.name}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${info.pill}`}
                    >
                      {info.label}
                    </span>
                  </div>
                  {c.note && <p className="mt-1.5 text-zinc-600">{c.note}</p>}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function Panel({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "good" | "warn";
  children: React.ReactNode;
}) {
  const styles =
    tone === "good"
      ? "border-green-200 bg-green-50/60"
      : "border-amber-200 bg-amber-50/60";
  return (
    <div className={`rounded-xl border p-4 ${styles}`}>
      <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
      <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
        {children}
      </p>
    </div>
  );
}
