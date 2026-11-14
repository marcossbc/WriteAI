"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconTrash, IconChat, IconFile, IconSlides, IconSheet, IconImage, IconWriter } from "./Icons";

export const KIND_ICON = { slides: IconSlides, sheets: IconSheet, image: IconImage, writer: IconWriter, docs: IconFile, chat: IconChat };

export default function HistoryList({ chats }) {
  const router = useRouter();
  const [items, setItems] = useState(chats);
  const [q, setQ] = useState("");
  const shown = items.filter((c) => c.title.toLowerCase().includes(q.toLowerCase()));

  async function del(id) {
    if (!confirm("Delete this conversation? Documents it created are kept in My Documents.")) return;
    const res = await fetch(`/api/chats/${id}`, { method: "DELETE" });
    if (res.ok) { setItems((x) => x.filter((c) => c.id !== id)); router.refresh(); }
  }

  return (
    <>
      <input className="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your chats…" aria-label="Search chats" />
      <div className="list">
        {shown.map((c, i) => {
          const Icon = KIND_ICON[c.kind] || IconChat;
          return (
            <div key={c.id} className="row-item hist" style={{ animation: `lineIn .4s ${Math.min(i, 10) * 40}ms both` }}>
              <Link href={`/dashboard/chat/${c.id}`} className="hist-main">
                <span className="hist-ic"><Icon /></span>
                <span style={{ minWidth: 0 }}><b className="ellipsis" style={{ display: "block" }}>{c.title}</b><span className="muted" style={{ fontSize: 13 }}>{c.count} messages · {new Date(c.at).toLocaleString()}</span></span>
              </Link>
              <button className="icon-btn" aria-label={`Delete ${c.title}`} onClick={() => del(c.id)}><IconTrash /></button>
            </div>
          );
        })}
        {!shown.length && <p className="muted">No chats match “{q}”.</p>}
      </div>
    </>
  );
}
