import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Avatar } from "@/components/avatar";

export const metadata = { title: "1-on-1 Counseling" };

interface Counselor {
  id: string;
  name: string;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
}

const STEPS = [
  { t: "Browse profiles", d: "Read about each counselor's background and focus areas below." },
  { t: "Free intro call", d: "Book a free 15-minute call to see if they're the right fit for you." },
  { t: "Get a plan & pricing", d: "Your counselor shares a plan and pricing tailored to your goals on the call." },
];

export default async function CounselingPage() {
  let counselors: Counselor[] = [];
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("reviewers")
      .select("id, name, headline, bio, avatar_url")
      .eq("accepting", true)
      .order("display_order");
    counselors = (data ?? []) as Counselor[];
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-blue-50 via-white to-white">
          <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20">
            <Link href="/" className="text-sm font-medium text-blue-700 hover:underline">
              ← Home
            </Link>
            <h1 className="mt-4 max-w-3xl font-serif text-4xl font-medium tracking-tight text-zinc-900 sm:text-5xl">
              1-on-1 counseling with the{" "}
              <span className="text-blue-700">best counselors in the country.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-600">
              Every counseling relationship starts with a free intro call — no commitment. Find
              someone who fits, then plan the rest together.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto w-full max-w-6xl px-6 py-14">
          <div className="grid gap-8 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.t}>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-sm font-semibold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-zinc-900">{s.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Counselor gallery */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-20">
          <h2 className="font-serif text-3xl font-medium tracking-tight text-zinc-900">
            Meet the counselors
          </h2>

          {counselors.length === 0 ? (
            <p className="mt-8 rounded-2xl border border-zinc-200 bg-white p-8 text-sm text-zinc-500">
              Counselor profiles will appear here shortly.
            </p>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {counselors.map((c) => (
                <article
                  key={c.id}
                  className="flex flex-col rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <Avatar name={c.name} url={c.avatar_url} size={64} />
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-zinc-900">{c.name}</h3>
                      {c.headline && <p className="text-sm text-blue-700">{c.headline}</p>}
                    </div>
                  </div>
                  {c.bio && <p className="mt-4 flex-1 text-sm leading-relaxed text-zinc-600">{c.bio}</p>}
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Link
                      href={`/counseling/${c.id}`}
                      className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                    >
                      Book a free intro call
                    </Link>
                    <Link
                      href={`/counseling/${c.id}`}
                      className="text-sm font-semibold text-blue-700 hover:underline"
                    >
                      View profile
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
