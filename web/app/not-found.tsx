import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-5 py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[color:var(--gold-deep)]">Not found</p>
      <h1 className="mt-5 text-5xl font-bold tracking-[-0.05em] text-[color:var(--ink-strong)]">This page is not available.</h1>
      <p className="mt-5 max-w-xl text-sm leading-7 text-[color:var(--ink-soft)]">
        The route may have moved during the website rebuild. You can return home or browse the current journeys instead.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/" className="rounded-full bg-[color:var(--brand-maroon)] px-6 py-3 text-sm font-semibold text-white">
          Go home
        </Link>
        <Link href="/journeys" className="rounded-full border border-[color:var(--border-soft)] px-6 py-3 text-sm font-semibold text-[color:var(--brand-maroon)]">
          Browse journeys
        </Link>
      </div>
    </main>
  );
}
