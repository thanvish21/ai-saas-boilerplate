import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import type { MeResponse, UsageResponse } from "@/types";
import { DashboardActions } from "@/components/DashboardActions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login?callbackUrl=/dashboard");

  let me: MeResponse | null = null;
  let usage: UsageResponse | null = null;
  if (session.backendToken) {
    const [meRes, usageRes] = await Promise.all([
      apiFetch("/auth/me", session.backendToken).catch(() => null),
      apiFetch("/usage", session.backendToken).catch(() => null),
    ]);
    if (meRes?.ok) me = (await meRes.json()) as MeResponse;
    if (usageRes?.ok) usage = (await usageRes.json()) as UsageResponse;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-slate-800 p-6">
        <Link href="/" className="text-lg font-semibold">
          AI<span className="text-brand-500">SaaS</span>
        </Link>

        <nav className="mt-8 space-y-1 text-sm">
          <Link href="/dashboard" className="block rounded-md px-3 py-2 hover:bg-slate-800">
            Overview
          </Link>
          <Link href="/dashboard/chat" className="block rounded-md px-3 py-2 hover:bg-slate-800">
            Chat
          </Link>
          <Link href="/dashboard/settings" className="block rounded-md px-3 py-2 hover:bg-slate-800">
            Settings
          </Link>
        </nav>

        <div className="mt-10 rounded-lg border border-slate-800 p-3 text-xs text-slate-400">
          <div className="font-medium text-slate-200">{me?.email ?? session.user?.email}</div>
          <div className="mt-1 capitalize">Tier: {me?.tier ?? "free"}</div>
          {usage && (
            <div className="mt-1">
              {usage.messages_today} / {usage.daily_limit} today
            </div>
          )}
        </div>
      </aside>
      <main className="flex-1 p-8">
        <DashboardActions />
        {children}
      </main>
    </div>
  );
}
