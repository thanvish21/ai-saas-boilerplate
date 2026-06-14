"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginInner() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
  return (
    <div className="mx-auto mt-24 max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="mt-1 text-sm text-slate-400">Continue with your preferred provider.</p>

      <div className="mt-6 space-y-3">
        <button
          onClick={() => signIn("google", { callbackUrl })}
          className="w-full rounded-md bg-white py-2.5 text-slate-900 hover:bg-slate-200"
        >
          Continue with Google
        </button>
        <button
          onClick={() => signIn("github", { callbackUrl })}
          className="w-full rounded-md bg-slate-800 py-2.5 hover:bg-slate-700"
        >
          Continue with GitHub
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-slate-400">
        New here?{" "}
        <a href="/auth/signup" className="text-brand-500 hover:underline">
          Create an account
        </a>
      </p>
      <p className="mt-2 text-center text-sm">
        <a href="/auth/forgot-password" className="text-slate-400 hover:underline">
          Forgot password?
        </a>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
