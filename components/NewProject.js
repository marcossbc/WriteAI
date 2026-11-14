"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { COSTS } from "@/lib/plans";
import { LANGS, ALLOWED_EXT, MAX_FILE_BYTES, MAX_FILES } from "@/lib/validate";
import Processing from "./Processing";
import TemplatePreview from "./TemplatePreview";
import { TemplateGridSkeleton } from "./Skeletons";
import { IconClip, IconSend, IconSlides, IconSheet, IconImage, IconVideo, IconDesign, IconWriter, IconMore } from "./Icons";

const TABS = ["Featured", "Business", "Academic", "Creative", "Career"];

// ok:true = works and saves to the database. ok:false = shown as "Soon".
const MODES = [
  { id: "slides", label: "Slides Agent", Icon: IconSlides, ok: true, hint: "Enter your presentation topic, idea, or requirements…",
    examples: ["A 6-slide pitch for a mobile-money startup in Somalia", "Quarterly sales review for the board", "Introduction to climate change for students"] },
  { id: "sheets", label: "AI Spreadsheets", Icon: IconSheet, ok: true, hint: "Describe the spreadsheet you need…",
    examples: ["Monthly household budget tracker", "Project task list with owners and deadlines", "Student gradebook for 15 students"] },
  { id: "image", label: "AI Image", Icon: IconImage, ok: true, href: "/dashboard/image", hint: "Describe the image you want to create…",
    examples: ["A modern logo for a coffee shop in Garowe, orange and cream", "A calm sunrise over the Nugaal valley, watercolor", "A clean product photo of a leather notebook"] },
  { id: "video", label: "AI Video", Icon: IconVideo, ok: false },
  { id: "design", label: "AI Design", Icon: IconDesign, ok: false },
  { id: "writer", label: "General Writer", Icon: IconWriter, ok: true, hint: "What should I write? An article, email, letter, speech…",
    examples: ["A formal email asking a supplier to extend a payment deadline", "A 500-word blog post about learning English online", "A speech for a graduation ceremony"] },
  { id: "more", label: "More", Icon: IconMore, ok: false },
];

export default function NewProject({ initialTemplates = [] }) {
  const router = useRouter();
  const fileRef = useRef(null);
  const [templates, setTemplates] = useState(initialTemplates);
  const [tab, setTab] = useState("Featured");
  const [slug, setSlug] = useState(() => initialTemplates.find((t) => t.featured)?.slug || initialTemplates[0]?.slug || "");
  const [mode, setMode] = useState("docs");
  const [task, setTask] = useState("");
  const [language, setLanguage] = useState("English");
  const [count, setCount] = useState("8");
  const [shape, setShape] = useState("square");
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // Templates arrive with the page (server-rendered). Fall back to the API only if the page was given none.
  useEffect(() => {
    if (initialTemplates.length) return;
    fetch("/api/templates").then((r) => r.json()).then((d) => {
      setTemplates(d.templates || []);
      setSlug(d.templates?.find((t) => t.featured)?.slug || d.templates?.[0]?.slug || "");
    });
  }, [initialTemplates.length]);

  const cur = MODES.find((m) => m.id === mode);
  const cost = COSTS[mode];
  const shown = templates.filter((t) => (tab === "Featured" ? t.featured : t.category === tab));
  const label = { Academic: "Edu & Academic" };
  const canSend = !busy && (mode === "docs" ? !!slug && (!!task.trim() || files.length > 0) : mode === "image" ? !!task.trim() : !!task.trim() || files.length > 0);

  function pick(m) {
    if (!m.ok) return;
    if (m.href) return router.push(m.href); // AI Image has its own studio page
    setErr(""); setMode((x) => (x === m.id ? "docs" : m.id));
    if (m.id === "image") setFiles([]);
  }

  function addFiles(list) {
    const ok = [];
    for (const f of Array.from(list)) {
      const ext = (f.name.match(/\.[^.]+$/) || [""])[0].toLowerCase();
      if (!ALLOWED_EXT.includes(ext)) { setErr(`${f.name} is not supported. Use PDF, Word, PowerPoint, TXT or MD.`); continue; }
      if (f.size > MAX_FILE_BYTES) { setErr(`${f.name} is larger than 15 MB.`); continue; }
      ok.push(f);
    }
    setFiles((c) => [...c, ...ok].slice(0, MAX_FILES));
  }

  async function run() {
    setBusy(true); setErr("");
    const fd = new FormData();
    fd.set("mode", mode); fd.set("task", task); fd.set("language", language); fd.set("count", count); fd.set("shape", shape);
    if (mode === "docs") fd.set("template", slug);
    files.forEach((f) => fd.append("files", f));
    try {
      const res = await fetch("/api/projects", { method: "POST", body: fd });
      const data = await res.json();
      if (res.status === 402) return router.push("/dashboard/credits?need=1");
      if (!res.ok) throw new Error(data.error);
      router.push(`/dashboard/chat/${data.chatId}`); router.refresh(); // opens the saved conversation + updates Recent and credits
    } catch (e) {
      setErr(e.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="hi">
        <h1>Hi, I am <em>Write</em></h1>
        <p>The all-in-one AI workspace that makes everyone a pro</p>
      </div>

      <div className="composer">
        {err && <div className="error" role="alert" style={{ marginBottom: 10 }}>{err}</div>}
        {files.length > 0 && (
          <div className="files">
            {files.map((f, i) => (
              <span className="chip" key={i}>📎 {f.name}
                <button aria-label={`Remove ${f.name}`} onClick={() => setFiles(files.filter((_, j) => j !== i))} style={{ border: "none", background: "none" }}>✕</button>
              </span>
            ))}
          </div>
        )}
        <textarea value={task} readOnly={busy} onChange={(e) => setTask(e.target.value)} maxLength={mode === "image" ? 1000 : 4000}
          placeholder={cur?.hint || "Ask me anything, or assign a task. Example: translate this document into Somali."} aria-label="Your request" />
        <div className="row">
          <div className="tools">
            {mode === "docs" && <span className="chip">Template: <b>{templates.find((t) => t.slug === slug)?.name || "…"}</b></span>}
            {mode !== "docs" && <span className="chip on-chip">{cur.label}<button aria-label="Back to documents" onClick={() => setMode("docs")} style={{ border: "none", background: "none" }}>✕</button></span>}
            {mode !== "image" && (
              <label className="chip">🌐 <select value={language} onChange={(e) => setLanguage(e.target.value)} aria-label="Output language">{LANGS.map((l) => <option key={l}>{l}</option>)}</select></label>
            )}
            {mode === "slides" && (
              <label className="chip"><select value={count} onChange={(e) => setCount(e.target.value)} aria-label="Number of slides"><option value="5">5 slides</option><option value="8">8 slides</option><option value="12">12 slides</option></select></label>
            )}
            {mode === "image" && (
              <label className="chip"><select value={shape} onChange={(e) => setShape(e.target.value)} aria-label="Image shape"><option value="square">Square</option><option value="landscape">Landscape</option><option value="portrait">Portrait</option></select></label>
            )}
          </div>
          <div className="tools">
            <input ref={fileRef} type="file" hidden multiple accept=".pdf,.docx,.pptx,.txt,.md" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
            {mode !== "image" && <button className="icon-btn" onClick={() => fileRef.current.click()} aria-label="Attach PDF, Word or PowerPoint" title="Attach PDF / Word / PPT"><IconClip /></button>}
            <span className="muted" style={{ fontSize: 12 }}>{cost} credits</span>
            <button className="send" aria-label="Run" disabled={!canSend} onClick={run}>{busy ? <span className="dot" /> : <IconSend />}</button>
          </div>
        </div>
      </div>

      {busy && <Processing mode={mode} hasFiles={files.length > 0} />}

      <div className={busy ? "is-busy" : ""}>
      <div className="modes" role="group" aria-label="Agents">
        {MODES.map((m, i) => (
          <button key={m.id} className={"mode" + (mode === m.id ? " on" : "") + (m.ok ? "" : " soon")} style={{ animationDelay: `${0.2 + i * 0.05}s` }}
            onClick={() => pick(m)} aria-pressed={mode === m.id} aria-disabled={!m.ok} title={m.ok ? m.label : `${m.label} — coming soon`}>
            <span className="disc"><m.Icon /></span>
            <span className="ml">{m.label}</span>
            {!m.ok && <span className="soon-tag">Soon</span>}
          </button>
        ))}
      </div>

      {mode === "docs" ? (
        <>
          <div className="tabs" role="tablist">
            {TABS.map((t) => <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{label[t] || t}</button>)}
          </div>
          <div className="tpl" key={tab}>
            {shown.map((t, i) => (
              <button key={t.slug} className={"tcard" + (slug === t.slug ? " on" : "")} style={{ animationDelay: `${i * 55}ms` }} onClick={() => setSlug(t.slug)} aria-pressed={slug === t.slug}>
                <div className={"thumb th-" + t.category}>
                  <span className="tag">{t.category}</span>
                  <TemplatePreview t={t} />
                </div>
                <div className="tbody"><h4>{t.name}</h4><p>{t.description}</p></div>
              </button>
            ))}
          </div>
          {!shown.length && <TemplateGridSkeleton />}
        </>
      ) : (
        <div className="examples" key={mode}>
          <div className="tabs"><button className="on" role="tab" aria-selected>Try an example</button></div>
          <div className="ex-grid">
            {cur.examples.map((ex, i) => (
              <button key={ex} className="ex" style={{ animationDelay: `${i * 70}ms` }} onClick={() => setTask(ex)}>{ex}</button>
            ))}
          </div>
        </div>
      )}
      </div>
    </>
  );
}
