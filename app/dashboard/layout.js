import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getUser, publicUser } from "@/lib/auth";
import Chat from "@/models/Chat";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { CreditsProvider } from "@/components/CreditsModal";
import { ShellSkeleton } from "@/components/Skeletons";

export const dynamic = "force-dynamic";

// The shell loads user + recents from the database. While that happens (first load / hard refresh) the visitor
// sees the full skeleton of the dashboard instead of a blank screen.
async function Shell({ children }) {
  const u = await getUser();
  if (!u) redirect("/login");
  const user = publicUser(u);

  // latest conversations for the sidebar "Recent" list
  const chats = await Chat.find({ user: u._id }).select("title kind updatedAt").sort({ updatedAt: -1 }).limit(8).lean();
  const recents = chats.map((c) => ({ id: String(c._id), title: c.title, href: `/dashboard/chat/${c._id}`, kind: c.kind || "chat" }));

  return (
    <div className="theme-orange">
      <CreditsProvider>
        <div className="dash">
          <Sidebar user={user} recents={recents} />
          <div>
            <Topbar user={user} />
            <main className="main">{children}</main>
          </div>
        </div>
      </CreditsProvider>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
