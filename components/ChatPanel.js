"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Markdown from "./Markdown";
import DocActions from "./DocActions";

export default function ChatPanel({ documentId, chatId: initialId, initial = [], full }) {
  const router = useRouter();
  const [chatId, setChatId] = useState(initialId);
  const [msgs, setMsgs] = useState(initial);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const end = useRef(null);
  // scroll to the newest message, but not on first load (so a saved chat opens at the top)
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    end.current?.scrollIntoView({ block: "end" });
  }, [msgs, busy]);

  async function send(e) {
    e.preventDefault();
    if (!text.trim() || busy) return;
    const message = text; setText(""); setErr(""); setBusy(true);
    setMsgs((m) => [...m, { role: "user", content: message }]);
    const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chatId, documentId, message }) });
    const data = await res.json();
    setBusy(false);
    if (res.status === 402) return router.push("/dashboard/credits?need=1");
    if (!res.ok) return setErr(data.error);
    setChatId(data.chatId);
    setMsgs((m) => [...m, { role: "assistant", content: data.reply }]);
    router.refresh(); // updates credits + Recent in the sidebar
  }

  return (
    <div className={"chat" + (full ? " chat-full" : "")}>
      <div className="msgs">
        {!msgs.length && <p className="muted" style={{ fontSize: 14 }}>Ask about this result: “Make it shorter”, “Explain section 2”, “Rewrite in Somali”. Each message costs 2 credits.</p>}
        {msgs.map((m, i) => (
          <div key={i} className={"bubble " + m.role + (m.doc ? " art" : "")}>
            {m.role === "user" ? m.content : m.doc?.kind === "image" ? (
              <img className="gen-img" src={`/api/assets/${m.doc.asset}`} alt={m.content} />
            ) : <Markdown>{m.content}</Markdown>}
            {m.doc && <div style={{ marginTop: 12 }}><DocActions id={m.doc.id} kind={m.doc.kind} openLink /></div>}
          </div>
        ))}
        {busy && <div className="bubble assistant typing" role="status" aria-live="polite"><span className="sr-only">Thinking…</span><span className="sk" style={{ width: 220, height: 12 }} /><span className="sk" style={{ width: 160, height: 12 }} /><span className="sk" style={{ width: 190, height: 12 }} /></div>}
        {err && <div className="error">{err}</div>}
        <div ref={end} />
      </div>
      <form onSubmit={send}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask a follow-up…" aria-label="Message" maxLength={4000} />
        <button className="btn primary sm" disabled={busy}>Send</button>
      </form>
    </div>
  );
}
