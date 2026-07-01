import Link from "next/link";
import { notFound } from "next/navigation";
import { getChecker } from "@/lib/checkers";
import { CheckerForm } from "@/components/checker-form";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";

// Next.js 16: `params` is a Promise and must be awaited.
export default async function StartPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const checker = getChecker(type);

  if (!checker) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-zinc-50/60">
        <Container size="lg" className="py-10 sm:py-14">
          <Link
            href="/"
            className="text-sm font-medium text-blue-700 transition-colors hover:text-blue-800"
          >
            ← All checkers
          </Link>
          <h1 className="mt-4 font-serif text-3xl font-medium tracking-tight text-zinc-900 sm:text-4xl">
            {checker.title}
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-600">{checker.intro}</p>

          <div className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <CheckerForm checker={checker} />
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
