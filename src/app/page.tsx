import Link from "next/link";
import { SERVICES } from "@/lib/services";
import { ServiceIcon } from "@/components/icons";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-blue-50/60 via-white to-white" />

          <Container className="py-20 sm:py-28">
            {/* Hero */}
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="animate-fade-up font-serif text-[2.75rem] font-medium leading-[1.05] tracking-tight text-zinc-900 sm:text-6xl">
                Your application, reviewed by the{" "}
                <span className="text-blue-700">best counselors in the country.</span>
              </h1>
              <p
                className="mx-auto mt-6 max-w-xl animate-fade-up text-lg leading-relaxed text-zinc-600"
                style={{ animationDelay: "80ms" }}
              >
                Real, written feedback on your college application — or work one-on-one with a
                counselor. Pick where to start.
              </p>
              <p
                className="mt-5 animate-fade-up text-sm text-zinc-400"
                style={{ animationDelay: "140ms" }}
              >
                Real counselors, never AI · Feedback in about two days
              </p>
              <p className="mt-4 animate-fade-up text-sm" style={{ animationDelay: "180ms" }}>
                <Link
                  href="/ec-estimate"
                  className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-800"
                >
                  Not sure where you stand? Try the free EC tier estimate
                  <span aria-hidden>→</span>
                </Link>
              </p>
            </div>

            {/* Two big cards */}
            <div className="mx-auto mt-16 grid max-w-4xl gap-6 md:grid-cols-2">
              {SERVICES.map((service, i) => {
                const featured = service.featured;
                return (
                  <Link
                    key={service.key}
                    href={service.href}
                    style={{ animationDelay: `${180 + i * 90}ms` }}
                    className={`group flex animate-fade-up flex-col rounded-[1.75rem] border p-10 transition-all duration-300 hover:-translate-y-1.5 ${
                      featured
                        ? "border-zinc-900 bg-zinc-900 text-white shadow-xl shadow-zinc-900/20"
                        : "border-zinc-200 bg-white shadow-sm hover:shadow-2xl hover:shadow-zinc-900/5"
                    }`}
                  >
                    <span
                      className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${
                        featured ? "bg-white/10 text-white" : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      <ServiceIcon service={service.key} className="h-7 w-7" />
                    </span>

                    <h2
                      className={`mt-8 font-serif text-3xl font-medium tracking-tight ${
                        featured ? "text-white" : "text-zinc-900"
                      }`}
                    >
                      {service.title}
                    </h2>
                    <p
                      className={`mt-3 flex-1 text-[15px] leading-relaxed ${
                        featured ? "text-zinc-300" : "text-zinc-600"
                      }`}
                    >
                      {service.description}
                    </p>

                    <div
                      className={`mt-10 flex items-center justify-between border-t pt-6 ${
                        featured ? "border-white/15" : "border-zinc-100"
                      }`}
                    >
                      <span
                        className={`text-sm font-semibold ${featured ? "text-white" : "text-zinc-900"}`}
                      >
                        {service.priceLabel}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 text-[15px] font-semibold ${
                          featured ? "text-white" : "text-blue-700"
                        }`}
                      >
                        {service.cta}
                        <span aria-hidden className="transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
