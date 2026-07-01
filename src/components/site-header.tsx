import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { BrandMark } from "@/components/brand-mark";
import { Container } from "@/components/ui/container";

export async function SiteHeader() {
  const profile = await getCurrentProfile();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <BrandMark className="h-8 w-8" />
          <span className="font-serif text-lg font-semibold tracking-tight text-zinc-900">
            Gallatin Strategy Group
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          {!profile && (
            <>
              <Link
                href="/counseling"
                className="hidden font-medium text-zinc-600 transition-colors hover:text-zinc-900 sm:inline"
              >
                Counselors
              </Link>
              <Link
                href="/login"
                className="font-medium text-zinc-600 transition-colors hover:text-zinc-900"
              >
                Log in
              </Link>
            </>
          )}

          {profile?.role === "student" && (
            <>
              <Link
                href="/submissions"
                className="font-medium text-zinc-600 transition-colors hover:text-zinc-900"
              >
                Your submissions
              </Link>
              <LogoutButton />
            </>
          )}

          {profile?.role === "reviewer" && (
            <>
              <Link
                href="/reviewer"
                className="font-medium text-zinc-600 transition-colors hover:text-zinc-900"
              >
                Review queue
              </Link>
              <Link
                href="/reviewer/intro-calls"
                className="hidden font-medium text-zinc-600 transition-colors hover:text-zinc-900 sm:inline"
              >
                Intro calls
              </Link>
              <LogoutButton />
            </>
          )}
        </nav>
      </Container>
    </header>
  );
}
