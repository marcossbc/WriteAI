import { getUser } from "@/lib/auth";
import Memory from "@/models/Memory";
import MemoryCenter from "@/components/MemoryCenter";
import { MAX_MEMORIES } from "@/lib/memory";

export const metadata = { title: "Memory Center — WriteAI" };

export default async function Page() {
  const user = await getUser();
  const rows = await Memory.find({ user: user._id }).sort({ createdAt: -1 }).limit(MAX_MEMORIES).lean();
  return (
    <>
      <h1 className="page-title">Memory Center</h1>
      <p className="muted">Tell the AI things it should always know about you. These are used in every project and chat, and you can delete them any time.</p>
      <MemoryCenter initial={rows.map((m) => ({ id: String(m._id), text: m.text }))} max={MAX_MEMORIES} />
    </>
  );
}
