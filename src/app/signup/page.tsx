import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Create an account" };

export default function SignupPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-zinc-50/60">
        <div className="mx-auto w-full max-w-md px-6 py-16 sm:py-24">
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <h1 className="font-serif text-3xl font-medium tracking-tight text-zinc-900">
              Create an account
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              Save your work and come back any time to read your feedback.
            </p>
            <div className="mt-8">
              <AuthForm mode="signup" />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
