import Link from "next/link";
import { getCurrentUser, isSignedIn } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const signedIn = isSignedIn(user);

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 font-semibold text-zinc-900">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-700 text-sm font-bold text-white">
            G
          </span>
          GSG Application Checker
        </Link>

        <nav className="flex items-center gap-5">
          {signedIn ? (
            <>
              <Link
                href="/submissions"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
              >
                Your submissions
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
