"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/cn";

const TIERS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    cadence: "forever",
    bullets: ["20 messages / day", "claude-sonnet-4-6", "Community support"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9",
    cadence: "/ month",
    bullets: ["500 messages / day", "60 requests / minute", "Priority support"],
    highlight: true,
  },
  {
    id: "team",
    name: "Team",
    price: "$29",
    cadence: "/ month",
    bullets: ["5,000 messages / day", "240 requests / minute", "Shared workspace"],
  },
] as const;

export function Pricing() {
  const { data: session } = useSession();
  const [busy, setBusy] = useState<string | null>(null);

  async function subscribe(tier: "pro" | "team") {
    setBusy(tier);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {TIERS.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex flex-col rounded-2xl border p-6",
            t.highlight
              ? "border-brand-500 bg-slate-900"
              : "border-slate-800 bg-slate-900/50",
          )}
        >
          <h3 className="text-xl font-semibold">{t.name}</h3>
          <p className="mt-2">
            <span className="text-4xl font-bold">{t.price}</span>{" "}
            <span className="text-slate-400">{t.cadence}</span>
          </p>
          <ul className="mt-6 flex-1 space-y-2 text-sm text-slate-300">
            {t.bullets.map((b) => (
              <li key={b}>• {b}</li>
            ))}
          </ul>
          {t.id === "free" ? (
            <a
              href="/auth/signup"
              className="mt-6 rounded-md border border-slate-700 py-2 text-center hover:bg-slate-800"
            >
              Get started
            </a>
          ) : (
            <button
              disabled={!session || busy !== null}
              onClick={() => subscribe(t.id as "pro" | "team")}
              className="mt-6 rounded-md bg-brand-500 py-2 text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {busy === t.id ? "Redirecting…" : session ? "Subscribe" : "Sign in to subscribe"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
