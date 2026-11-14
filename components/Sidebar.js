"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import UserMenu from "./UserMenu";
import { IconNew, IconFolder, IconClock, IconChat, IconPanel, IconChevron, IconClose } from "./Icons";
import { closeNav, isDesktop } from "./navState";
import { KIND_ICON } from "./HistoryList";

const ITEMS = [
  ["/dashboard", IconNew, "New Project", (p) => p === "/dashboard"],
  ["/dashboard/documents", IconFolder, "My Documents", (p) => p.startsWith("/dashboard/documents")],
  ["/dashboard/history", IconClock, "Chat History", (p) => p.startsWith("/dashboard/history") || p.startsWith("/dashboard/chat")],
];

export default function Sidebar({ user, recents = [] }) {
  const path = usePathname();
  const [recentOpen, setRecentOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  // remember the sidebar / recent state between visits
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("side") === "1");
      setRecentOpen(localStorage.getItem("recent") !== "0");
    } catch {}
  }, []);
  // icon-only sidebar is a desktop feature; on phones/tablets the sidebar is a drawer instead
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 901px)");
    const apply = () => document.querySelector(".dash")?.classList.toggle("collapsed", collapsed && mq.matches);
    apply(); mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [collapsed]);

  // close the drawer after navigating, on Escape, and when the screen grows to desktop size
  useEffect(() => { closeNav(); }, [path]);
  useEffect(() => {
    const key = (e) => e.key === "Escape" && closeNav();
    const mq = window.matchMedia("(min-width: 901px)"); const grow = () => mq.matches && closeNav();
    document.addEventListener("keydown", key); mq.addEventListener("change", grow);
    return () => { document.removeEventListener("keydown", key); mq.removeEventListener("change", grow); };
  }, []);

  const toggleSide = () => setCollapsed((c) => { try { localStorage.setItem("side", c ? "0" : "1"); } catch {} return !c; });
  const toggleRecent = () => setRecentOpen((o) => { try { localStorage.setItem("recent", o ? "0" : "1"); } catch {} return !o; });

  return (
    <>
    <div className="nav-back" onClick={closeNav} aria-hidden />
    <aside className="side" id="sidebar">
      <div className="side-head">
        <Link href="/dashboard" className="logo"><i>✎</i><span className="wm"><b>WRITE</b><span>AI</span></span></Link>
        <button className="icon-btn" onClick={() => (isDesktop() ? toggleSide() : closeNav())} aria-label="Collapse or close sidebar">
          <span className="only-desktop"><IconPanel /></span><span className="only-mobile"><IconClose /></span>
        </button>
      </div>

      {ITEMS.map(([href, Icon, label, on]) => (
        <Link key={href} href={href} title={label} className={"item" + (on(path) ? " active" : "")}><Icon /><span className="lbl">{label}</span></Link>
      ))}

      <div className="recent-wrap">
        <hr />
        <button className="recent-toggle" aria-expanded={recentOpen} onClick={toggleRecent}>Recent <IconChevron /></button>
        <div className={"recent-body" + (recentOpen ? " open" : "")}>
          <div className="recent-inner">
            {recents.length === 0 && <p className="recent-empty">Your chats will show up here.</p>}
            {recents.map((r) => (
              <Link key={r.kind + r.id} href={r.href} title={r.title} className="recent-item">
                {(() => { const I = KIND_ICON[r.kind] || IconChat; return <I />; })()}<span>{r.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grow" />
      <UserMenu user={user} />
    </aside>
    </>
  );
}
