"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconGem, IconClose } from "./Icons";

const Ctx = createContext({ open() {} });
export const useCredits = () => useContext(Ctx);

export function CreditsProvider({ children }) {
  const [shown, setShown] = useState(false);
  const open = useCallback(() => setShown(true), []);
  return <Ctx.Provider value={{ open }}>{children}{shown && <CreditsDialog onClose={() => setShown(false)} />}</Ctx.Provider>;
}

export function CreditsButton({ credits }) {
  const { open } = useCredits();
  return <button className="credit-chip" onClick={open} aria-haspopup="dialog" title="My credits"><IconGem style={{ color: "var(--brand)" }} /> {credits}</button>;
}

const pad = (n) => String(n).padStart(2, "0");
const fmt = (iso) => { const d = new Date(iso); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };

function CreditsDialog({ onClose }) {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const closeRef = useRef(null);

  const load = useCallback(() => fetch("/api/credits/history").then((r) => r.json()).then(setData).catch(() => setMsg("Could not load your credits.")), []);
  useEffect(() => { load(); closeRef.current?.focus(); }, [load]);
  useEffect(() => {
    const key = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [onClose]);

  async function checkin() {
    setBusy(true); setMsg("");
    const res = await fetch("/api/credits/checkin", { method: "POST" });
    const d = await res.json();
    setBusy(false);
    if (!res.ok) return setMsg(d.error);
    await load(); router.refresh(); // refresh the balance chip in the top bar
  }

  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="credits-title">
        <button ref={closeRef} className="icon-btn modal-x" onClick={onClose} aria-label="Close"><IconClose /></button>
        <h2 id="credits-title">My credits</h2>

        <div className="credit-card">
          <span className="muted">Current credits</span>
          <div className="credit-big"><span className="gem-disc"><IconGem /></span>{data ? <b>{data.credits}</b> : <span className="sk" style={{ display: "block", width: 70, height: 38 }} />}</div>
          <p className="muted">Credits made easy: daily check-ins and first-time use!</p>
          <div className="credit-actions">
            {data?.dailyAmount > 0 && (
              <button className="btn primary sm" onClick={checkin} disabled={busy || !data.canCheckin}>
                {data.canCheckin ? `Daily check-in +${data.dailyAmount}` : "Checked in today ✓"}
              </button>
            )}
            <Link href="/dashboard/credits" className="btn sm" onClick={onClose}>Buy credits</Link>
          </div>
          {msg && <div className="error" role="alert" style={{ marginTop: 10 }}>{msg}</div>}
        </div>

        <h3>Credits history</h3>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Date</th><th>Credits change</th><th>Description</th></tr></thead>
            <tbody>
              {data?.history.map((h) => (
                <tr key={h.id}><td>{fmt(h.at)}</td><td className={h.change < 0 ? "neg" : "pos"}>{h.change > 0 ? `+${h.change}` : h.change}</td><td>{h.label}</td></tr>
              ))}
              {data && !data.history.length && <tr><td colSpan={3} className="muted">No activity yet.</td></tr>}
              {!data && [0, 1, 2].map((n) => <tr key={n} aria-hidden><td><span className="sk" style={{ display: "block", width: 110, height: 12 }} /></td><td><span className="sk" style={{ display: "block", width: 40, height: 12 }} /></td><td><span className="sk" style={{ display: "block", width: "70%", height: 12 }} /></td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
