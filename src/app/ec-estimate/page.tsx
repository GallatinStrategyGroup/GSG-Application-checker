import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { EcEstimator } from "@/components/ec-estimator";
import { TIERS, TIER_VALUES } from "@/lib/scoring";

export const metadata = {
  title: "Free EC Tier Estimate",
  description:
    "A free, instant estimate of how strong your extracurriculars are — using the four-tier framework admissions readers know. No account, nothing saved.",
};

export default function EcEstimatePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-zinc-50/60">
        <Container size="lg" className="py-12 sm:py-16">
          <Link
            href="/"
            className="text-sm font-medium text-blue-700 transition-colors hover:text-blue-800"
          >
            ← Home
          </Link>

          <div className="mt-4 max-w-2xl">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              Free · Instant · No sign-up
            </span>
            <h1 className="mt-4 font-serif text-4xl font-medium tracking-tight text-zinc-900">
              How strong are your extracurriculars?
            </h1>
            <p className="mt-3 text-lg leading-relaxed text-zinc-600">
              Enter an activity or two and get an instant tier estimate, based on the four-tier
              framework admissions readers commonly use. It&apos;s an automated starting point — a
              real counselor review reads the context a formula can&apos;t.
            </p>
          </div>

          {/* The four tiers, up front so the estimate has meaning. */}
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TIER_VALUES.map((t) => {
              const info = TIERS[t];
              return (
                <div key={t} className="rounded-xl border border-zinc-200 bg-white p-4">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${info.pill}`}>
                    {info.label}
                  </span>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-500">{info.blurb}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <EcEstimator />
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
