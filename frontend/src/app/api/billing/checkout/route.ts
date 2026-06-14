import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.backendToken) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const body = (await req.json()) as { tier: "pro" | "team" };
  const res = await apiFetch("/billing/checkout", session.backendToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
