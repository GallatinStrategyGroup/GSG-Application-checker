import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";

export const metadata = { title: "Application Check" };

const OPTIONS = [
  {
    href: "/start/finished",
    title: "It's finished",
    description:
      "Your application is complete and you want a thorough review before you submit it to schools.",
  },
  {
    href: "/start/partial",
    title: "Still working on it",
    description:
      "You have some of it done. Share whatever is ready, save your progress, and come back to add more.",
  },
];

export default function ApplyPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Container size="lg" className="py-14 sm:py-20">
          <Link
            href="/"
            className="text-sm font-medium text-blue-700 transition-colors hover:text-blue-800"
          >
            ← Home
          </Link>
          <h1 className="mt-4 font-serif text-4xl font-medium tracking-tight text-zinc-900">
            Application Check
          </h1>
          <p className="mt-3 text-lg text-zinc-600">
            Is your application finished, or still in progress?
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {OPTIONS.map((o) => (
              <Link
                key={o.href}
                href={o.href}
                className="group flex flex-col rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-zinc-900/5"
              >
                <h2 className="font-serif text-2xl font-medium text-zinc-900">{o.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600">{o.description}</p>
                <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-blue-700">
                  Start
                  <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
