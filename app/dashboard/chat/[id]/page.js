import { notFound } from "next/navigation";
import mongoose from "mongoose";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import Chat from "@/models/Chat";
import Document from "@/models/Document";
import ChatPanel from "@/components/ChatPanel";

export default async function Page(props) {
  const params = await props.params;
  const user = await getUser();
  if (!mongoose.isValidObjectId(params.id)) notFound();
  const chat = await Chat.findOne({ _id: params.id, user: user._id }).lean();
  if (!chat) notFound();

  // attach the generated document (slides, sheet, image, text) to the messages that produced it
  const ids = [...new Set(chat.messages.filter((m) => m.docId).map((m) => String(m.docId)))];
  const docs = ids.length ? await Document.find({ _id: { $in: ids }, user: user._id }).select("title kind asset").lean() : [];
  const map = Object.fromEntries(docs.map((d) => [String(d._id), { id: String(d._id), kind: d.kind, title: d.title, asset: d.asset ? String(d.asset) : null }]));
  const initial = chat.messages.map((m) => ({ role: m.role, content: m.content, doc: m.docId ? map[String(m.docId)] || null : null }));

  return (
    <>
      <h1 className="page-title">{chat.title}</h1>
      {chat.document && map[String(chat.document)] && <Link href={`/dashboard/documents/${chat.document}`} className="muted">Open the document →</Link>}
      <ChatPanel full chatId={String(chat._id)} documentId={chat.document ? String(chat.document) : undefined} initial={initial} />
    </>
  );
}
