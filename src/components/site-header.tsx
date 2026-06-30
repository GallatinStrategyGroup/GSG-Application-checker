import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 font-semibold text-zinc-900">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-700 text-sm font-bold text-white">
            G
          </span>
          GSG Application Checker
        </Link>
        <span className="hidden text-sm text-zinc-500 sm:block">
          Written feedback from reviewers
        </span>
      </div>
    </header>
  );
}
