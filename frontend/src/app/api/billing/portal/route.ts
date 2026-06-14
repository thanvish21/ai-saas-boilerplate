import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.backendToken) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const res = await apiFetch("/billing/portal", session.backendToken, { method: "POST" });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
