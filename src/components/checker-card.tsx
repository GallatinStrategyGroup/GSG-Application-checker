import type { Checker } from "@/lib/checkers";

// Phase 1: the card is presentational only (no submit yet).
// In Phase 2 the footer becomes a "Start" link into the intake flow.
export function CheckerCard({ checker, index }: { checker: Checker; index: number }) {
  return (
    <article className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm transition hover:border-blue-300 hover:shadow-md">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
        {index + 1}
      </span>
      <span className="mt-5 text-xs font-medium uppercase tracking-wide text-blue-700">
        {checker.tagline}
      </span>
      <h2 className="mt-1 text-lg font-semibold text-zinc-900">{checker.title}</h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600">{checker.description}</p>
      <span className="mt-6 text-sm font-medium text-zinc-400">Available soon</span>
    </article>
  );
}
