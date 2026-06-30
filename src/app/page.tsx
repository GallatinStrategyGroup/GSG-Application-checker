import { CHECKERS } from "@/lib/checkers";
import { CheckerCard } from "@/components/checker-card";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
              Get real written feedback on your college application
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-zinc-600">
              Choose how much you want to share. Reviewers read your work and leave specific,
              school-by-school feedback — so the advice fits the schools you are actually aiming for.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CHECKERS.map((checker, index) => (
              <CheckerCard key={checker.type} checker={checker} index={index} />
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-6 text-sm text-zinc-500">
          © Gallatin Strategy Group
        </div>
      </footer>
    </>
  );
}
