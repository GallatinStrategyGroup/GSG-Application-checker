import Link from "next/link";
import { SERVICES } from "@/lib/services";
import { ServiceIcon } from "@/components/icons";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-medium text-blue-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              Reviewed by real counselors — not software
            </span>

            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-zinc-900 sm:text-5xl">
              Get your college application reviewed by the{" "}
              <span className="text-blue-700">best counselors in the country.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-600">
              Upload your work or type it in, choose a counselor, and get specific, school-by-school
              feedback — built to be simple for students and parents alike.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/apply"
                className="rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
              >
                Check my application
              </Link>
              <Link
                href="/counseling"
                className="rounded-xl border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50"
              >
                Explore 1-on-1 counseling
              </Link>
            </div>
          </div>
        </section>

        {/* The three services */}
        <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Choose how you want help
          </h2>
          <p className="mt-2 text-zinc-600">Three ways to get expert eyes on your application.</p>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {SERVICES.map((service) => (
              <Link
                key={service.key}
                href={service.href}
                className={`group relative flex flex-col rounded-3xl border p-8 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${
                  service.featured
                    ? "border-blue-600 bg-blue-700 text-white"
                    : "border-zinc-200 bg-white"
                }`}
              >
                {service.featured && (
                  <span className="absolute right-6 top-6 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                    Flagship
                  </span>
                )}

                <span
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${
                    service.featured ? "bg-white/15 text-white" : "bg-blue-50 text-blue-700"
                  }`}
                >
                  <ServiceIcon service={service.key} className="h-6 w-6" />
                </span>

                <span
                  className={`mt-6 text-xs font-semibold uppercase tracking-wide ${
                    service.featured ? "text-blue-100" : "text-blue-700"
                  }`}
                >
                  {service.eyebrow}
                </span>
                <h3
                  className={`mt-1 text-2xl font-semibold ${
                    service.featured ? "text-white" : "text-zinc-900"
                  }`}
                >
                  {service.title}
                </h3>
                <p
                  className={`mt-2 text-sm leading-relaxed ${
                    service.featured ? "text-blue-50" : "text-zinc-600"
                  }`}
                >
                  {service.description}
                </p>

                <ul className="mt-5 space-y-2 text-sm">
                  {service.points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <span
                        className={service.featured ? "text-blue-200" : "text-blue-600"}
                        aria-hidden
                      >
                        ✓
                      </span>
                      <span className={service.featured ? "text-blue-50" : "text-zinc-600"}>
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>

                <span
                  className={`mt-8 inline-flex items-center gap-1 text-sm font-semibold ${
                    service.featured ? "text-white" : "text-blue-700"
                  }`}
                >
                  {service.cta}
                  <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-zinc-100 bg-zinc-50">
          <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">How it works</h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {[
                {
                  n: "1",
                  t: "Share your work",
                  d: "Drag and drop your Common App, essays, or activities — or type them in. Add a title for each piece.",
                },
                {
                  n: "2",
                  t: "Pick your counselor",
                  d: "Browse counselor profiles with turn-around times and choose who reviews your work.",
                },
                {
                  n: "3",
                  t: "Get real feedback",
                  d: "Your counselor sends specific, written feedback tailored to the schools on your list.",
                },
              ].map((step) => (
                <div key={step.n}>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-sm font-semibold text-white">
                    {step.n}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-zinc-900">{step.t}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">{step.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-8 text-sm text-zinc-500">
          © Gallatin Strategy Group
        </div>
      </footer>
    </>
  );
}
