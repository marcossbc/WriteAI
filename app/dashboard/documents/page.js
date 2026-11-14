import Link from "next/link";
import { getUser } from "@/lib/auth";
import Document from "@/models/Document";

export const metadata = { title: "My documents — WriteAI" };
const KIND = { document: "📄 Document", writer: "✍️ Writing", slides: "🖥 Slides", sheet: "📊 Spreadsheet", image: "🖼 Image" };

export default async function Page() {
  const user = await getUser();
  const docs = await Document.find({ user: user._id }).select("title templateName language kind createdAt").sort({ createdAt: -1 }).limit(300).lean();
  return (
    <>
      <h1 className="page-title">My Documents</h1>
      <p className="muted">Everything you have created: documents, slides, spreadsheets and images.</p>
      {docs.length === 0 ? (
        <div className="empty"><p>Nothing here yet. Start a project and it will be saved automatically.</p><Link href="/dashboard" className="btn primary">New project</Link></div>
      ) : (
        <div className="list">
          {docs.map((d) => (
            <Link key={String(d._id)} href={`/dashboard/documents/${d._id}`} className="row-item">
              <div><b>{d.title}</b><div className="muted" style={{ fontSize: 13 }}>{KIND[d.kind] || KIND.document} · {d.templateName} · {d.language}</div></div>
              <span className="muted" style={{ fontSize: 13 }}>{new Date(d.createdAt).toLocaleDateString()}</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
