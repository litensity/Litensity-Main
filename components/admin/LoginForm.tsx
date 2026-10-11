"use client";

import { useState, type FormEvent } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export function LoginForm({ next }: { next: string }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    const supabase = createBrowserSupabase();
    const { data: auth, error: signInError } = await supabase.auth.signInWithPassword({
      email: String(data.get("email") ?? "").trim(),
      password: String(data.get("password") ?? ""),
    });
    if (signInError || !auth.user) {
      setBusy(false);
      setError("Incorrect email or password.");
      return;
    }
    const { data: profile } = await supabase.from("admin_profiles").select("role").eq("user_id", auth.user.id).maybeSingle();
    if (!profile) {
      await supabase.auth.signOut();
      setBusy(false);
      setError("This account does not have admin access.");
      return;
    }
    // Full navigation so the server sees the fresh session cookie.
    window.location.assign(next);
  }

  return (
    <form onSubmit={onSubmit} className="a-form">
      {error && (
        <p className="a-alert a-alert-bad" role="alert">
          {error}
        </p>
      )}
      <label className="a-field">
        <span className="a-label">Email</span>
        <input className="a-input" type="email" name="email" autoComplete="username" required />
      </label>
      <label className="a-field">
        <span className="a-label">Password</span>
        <input className="a-input" type="password" name="password" autoComplete="current-password" required />
      </label>
      <button type="submit" className="a-btn a-btn-primary" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
