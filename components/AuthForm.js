"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

export default function AuthForm({ mode }) {
  const signup = mode === "signup";
  const router = useRouter();
  const next = useSearchParams().get("next") || "/dashboard";
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr("");
    const res = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const data = await res.json();
    if (!res.ok) { setErr(data.error); setBusy(false); return; }
    router.push(next); router.refresh();
  }

  return (
    <div className="auth">
      <aside className="auth-side">
        <Link href="/" className="logo"><i>✎</i> WRITEAI</Link>
        <div>
          <h2>Your documents, in any language, in seconds.</h2>
          <ul style={{ marginTop: 24 }}>
            <li>✓ 80 free credits when you sign up</li>
            <li>✓ PDF, Word and PowerPoint support</li>
            <li>✓ 12 output languages, including Somali and Arabic</li>
            <li>✓ Export to PDF, Word, PowerPoint, Excel or Markdown</li>
          </ul>
        </div>
        <small style={{ opacity: .7 }}>No credit card required.</small>
      </aside>
      <section className="auth-form">
        <div className="tt"><ThemeToggle /></div>
        <form onSubmit={submit}>
          <Link href="/" className="logo auth-logo"><i>✎</i> WRITEAI</Link>
          <h1>{signup ? "Create your account" : "Welcome back"}</h1>
          <p className="muted">{signup ? "Start with 80 free credits." : "Sign in to continue to your dashboard."}</p>
          {err && <div className="error" role="alert">{err}</div>}
          {signup && (
            <label className="field">Full name<input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" /></label>
          )}
          <label className="field">Email<input type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" /></label>
          <label className="field">Password<input type="password" required minLength={8} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete={signup ? "new-password" : "current-password"} /></label>
          <button className="btn primary lg" disabled={busy}>{busy ? "Please wait…" : signup ? "Create account" : "Sign in"}</button>
          <p className="muted" style={{ fontSize: 14 }}>
            {signup ? <>Already have an account? <Link href="/login" style={{ color: "var(--brand)" }}>Sign in</Link></> : <>New here? <Link href="/signup" style={{ color: "var(--brand)" }}>Create an account</Link></>}
          </p>
        </form>
      </section>
    </div>
  );
}
