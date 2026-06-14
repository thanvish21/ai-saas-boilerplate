import Link from "next/link";
import { Pricing } from "@/components/Pricing";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          AI<span className="text-brand-500">SaaS</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-slate-300">
          <Link href="#features" className="hover:text-white">Features</Link>
          <Link href="#pricing" className="hover:text-white">Pricing</Link>
          <Link href="/auth/login" className="hover:text-white">Sign in</Link>
          <Link
            href="/auth/signup"
            className="rounded-md bg-brand-500 px-3 py-1.5 text-white hover:bg-brand-600"
          >
            Get started
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-24 pt-16 text-center">
        <h1 className="mx-auto max-w-3xl text-5xl font-bold tracking-tight">
          Ship an AI product this weekend.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
          Auth, billing, rate limiting, streaming chat with Claude — already wired together. Fork,
          rebrand, and focus on the part that&apos;s yours.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/auth/signup"
            className="rounded-md bg-brand-500 px-5 py-2.5 font-medium text-white hover:bg-brand-600"
          >
            Start free
          </Link>
          <Link
            href="#pricing"
            className="rounded-md border border-slate-700 px-5 py-2.5 font-medium text-slate-200 hover:bg-slate-800"
          >
            View pricing
          </Link>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ["NextAuth + JWT", "Google & GitHub OAuth on the frontend, JWT to the backend."],
            ["Stripe subscriptions", "Three tiers, Checkout, customer portal, webhook lifecycle."],
            ["Streaming Claude chat", "SSE-streamed responses from claude-sonnet-4-6."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-slate-400">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="mb-10 text-center text-3xl font-bold">Pricing</h2>
        <Pricing />
      </section>

      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
        Built with Next.js, FastAPI, and Claude.
      </footer>
    </main>
  );
}
