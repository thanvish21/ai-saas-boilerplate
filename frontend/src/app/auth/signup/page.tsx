"use client";

import { signIn } from "next-auth/react";

export default function SignupPage() {
  return (
    <div className="mx-auto mt-24 max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <p className="mt-1 text-sm text-slate-400">
        OAuth only — no passwords to forget. Free tier is enabled by default.
      </p>

      <div className="mt-6 space-y-3">
        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full rounded-md bg-white py-2.5 text-slate-900 hover:bg-slate-200"
        >
          Sign up with Google
        </button>
        <button
          onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
          className="w-full rounded-md bg-slate-800 py-2.5 hover:bg-slate-700"
        >
          Sign up with GitHub
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <a href="/auth/login" className="text-brand-500 hover:underline">
          Sign in
        </a>
      </p>
    </div>
  );
}
