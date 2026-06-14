"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto mt-24 max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
      <h1 className="text-2xl font-semibold">Reset password</h1>
      <p className="mt-1 text-sm text-slate-400">
        We&apos;ll email you a reset link if an account exists.
      </p>

      {sent ? (
        <p className="mt-6 rounded-md bg-emerald-900/40 p-4 text-sm text-emerald-200">
          If that email is registered, a reset link is on the way.
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="mt-6 space-y-3"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            className="w-full rounded-md bg-brand-500 py-2.5 text-white hover:bg-brand-600"
          >
            Send reset link
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm">
        <a href="/auth/login" className="text-slate-400 hover:underline">
          Back to sign in
        </a>
      </p>
    </div>
  );
}
