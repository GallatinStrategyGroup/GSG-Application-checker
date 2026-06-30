import { SiteHeader } from "@/components/site-header";
import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-sm px-6 py-16">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Create an account</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Save your work and come back any time to read your feedback.
          </p>
          <div className="mt-8">
            <AuthForm mode="signup" />
          </div>
        </div>
      </main>
    </>
  );
}
