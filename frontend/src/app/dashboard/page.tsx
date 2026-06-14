import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import type { MeResponse, UsageResponse } from "@/types";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  let me: MeResponse | null = null;
  let usage: UsageResponse | null = null;
  if (session?.backendToken) {
    const [meRes, usageRes] = await Promise.all([
      apiFetch("/auth/me", session.backendToken).catch(() => null),
      apiFetch("/usage", session.backendToken).catch(() => null),
    ]);
    if (meRes?.ok) me = (await meRes.json()) as MeResponse;
    if (usageRes?.ok) usage = (await usageRes.json()) as UsageResponse;
  }

  const pct =
    usage && usage.daily_limit > 0
      ? Math.min(100, Math.round((usage.messages_today / usage.daily_limit) * 100))
      : 0;

  return (
    <div>
      <h1 className="text-3xl font-bold">
        Welcome{me?.name ? `, ${me.name}` : ""}
      </h1>
      <p className="mt-2 text-slate-400">Your AI workspace at a glance.</p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="text-sm text-slate-400">Plan</div>
          <div className="mt-2 text-2xl font-semibold capitalize">{me?.tier ?? "free"}</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="text-sm text-slate-400">Messages today</div>
          <div className="mt-2 text-2xl font-semibold">
            {usage ? `${usage.messages_today} / ${usage.daily_limit}` : "—"}
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full bg-brand-500" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="text-sm text-slate-400">Tokens (24h)</div>
          <div className="mt-2 text-2xl font-semibold">
            {usage ? (usage.input_tokens + usage.output_tokens).toLocaleString() : "—"}
          </div>
          {usage && (
            <div className="mt-1 text-xs text-slate-500">
              in {usage.input_tokens.toLocaleString()} · out {usage.output_tokens.toLocaleString()}
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-xl font-semibold">Try the chat</h2>
        <p className="mt-1 text-sm text-slate-400">
          Stream responses from claude-sonnet-4-6.
        </p>
        <a
          href="/dashboard/chat"
          className="mt-4 inline-block rounded-md bg-brand-500 px-4 py-2 text-white hover:bg-brand-600"
        >
          Open chat
        </a>
      </div>
    </div>
  );
}
