import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { Container } from "@/components/ui/container";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-50">
      <Container className="py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <BrandMark className="h-8 w-8" />
              <span className="font-serif text-lg font-semibold tracking-tight text-zinc-900">
                Gallatin Strategy Group
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-500">
              College application review and counseling from real people — clear, specific feedback
              tailored to the schools you&apos;re aiming for.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Services</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/apply" className="text-zinc-600 hover:text-zinc-900">
                  Application Check
                </Link>
              </li>
              <li>
                <Link href="/counseling" className="text-zinc-600 hover:text-zinc-900">
                  1-on-1 Counseling
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Account</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/login" className="text-zinc-600 hover:text-zinc-900">
                  Log in
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-zinc-600 hover:text-zinc-900">
                  Create account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-2 border-t border-zinc-200 pt-6 text-xs text-zinc-400 sm:flex-row sm:items-center">
          <p>© {2026} Gallatin Strategy Group. All rights reserved.</p>
          <p>Reviewed by real counselors — never AI.</p>
        </div>
      </Container>
    </footer>
  );
}
