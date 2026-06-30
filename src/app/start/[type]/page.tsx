import Link from "next/link";
import { notFound } from "next/navigation";
import { getChecker } from "@/lib/checkers";
import { CheckerForm } from "@/components/checker-form";
import { SiteHeader } from "@/components/site-header";

// Next.js 16: `params` is a Promise and must be awaited.
export default async function StartPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const checker = getChecker(type);

  // Unknown type (e.g. /start/banana) → 404.
  if (!checker) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-6 py-10 sm:py-14">
          <Link href="/" className="text-sm font-medium text-blue-700 hover:underline">
            ← All checkers
          </Link>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            {checker.title}
          </h1>
          <p className="mt-2 text-zinc-600">{checker.intro}</p>

          <CheckerForm checker={checker} />
        </div>
      </main>
    </>
  );
}
