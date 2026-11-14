import Link from "next/link";
import { getUser } from "@/lib/auth";
import Chat from "@/models/Chat";
import HistoryList from "@/components/HistoryList";

export const metadata = { title: "Chat history — WriteAI" };

export default async function Page() {
  const user = await getUser();
  const rows = await Chat.find({ user: user._id }).select("title kind updatedAt messages").sort({ updatedAt: -1 }).limit(200).lean();
  const chats = rows.map((c) => ({ id: String(c._id), title: c.title, kind: c.kind, count: c.messages.length, at: +new Date(c.updatedAt) }));
  return (
    <>
      <h1 className="page-title">Chat History</h1>
      <p className="muted">Every request you send is saved here. Pick up any conversation where you left it.</p>
      {chats.length === 0 ? (
        <div className="empty"><p>No chats yet. Type a request on the home page and it will appear here.</p><Link href="/dashboard" className="btn primary">New project</Link></div>
      ) : <HistoryList chats={chats} />}
    </>
  );
}
