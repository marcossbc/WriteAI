"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PLANS, PACKS, PRO_FEATURES } from "@/lib/plans";

export default function PricingCards({ loggedIn, showPacks = true }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");

  async function buy(id) {
    if (!loggedIn) return router.push("/signup");
    setBusy(id); setMsg("");
    const res = await fetch("/api/credits/purchase", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const data = await res.json();
    if (!res.ok) { setBusy(""); return setMsg(data.error); }
    if (data.url) { window.location.href = data.url; return; } // Stripe Checkout
    setBusy("");
    router.push("/dashboard/credits?added=1"); router.refresh();
  }

  return (
    <>
      {msg && <div className="error" style={{ marginTop: 20 }}>{msg}</div>}
      <div className="price-grid">
        {PLANS.map((p) => (
          <div key={p.id} className={"plan" + (p.highlight ? " hl" : "")}>
            <div className="head"><span>{p.name}</span>{p.badge && <span className="badge">{p.badge}</span>}</div>
            <div className="amt">${p.price.toFixed(2)}<small>{p.per}{p.sub ? ` ${p.sub}` : ""}</small></div>
            <p className="muted" style={{ fontSize: 13 }}>{p.note}</p>
            <p><b>{p.credits.toLocaleString()}</b> credits</p>
            <ul>{PRO_FEATURES.map((f) => <li key={f}>{f}</li>)}</ul>
            <button className={"btn lg " + (p.highlight ? "primary" : "")} disabled={busy === p.id} onClick={() => buy(p.id)}>
              {busy === p.id ? "Processing…" : p.id === "trial" ? "Get the starter pack" : `Get ${p.credits.toLocaleString()} credits`}
            </button>
          </div>
        ))}
      </div>
      {showPacks && (
        <>
          <h2 style={{ marginTop: 48, fontSize: 24, fontWeight: 600 }}>Or top up with a credit pack</h2>
          <div className="packs">
            {PACKS.map((p) => (
              <div key={p.id} className="plan">
                <div className="head"><span>{p.name}</span></div>
                <div className="amt">${p.price}</div>
                <p><b>{p.credits.toLocaleString()}</b> credits</p>
                <button className="btn" disabled={busy === p.id} onClick={() => buy(p.id)}>{busy === p.id ? "Processing…" : "Buy credits"}</button>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
