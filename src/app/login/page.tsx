import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-zinc-50/60">
        <div className="mx-auto w-full max-w-md px-6 py-16 sm:py-24">
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <h1 className="font-serif text-3xl font-medium tracking-tight text-zinc-900">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              Log in to see your submissions and any feedback.
            </p>
            <div className="mt-8">
              <AuthForm mode="login" />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
