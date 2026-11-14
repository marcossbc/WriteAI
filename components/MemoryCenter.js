"use client";
import { useState } from "react";
import { IconTrash } from "./Icons";

export default function MemoryCenter({ initial, max }) {
  const [items, setItems] = useState(initial);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function add(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true); setErr("");
    const res = await fetch("/api/memory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setErr(data.error);
    setItems((x) => [{ id: data.memory._id, text: data.memory.text }, ...x]); setText("");
  }
  async function del(id) {
    const res = await fetch(`/api/memory/${id}`, { method: "DELETE" });
    if (res.ok) setItems((x) => x.filter((m) => m.id !== id));
  }

  return (
    <>
      <form onSubmit={add} className="mem-form">
        <input value={text} onChange={(e) => setText(e.target.value)} maxLength={300} placeholder="e.g. I write for a business audience in Garowe. Prefer short sentences." aria-label="New memory" />
        <button className="btn primary" disabled={busy || items.length >= max}>Remember</button>
      </form>
      {err && <div className="error" role="alert" style={{ marginTop: 10 }}>{err}</div>}
      <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>{items.length} / {max} memories</p>
      <div className="list">
        {items.map((m) => (
          <div className="row-item" key={m.id}><span>{m.text}</span><button className="icon-btn" aria-label="Delete memory" onClick={() => del(m.id)}><IconTrash /></button></div>
        ))}
        {!items.length && <div className="empty"><p>Nothing remembered yet. Add facts about you and the AI will use them in every project.</p></div>}
      </div>
    </>
  );
}
