"use client";

import { useState } from "react";

export function SettingsActions() {
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

  return (
    <div className="mt-6 flex gap-3">
      <button
        onClick={openPortal}
        disabled={loading}
        className="rounded-md bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 disabled:opacity-50"
      >
        {loading ? "Opening…" : "Manage subscription"}
      </button>
    </div>
  );
}
