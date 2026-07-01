import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center bg-zinc-50/60 px-6 py-24">
        <div className="text-center">
          <p className="font-serif text-7xl font-medium tracking-tight text-blue-700">404</p>
          <h1 className="mt-4 font-serif text-3xl font-medium tracking-tight text-zinc-900">
            This page took a gap year.
          </h1>
          <p className="mx-auto mt-3 max-w-md text-zinc-600">
            The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back
            on track.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/">Back to home</Button>
            <Button href="/counseling" variant="secondary">
              Browse counselors
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
