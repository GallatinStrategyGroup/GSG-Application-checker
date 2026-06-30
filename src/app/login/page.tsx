import { SiteHeader } from "@/components/site-header";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-sm px-6 py-16">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Welcome back</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Log in to see your submissions and any feedback.
          </p>
          <div className="mt-8">
            <AuthForm mode="login" />
          </div>
        </div>
      </main>
    </>
  );
}
