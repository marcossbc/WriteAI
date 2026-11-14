"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconBrain, IconDownload } from "./Icons";
import { useCredits } from "./CreditsModal";
import { closeNav } from "./navState";

export default function UserMenu({ user }) {
  const router = useRouter();
  const credits = useCredits();
  const [open, setOpen] = useState(false);
  const [deferred, setDeferred] = useState(null);
  const [hint, setHint] = useState(false);
  const box = useRef(null);
  const btn = useRef(null);

  // close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const down = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    const key = (e) => { if (e.key === "Escape") { setOpen(false); btn.current?.focus(); } };
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, [open]);

  // capture the browser's "install app" prompt as early as possible
  useEffect(() => {
    const h = (e) => { e.preventDefault(); setDeferred(e); };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);
  async function install() {
    if (deferred) { deferred.prompt(); await deferred.userChoice; setDeferred(null); setOpen(false); }
    else setHint(true);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/"); router.refresh();
  }

  const close = () => setOpen(false);
  const pro = user.plan === "pro";

  return (
    <div className="usermenu" ref={box}>
      {open && (
        <div className="menu" role="menu" aria-label="Account menu">
          <div className="menu-head">
            <div className="avatar lg">{user.name[0]?.toUpperCase()}</div>
            <div style={{ minWidth: 0 }}>
              <b>{user.name}</b>
              <div className="muted ellipsis" style={{ fontSize: 12 }}>{user.email}</div>
            </div>
          </div>

          <div className="menu-plan">
            <div className="plan-row">
              <b>{pro ? "Pro" : "Free"}</b>
              {!pro && <Link href="/pricing" className="btn primary sm" onClick={close}>Upgrade</Link>}
            </div>
            <button role="menuitem" className="plan-row credits" onClick={() => { close(); closeNav(); credits.open(); }}>
              <span>💎 Credits</span><span className="muted">{user.credits} ›</span>
            </button>
          </div>

          <Link href="/dashboard/memory" role="menuitem" className="menu-item" onClick={close}><span><IconBrain /> Memory Center</span><i>›</i></Link>
          <Link href="/dashboard/documents" role="menuitem" className="menu-item" onClick={close}><span>🗂 My Documents</span><i>›</i></Link>
          <Link href="/dashboard/history" role="menuitem" className="menu-item" onClick={close}><span>🕘 Chat History</span><i>›</i></Link>
          <Link href="/dashboard/settings" role="menuitem" className="menu-item" onClick={close}><span>👤 My Account</span><i>›</i></Link>
          <Link href="/contact" role="menuitem" className="menu-item" onClick={close}><span>✉️ Help center</span><i>›</i></Link>
          <button role="menuitem" className="menu-item" onClick={install}><span><IconDownload /> Download for Desktop</span><i>›</i></button>
          {hint && <p className="menu-hint">Open WriteAI in Chrome or Edge, then use the browser menu → <b>Install WriteAI</b> (or the install icon in the address bar).</p>}
          <hr />
          <button role="menuitem" className="menu-item" onClick={logout}><span>↪ Logout</span></button>
        </div>
      )}

      <button ref={btn} className="me" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <div className="avatar">{user.name[0]?.toUpperCase()}</div>
        <span className="ellipsis" style={{ flex: 1, textAlign: "left", fontWeight: 600 }}>{user.email}</span>
        <span className="muted" aria-hidden>{open ? "⌄" : "›"}</span>
      </button>
    </div>
  );
}
