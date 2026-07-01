import { SERVICES } from "@/lib/services";
import { ServiceIcon } from "@/components/icons";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

const TRUST = [
  { label: "Real counselors, never AI", icon: "user" },
  { label: "Private & secure", icon: "shield" },
  { label: "Feedback in ~2 days", icon: "clock" },
];

const STEPS = [
  {
    t: "Share your work",
    d: "Drag in your Common App, essays, or activities — or type them in. Add a title for each piece so nothing gets lost.",
  },
  {
    t: "Choose your counselor",
    d: "Browse real counselor profiles with turn-around times, and pick who reviews your application.",
  },
  {
    t: "Get real feedback",
    d: "Your counselor sends specific, written notes tailored to the exact schools on your list.",
  },
];

const FAQ = [
  {
    q: "Who actually reviews my application?",
    a: "A real counselor you choose — never a bot. You see each counselor's background and pick the one that fits before anything is reviewed.",
  },
  {
    q: "How fast will I hear back?",
    a: "Most reviews come back within about two days, and often sooner when your counselor's queue is light. You'll see each counselor's current turn-around before you choose.",
  },
  {
    q: "Do I have to finish my whole application first?",
    a: "No. The Application Check works whether you're finished or still in progress — share whatever is ready, save it, and come back to add more any time.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Your work is stored securely and only visible to you and the counselor reviewing it. We take special care because much of this involves students under 18.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-blue-50/70 via-white to-white" />
          <div className="pointer-events-none absolute -top-24 right-0 -z-10 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />

          <Container className="grid items-center gap-14 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
            <div>
              <span className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-blue-100 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-blue-700 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                Real counselors · not software
              </span>

              <h1
                className="mt-6 animate-fade-up font-serif text-[2.6rem] font-medium leading-[1.05] tracking-tight text-zinc-900 sm:text-6xl"
                style={{ animationDelay: "60ms" }}
              >
                Your application, reviewed by the{" "}
                <span className="text-blue-700">best counselors in the country.</span>
              </h1>

              <p
                className="mt-6 max-w-xl animate-fade-up text-lg leading-relaxed text-zinc-600"
                style={{ animationDelay: "120ms" }}
              >
                Upload your work or type it in, pick a counselor, and get specific, school-by-school
                feedback — built to be genuinely simple for students and parents.
              </p>

              <div
                className="mt-8 flex animate-fade-up flex-wrap items-center gap-3"
                style={{ animationDelay: "180ms" }}
              >
                <Button href="/apply" size="lg">
                  Check my application
                </Button>
                <Button href="/counseling" variant="secondary" size="lg">
                  Explore 1-on-1 counseling
                </Button>
              </div>

              <ul
                className="mt-8 flex animate-fade-up flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-500"
                style={{ animationDelay: "240ms" }}
              >
                {TRUST.map((t) => (
                  <li key={t.label} className="flex items-center gap-2">
                    <TrustIcon name={t.icon} />
                    {t.label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Product preview */}
            <div
              className="relative mx-auto w-full max-w-md animate-fade-up lg:mx-0"
              style={{ animationDelay: "220ms" }}
            >
              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl shadow-blue-950/10">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                    DB
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">Dr. Bolger</p>
                    <p className="text-xs text-zinc-500">Feedback · Personal statement</p>
                  </div>
                  <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Reviewed
                  </span>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="h-2.5 w-full rounded-full bg-zinc-100" />
                  <div className="h-2.5 w-11/12 rounded-full bg-zinc-100" />
                  <div className="h-2.5 w-4/5 rounded-full bg-zinc-100" />
                </div>

                <p className="mt-5 border-l-2 border-blue-200 pl-4 font-serif text-[15px] italic leading-relaxed text-zinc-700">
                  “Open with the moment in paragraph three — it&apos;s your strongest hook for a
                  reach like MIT. Then tie it back to your ‘why engineering.’”
                </p>
              </div>

              <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-xl shadow-blue-950/10 sm:block">
                <p className="text-xs text-zinc-500">Turn-around</p>
                <p className="text-sm font-semibold text-zinc-900">Usually within 1 day</p>
              </div>
            </div>
          </Container>
        </section>

        {/* Services */}
        <section className="py-20 sm:py-24">
          <Container>
            <div className="max-w-2xl">
              <h2 className="font-serif text-3xl font-medium tracking-tight text-zinc-900 sm:text-4xl">
                Choose how you want help
              </h2>
              <p className="mt-3 text-lg text-zinc-600">
                Three ways to get expert eyes on your application.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {SERVICES.map((service) => {
                const featured = service.featured;
                return (
                  <a
                    key={service.key}
                    href={service.href}
                    className={`group relative flex flex-col overflow-hidden rounded-3xl border p-8 transition-all duration-300 hover:-translate-y-1 ${
                      featured
                        ? "border-blue-700 bg-blue-700 text-white shadow-xl shadow-blue-900/20"
                        : "border-zinc-200 bg-white shadow-sm hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-900/5"
                    }`}
                  >
                    {featured && (
                      <span className="absolute right-6 top-6 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide">
                        Flagship
                      </span>
                    )}

                    <span
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${
                        featured ? "bg-white/15 text-white" : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      <ServiceIcon service={service.key} className="h-6 w-6" />
                    </span>

                    <span
                      className={`mt-6 text-xs font-semibold uppercase tracking-wider ${
                        featured ? "text-blue-100" : "text-blue-700"
                      }`}
                    >
                      {service.eyebrow}
                    </span>
                    <h3
                      className={`mt-1.5 font-serif text-2xl font-medium ${
                        featured ? "text-white" : "text-zinc-900"
                      }`}
                    >
                      {service.title}
                    </h3>
                    <p
                      className={`mt-2 text-sm leading-relaxed ${
                        featured ? "text-blue-50" : "text-zinc-600"
                      }`}
                    >
                      {service.description}
                    </p>

                    <ul className="mt-5 space-y-2 text-sm">
                      {service.points.map((point) => (
                        <li key={point} className="flex items-start gap-2">
                          <CheckIcon className={featured ? "text-blue-200" : "text-blue-600"} />
                          <span className={featured ? "text-blue-50" : "text-zinc-600"}>
                            {point}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div
                      className={`mt-8 flex items-center justify-between border-t pt-5 ${
                        featured ? "border-white/15" : "border-zinc-100"
                      }`}
                    >
                      <span
                        className={`text-sm font-semibold ${
                          featured ? "text-white" : "text-zinc-900"
                        }`}
                      >
                        {service.priceLabel}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-sm font-semibold ${
                          featured ? "text-white" : "text-blue-700"
                        }`}
                      >
                        {service.cta}
                        <span
                          aria-hidden
                          className="transition-transform group-hover:translate-x-0.5"
                        >
                          →
                        </span>
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </Container>
        </section>

        {/* How it works */}
        <section className="border-y border-zinc-100 bg-zinc-50 py-20 sm:py-24">
          <Container>
            <h2 className="font-serif text-3xl font-medium tracking-tight text-zinc-900 sm:text-4xl">
              How it works
            </h2>
            <div className="mt-12 grid gap-10 sm:grid-cols-3">
              {STEPS.map((step, i) => (
                <div key={step.t} className="relative">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-blue-200 bg-white font-serif text-lg font-semibold text-blue-700">
                    {i + 1}
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-zinc-900">{step.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">{step.d}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* FAQ */}
        <section className="py-20 sm:py-24">
          <Container className="max-w-3xl">
            <h2 className="font-serif text-3xl font-medium tracking-tight text-zinc-900 sm:text-4xl">
              Questions families ask
            </h2>
            <div className="mt-10 divide-y divide-zinc-200 border-y border-zinc-200">
              {FAQ.map((item) => (
                <details key={item.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
                    <span className="font-medium text-zinc-900">{item.q}</span>
                    <span className="text-zinc-400 transition-transform duration-200 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-600">{item.a}</p>
                </details>
              ))}
            </div>
          </Container>
        </section>

        {/* CTA band */}
        <section className="pb-24">
          <Container>
            <div className="relative overflow-hidden rounded-3xl bg-zinc-900 px-8 py-16 text-center sm:px-16">
              <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />
              <h2 className="font-serif text-3xl font-medium tracking-tight text-white sm:text-4xl">
                Ready when you are.
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-zinc-300">
                Start with a check, or book a free intro call with a counselor. No account needed to
                begin.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button href="/apply" size="lg">
                  Check my application
                </Button>
                <Button
                  href="/counseling"
                  size="lg"
                  className="border border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  Meet the counselors
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

// --- Small inline icons -----------------------------------------------------

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={`mt-0.5 h-4 w-4 shrink-0 ${className}`}>
      <path
        d="M4 10.5l3.5 3.5L16 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrustIcon({ name }: { name: string }) {
  const common = "h-4 w-4 text-blue-600";
  if (name === "shield") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} stroke="currentColor" strokeWidth="1.7">
        <path d="M12 3l7 3v5c0 4.4-3 8-7 10-4-2-7-5.6-7-10V6l7-3z" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "clock") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} stroke="currentColor" strokeWidth="1.7">
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className={common} stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" strokeLinecap="round" />
    </svg>
  );
}
