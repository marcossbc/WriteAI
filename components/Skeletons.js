// Skeleton (shimmering placeholder) screens. No hooks, so they work in server and client components.
const L = ({ w = "100%", h = 14, r, style, className = "" }) => <span className={"sk " + className} style={{ display: "block", width: w, height: h, borderRadius: r, ...style }} />;
const Wrap = ({ children, label = "Loading" }) => <div role="status" aria-busy="true" aria-live="polite"><span className="sr-only">{label}…</span>{children}</div>;

export function TemplateGridSkeleton({ count = 6 }) {
  return (
    <div className="tpl" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div className="tcard sk-card" key={i} style={{ animationDelay: `${i * 50}ms` }}>
          <L h={132} r={0} />
          <div className="tbody"><L w="60%" h={16} style={{ marginBottom: 10 }} /><L w="95%" h={12} style={{ marginBottom: 6 }} /><L w="70%" h={12} /></div>
        </div>
      ))}
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <Wrap label="Loading your workspace">
      <div className="hi" style={{ animation: "none" }}><L w={320} h={44} r={12} style={{ margin: "0 auto 18px", maxWidth: "80%" }} /><L w={440} h={20} r={8} style={{ margin: "0 auto", maxWidth: "90%" }} /></div>
      <div className="composer" style={{ animation: "none" }} aria-hidden>
        <L w="55%" h={16} style={{ marginBottom: 12 }} /><L w="35%" h={16} style={{ marginBottom: 46 }} />
        <div className="row"><div className="tools"><L w={170} h={32} r={999} /><L w={110} h={32} r={999} /></div><div className="tools"><L w={26} h={26} r={999} /><L w={42} h={42} r={999} /></div></div>
      </div>
      <div className="modes" aria-hidden>
        {Array.from({ length: 7 }, (_, i) => <div className="mode" key={i} style={{ animation: "none" }}><L w={56} h={56} r={999} /><L w={64} h={10} r={6} /></div>)}
      </div>
      <div className="tabs" style={{ animation: "none", gap: 28, paddingBottom: 14 }} aria-hidden>{[70, 64, 110, 70, 62].map((w, i) => <L key={i} w={w} h={14} />)}</div>
      <TemplateGridSkeleton />
    </Wrap>
  );
}

export function PageSkeleton({ rows = 5, search = false, title = true }) {
  return (
    <Wrap>
      {title && <><L w={260} h={34} r={10} style={{ margin: "30px 0 12px" }} /><L w={420} h={14} style={{ maxWidth: "90%" }} /></>}
      {search && <L h={46} r={999} style={{ marginTop: 18 }} />}
      <div className="list" aria-hidden>
        {Array.from({ length: rows }, (_, i) => (
          <div className="row-item" key={i} style={{ animationDelay: `${i * 60}ms` }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center", flex: 1 }}><L w={38} h={38} r={10} /><div style={{ flex: 1 }}><L w={`${55 + ((i * 13) % 35)}%`} h={15} style={{ marginBottom: 8 }} /><L w="30%" h={11} /></div></div>
            <L w={70} h={12} />
          </div>
        ))}
      </div>
    </Wrap>
  );
}

export function ChatSkeleton() {
  return (
    <Wrap label="Loading conversation">
      <L w="46%" h={34} r={10} style={{ margin: "30px 0 18px" }} />
      <div className="chat chat-full" aria-hidden>
        <div className="msgs">
          <div style={{ alignSelf: "flex-end", width: "38%" }}><L h={40} r={16} /></div>
          <div style={{ width: "100%", border: "1px solid var(--line)", borderRadius: 14, padding: 18 }}>
            <L w="38%" h={22} style={{ marginBottom: 16 }} />
            {[96, 88, 92, 70, 84, 55].map((w, i) => <L key={i} w={`${w}%`} h={13} style={{ marginBottom: 10 }} />)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, padding: 10, borderTop: "1px solid var(--line)" }}><L h={40} r={12} style={{ flex: 1 }} /><L w={64} h={34} r={999} /></div>
      </div>
    </Wrap>
  );
}

export function DocSkeleton() {
  return (
    <Wrap label="Loading document">
      <L w="50%" h={34} r={10} style={{ margin: "30px 0 12px" }} /><L w="32%" h={13} style={{ marginBottom: 14 }} />
      <div style={{ display: "flex", gap: 8 }} aria-hidden>{[56, 60, 84, 60].map((w, i) => <L key={i} w={w} h={30} r={999} />)}</div>
      <div className="doc-layout" aria-hidden>
        <div className="paper"><L w="45%" h={26} style={{ marginBottom: 22 }} />{[95, 90, 97, 60, 92, 88, 70, 94, 50].map((w, i) => <L key={i} w={`${w}%`} h={13} style={{ marginBottom: 11 }} />)}</div>
        <div className="chat"><div className="msgs"><L w="80%" h={14} /><L w="60%" h={14} /></div><div style={{ padding: 10, borderTop: "1px solid var(--line)" }}><L h={40} r={12} /></div></div>
      </div>
    </Wrap>
  );
}

export function StudioSkeleton() {
  return (
    <Wrap label="Loading AI Image">
      <div className="studio-head" style={{ animation: "none" }}><L w={90} h={34} r={999} style={{ position: "absolute", left: 0, top: 14 }} /><L w={140} h={26} r={8} style={{ margin: "6px auto 0" }} /><L w={330} h={18} r={8} style={{ margin: "22px auto 0", maxWidth: "80%" }} /></div>
      <div className="composer" style={{ animation: "none", marginTop: 26 }} aria-hidden>
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}><L w={70} h={70} r={12} /></div>
        <L w="60%" h={15} style={{ marginBottom: 12 }} /><L w="40%" h={15} style={{ marginBottom: 60 }} />
        <div className="row"><div className="tools"><L w={130} h={32} r={999} /><L w={80} h={32} r={999} /></div><L w={42} h={42} r={999} /></div>
      </div>
      <div className="toolcards" aria-hidden>{Array.from({ length: 6 }, (_, i) => <L key={i} h={92} r={14} />)}</div>
    </Wrap>
  );
}

/** Whole dashboard frame (sidebar + top bar + page). Shown instantly on a hard refresh while user data loads. */
export function ShellSkeleton({ children }) {
  return (
    <div className="theme-orange">
      <div className="dash">
        <aside className="side" aria-hidden>
          <div className="side-head"><L w={120} h={26} r={8} /><L w={32} h={32} r={8} /></div>
          {[0, 1, 2].map((i) => <div key={i} style={{ padding: "11px 12px", display: "flex", gap: 12 }}><L w={18} h={18} r={5} /><L w={`${55 + i * 12}%`} h={14} /></div>)}
          <hr />
          <div style={{ padding: "6px 12px" }}><L w={60} h={12} /></div>
          {[0, 1, 2, 3].map((i) => <div key={i} style={{ padding: "8px 12px" }}><L w={`${70 - i * 8}%`} h={12} /></div>)}
          <div className="grow" />
          <div className="me" style={{ gap: 10 }}><L w={30} h={30} r={999} /><L w="60%" h={12} /></div>
        </aside>
        <div>
          <div className="top" aria-hidden><L w={38} h={38} r={999} /><L w={250} h={38} r={999} /><L w={70} h={38} r={999} /></div>
          <main className="main">{children || <PageSkeleton rows={4} />}</main>
        </div>
      </div>
    </div>
  );
}
