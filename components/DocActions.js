"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

const BUTTONS = {
  document: [["pdf", "PDF"], ["docx", "Word"], ["md", "Markdown"]],
  writer: [["pdf", "PDF"], ["docx", "Word"], ["md", "Markdown"]],
  slides: [["pptx", "PowerPoint"], ["pdf", "PDF"], ["md", "Markdown"]],
  sheet: [["xlsx", "Excel"], ["md", "Markdown"]],
  image: [["png", "Download PNG"]],
};

export default function DocActions({ id, kind = "document", deletable = false, openLink = false }) {
  const router = useRouter();
  async function del() {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    router.push("/dashboard/documents"); router.refresh();
  }
  return (
    <div className="exports">
      <span className="muted" style={{ fontSize: 13 }}>Export:</span>
      {(BUTTONS[kind] || BUTTONS.document).map(([f, l]) => <a key={f} className="btn sm" href={`/api/export/${id}?format=${f}`}>{l}</a>)}
      {openLink && <Link className="btn sm" href={`/dashboard/documents/${id}`}>Open</Link>}
      {deletable && <button className="btn sm danger" onClick={del}>Delete</button>}
    </div>
  );
}
