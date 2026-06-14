import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import type { MeResponse } from "@/types";
import { SettingsActions } from "@/components/SettingsActions";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  let me: MeResponse | null = null;
  if (session?.backendToken) {
    const res = await apiFetch("/auth/me", session.backendToken).catch(() => null);
    if (res?.ok) me = (await res.json()) as MeResponse;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="mt-8 space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <Field label="Email" value={me?.email ?? session?.user?.email ?? ""} />
        <Field label="Name"  value={me?.name ?? session?.user?.name ?? ""} />
        <Field label="Plan"  value={(me?.tier ?? "free").toUpperCase()} />
      </div>

      <SettingsActions />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-sm">{value || "—"}</div>
    </div>
  );
}
