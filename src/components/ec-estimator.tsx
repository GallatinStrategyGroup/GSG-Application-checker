"use client";

import { useState } from "react";
import Link from "next/link";
import { estimateActivityTier, tierInfo, type ActivityLike, type Tier } from "@/lib/scoring";

interface Row {
  role: string;
  organization: string;
  years: string;
  hours: string;
  description: string;
}

const emptyRow = (): Row => ({
  role: "",
  organization: "",
  years: "",
  hours: "",
  description: "",
});

interface Result {
  row: Row;
  tier: Tier;
  reasons: string[];
}

const fieldClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

// A free, instant, rule-based estimate — NO AI, no account, nothing saved.
// It's a top-of-funnel taste of the paid human review.
export function EcEstimator() {
  const [rows, setRows] = useState<Row[]>([emptyRow()]);
  const [results, setResults] = useState<Result[] | null>(null);

  function update(i: number, patch: Partial<Row>) {
    setRows(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function estimate() {
    const filled = rows.filter((r) => r.role.trim() || r.organization.trim() || r.description.trim());
    if (filled.length === 0) return;
    setResults(
      filled.map((row) => {
        const a: ActivityLike = row;
        const { tier, reasons } = estimateActivityTier(a);
        return { row, tier, reasons };
      }),
    );
  }

  function reset() {
    setResults(null);
  }

  if (results) {
    return (
      <div>
        <div className="space-y-4">
          {results.map((res, i) => {
            const info = tierInfo(res.tier);
            const name =
              [res.row.role, res.row.organization].filter(Boolean).join(" · ") || "Activity";
            return (
              <div key={i} className="rounded-xl border border-zinc-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-zinc-900">{name}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${info.pill}`}>
                    {info.label}
                  </span>
                </div>
                <p className="mt-2 text-sm text-zinc-600">{info.blurb}</p>
                {res.reasons.length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm text-zinc-600">
                    {res.reasons.map((r, j) => (
                      <li key={j} className="flex gap-2">
                        <span aria-hidden className="text-zinc-400">
                          •
                        </span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-6">
          <p className="text-sm leading-relaxed text-blue-900">
            This is an instant, automated estimate — not a verdict. A real counselor reads context a
            formula can&apos;t: how your activities fit together, your story, and each school&apos;s
            priorities. That&apos;s what a full review gives you.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/start/ec"
              className="inline-block rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Get a real EC review
            </Link>
            <button
              type="button"
              onClick={reset}
              className="inline-block rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-100"
            >
              Try more activities
            </button>
          </div>
        </div>

        <p className="mt-4 text-xs text-zinc-400">
          Nothing you enter here is saved. This estimate never leaves your browser.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4">
        {rows.map((r, i) => (
          <div key={i} className="rounded-xl border border-zinc-200 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className={fieldClass}
                value={r.role}
                onChange={(e) => update(i, { role: e.target.value })}
                placeholder="Role / position (e.g. Team Captain)"
              />
              <input
                className={fieldClass}
                value={r.organization}
                onChange={(e) => update(i, { organization: e.target.value })}
                placeholder="Organization (e.g. Varsity Soccer)"
              />
              <input
                className={fieldClass}
                value={r.years}
                onChange={(e) => update(i, { years: e.target.value })}
                placeholder="Years involved (e.g. 9, 10, 11, 12)"
              />
              <input
                className={fieldClass}
                value={r.hours}
                onChange={(e) => update(i, { hours: e.target.value })}
                placeholder="Hours (e.g. 10 hrs/wk)"
              />
            </div>
            <textarea
              className={`${fieldClass} mt-3 min-h-20`}
              value={r.description}
              onChange={(e) => update(i, { description: e.target.value })}
              placeholder="What you did and the impact you had — be specific."
            />
            {rows.length > 1 && (
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setRows(rows.filter((_, idx) => idx !== i))}
                  className="text-sm font-medium text-zinc-400 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setRows([...rows, emptyRow()])}
        className="mt-3 text-sm font-semibold text-blue-700 hover:underline"
      >
        + Add activity
      </button>

      <div className="mt-6 border-t border-zinc-200 pt-6">
        <button
          type="button"
          onClick={estimate}
          className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
        >
          See my tier estimate
        </button>
        <p className="mt-3 text-xs text-zinc-400">
          Free and instant. No account, and nothing you type is saved.
        </p>
      </div>
    </div>
  );
}
