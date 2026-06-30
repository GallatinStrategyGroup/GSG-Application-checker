import Link from "next/link";
import { checkerPath, type Checker } from "@/lib/checkers";

export function CheckerCard({ checker, index }: { checker: Checker; index: number }) {
  return (
    <Link
      href={checkerPath(checker.type)}
      className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm transition hover:border-blue-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
        {index + 1}
      </span>
      <span className="mt-5 text-xs font-medium uppercase tracking-wide text-blue-700">
        {checker.tagline}
      </span>
      <h2 className="mt-1 text-lg font-semibold text-zinc-900">{checker.title}</h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600">{checker.description}</p>
      <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-blue-700">
        Start
        <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </span>
    </Link>
  );
}
