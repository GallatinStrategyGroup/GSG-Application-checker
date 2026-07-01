import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Avatar } from "@/components/avatar";
import { IntroCallForm } from "@/components/intro-call-form";

interface Counselor {
  id: string;
  name: string;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
}

export default async function CounselorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isSupabaseConfigured) notFound();

  const supabase = await createClient();
  const { data: counselor } = await supabase
    .from("reviewers")
    .select("id, name, headline, bio, avatar_url")
    .eq("id", id)
    .maybeSingle<Counselor>();

  if (!counselor) notFound();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-16">
          <Link href="/counseling" className="text-sm font-medium text-blue-700 hover:underline">
            ← All counselors
          </Link>

          <div className="mt-6 flex items-center gap-5">
            <Avatar name={counselor.name} url={counselor.avatar_url} size={72} />
            <div>
              <h1 className="font-serif text-4xl font-medium tracking-tight text-zinc-900">
                {counselor.name}
              </h1>
              {counselor.headline && <p className="mt-1.5 text-blue-700">{counselor.headline}</p>}
            </div>
          </div>

          {counselor.bio && (
            <p className="mt-6 text-zinc-700 leading-relaxed">{counselor.bio}</p>
          )}

          <div className="mt-10 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="font-serif text-2xl font-medium text-zinc-900">Book a free intro call</h2>
            <p className="mt-1 text-sm text-zinc-500">
              A no-commitment 15-minute call. {counselor.name.split(" ")[0]} will share a plan and
              pricing on the call.
            </p>
            <div className="mt-6">
              <IntroCallForm reviewerId={counselor.id} reviewerName={counselor.name} />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
