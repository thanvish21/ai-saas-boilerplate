"use client";

import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

export function DashboardActions() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string };
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  if (!session) return null;

  return (
    <div className="mb-6 flex items-center justify-end gap-3 text-sm">
      <button
        onClick={openPortal}
        disabled={loading}
        className="rounded-md border border-slate-700 px-3 py-1.5 hover:bg-slate-800 disabled:opacity-50"
      >
        {loading ? "Opening…" : "Billing portal"}
      </button>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-md border border-slate-700 px-3 py-1.5 hover:bg-slate-800"
      >
        Sign out
      </button>
    </div>
  );
}
