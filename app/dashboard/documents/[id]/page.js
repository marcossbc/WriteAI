import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { getUser } from "@/lib/auth";
import Document from "@/models/Document";
import Chat from "@/models/Chat";
import Markdown from "@/components/Markdown";
import ChatPanel from "@/components/ChatPanel";
import DocActions from "@/components/DocActions";

export default async function Page(props) {
  const params = await props.params;
  const user = await getUser();
  if (!mongoose.isValidObjectId(params.id)) notFound();
  const doc = await Document.findOne({ _id: params.id, user: user._id }).lean();
  if (!doc) notFound();
  const chat = await Chat.findOne({ document: doc._id, user: user._id }).select("messages").lean();
  const followUps = (chat?.messages || []).slice(2).map((m) => ({ role: m.role, content: m.content }));

  return (
    <>
      <h1 className="page-title">{doc.title}</h1>
      <p className="muted" style={{ marginBottom: 12 }}>{doc.templateName} · {doc.language}{doc.sourceFiles?.length ? ` · ${doc.sourceFiles.map((f) => f.name).join(", ")}` : ""}</p>
      <DocActions id={String(doc._id)} kind={doc.kind} deletable />
      <div className="doc-layout">
        <article className="paper">
          {doc.kind === "image" ? <img className="gen-img" src={`/api/assets/${doc.asset}`} alt={doc.task} /> : <Markdown>{doc.result}</Markdown>}
        </article>
        <ChatPanel documentId={String(doc._id)} chatId={chat ? String(chat._id) : undefined} initial={followUps} />
      </div>
    </>
  );
}
