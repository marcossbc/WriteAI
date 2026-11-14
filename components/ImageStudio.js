"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { COSTS } from "@/lib/plans";
import { REF_EXT, MAX_REFS, MAX_REF_BYTES } from "@/lib/validate";
import Processing from "./Processing";
import { IconBack, IconImage, IconSend, IconClose } from "./Icons";

const TOOLS = [
  { t: "Logo Maker", e: "✦", h: 24, p: "A modern minimal logo for [brand name], simple geometric symbol, flat vector style, on a clean white background" },
  { t: "Poster Maker", e: "▤", h: 330, p: "A bold event poster for [event], strong typography, vibrant colors, clean grid layout" },
  { t: "Product Photo", e: "◍", h: 200, p: "A clean studio product photo of [product] on a soft neutral background, soft shadow, high detail" },
  { t: "Social Banner", e: "▭", h: 260, p: "A wide social media banner for [topic], modern gradient background, space for text on the left" },
  { t: "App Icon", e: "◆", h: 150, p: "A rounded-square app icon for [app], single bold symbol, smooth gradient, no text" },
  { t: "Business Card", e: "▣", h: 40, p: "A minimal business card design for [name], [profession], elegant typography, front and back" },
  { t: "Pattern & Wallpaper", e: "❖", h: 290, p: "A seamless repeating pattern of [motif], pastel palette, flat illustration style" },
  { t: "Illustration", e: "✎", h: 180, p: "A friendly flat illustration of [scene], soft colors, simple shapes, editorial style" },
];
const GALLERY = {
  "Brand Design": [
    { t: "Coffee Brand Kit", h: 28, p: "Minimalist brand identity set for a coffee shop called KOOKO: logo, paper cup, paper bag, business card and menu, laid out neatly on a white background, orange and cream palette" },
    { t: "Bank Logo", h: 210, p: "A trustworthy modern logo for a community bank, deep blue and silver, clean geometric mark" },
    { t: "Restaurant Menu", h: 12, p: "An elegant one-page restaurant menu design, warm colors, serif typography, subtle food illustrations" },
    { t: "Startup Letterhead", h: 250, p: "A clean letterhead and envelope design for a tech startup, one accent color, lots of white space" },
  ],
  "Poster Design": [
    { t: "Music Festival", h: 300, p: "A vibrant music festival poster, hand-drawn lettering, sunset gradient, crowd silhouette" },
    { t: "Education Fair", h: 220, p: "A friendly poster for a university education fair, bold shapes, bright colors, clear hierarchy" },
    { t: "Movie Night", h: 270, p: "A retro movie night poster, film strip border, warm vintage colors" },
    { t: "Charity Run", h: 120, p: "An energetic charity run poster with runners in motion, green and white palette" },
  ],
  "Art Design": [
    { t: "Watercolor Valley", h: 160, p: "A calm sunrise over a wide desert valley, soft watercolor painting, warm light" },
    { t: "Geometric Abstract", h: 340, p: "A geometric abstract composition, overlapping circles and arcs, bold limited palette, gallery print" },
    { t: "Ink Landscape", h: 190, p: "A minimalist ink wash landscape with mountains and mist, lots of negative space" },
    { t: "Neon City", h: 280, p: "A neon-lit futuristic city street at night, rain reflections, cinematic wide shot" },
  ],
  "Character Design": [
    { t: "Friendly Mascot", h: 30, p: "A cute friendly mascot character for a delivery company, round shapes, big eyes, flat vector style, white background" },
    { t: "Fantasy Explorer", h: 140, p: "A fantasy explorer character concept, full body, detailed outfit, neutral background, character sheet" },
    { t: "Robot Helper", h: 220, p: "A small helpful robot character, soft rounded design, pastel colors, 3D render" },
    { t: "Animal Hero", h: 100, p: "An animal hero character in a cape, children's book illustration style" },
  ],
  "Life & Entertainment": [
    { t: "Birthday Card", h: 320, p: "A joyful birthday card illustration with balloons and confetti, bright playful colors" },
    { t: "Wedding Invitation", h: 345, p: "An elegant wedding invitation with gold floral border, cream background, calligraphy" },
    { t: "Game Cover", h: 260, p: "A dramatic video game cover art, hero silhouette against a glowing horizon" },
    { t: "Travel Postcard", h: 190, p: "A vintage travel postcard of a coastal town, bold flat colors, retro lettering" },
  ],
};
const TABS = ["Featured", ...Object.keys(GALLERY)];
const MODELS = [{ id: "gpt-image-1", name: "GPT Image" }, { id: "dall-e-3", name: "DALL·E 3" }];
const SHAPES = { "gpt-image-1": [["square", "1:1"], ["landscape", "3:2"], ["portrait", "2:3"]], "dall-e-3": [["square", "1:1"], ["landscape", "16:9"], ["portrait", "9:16"]] };

export default function ImageStudio({ defaultModel = "gpt-image-1" }) {
  const router = useRouter();
  const fileRef = useRef(null);
  const taRef = useRef(null);
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(MODELS.some((m) => m.id === defaultModel) ? defaultModel : "gpt-image-1");
  const [shape, setShape] = useState("landscape");
  const [refs, setRefs] = useState([]);
  const [tab, setTab] = useState("Featured");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const previews = useMemo(() => refs.map((f) => URL.createObjectURL(f)), [refs]);
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);
  const dalle = model === "dall-e-3";

  const cards = tab === "Featured" ? Object.values(GALLERY).map((g) => g[0]) : GALLERY[tab];
  const use = (p) => { setPrompt(p); setErr(""); taRef.current?.focus(); window.scrollTo({ top: 0, behavior: "smooth" }); };

  function addRefs(list) {
    const ok = [];
    for (const f of Array.from(list)) {
      const ext = (f.name.match(/\.[^.]+$/) || [""])[0].toLowerCase();
      if (!REF_EXT.includes(ext)) { setErr("Reference images must be PNG, JPG or WebP."); continue; }
      if (f.size > MAX_REF_BYTES) { setErr("Reference images must be under 10 MB."); continue; }
      ok.push(f);
    }
    setRefs((c) => [...c, ...ok].slice(0, MAX_REFS));
  }

  async function run() {
    setBusy(true); setErr("");
    const fd = new FormData();
    fd.set("mode", "image"); fd.set("task", prompt); fd.set("shape", shape); fd.set("model", model); fd.set("language", "English");
    if (!dalle) refs.forEach((f) => fd.append("files", f));
    try {
      const res = await fetch("/api/projects", { method: "POST", body: fd });
      const data = await res.json();
      if (res.status === 402) return router.push("/dashboard/credits?need=1");
      if (!res.ok) throw new Error(data.error);
      router.push(`/dashboard/chat/${data.chatId}`); router.refresh();
    } catch (e) { setErr(e.message || "Something went wrong."); } finally { setBusy(false); }
  }

  return (
    <>
      <div className="studio-head">
        <Link href="/dashboard" className="back"><IconBack /> Back</Link>
        <h1>AI Image</h1>
        <p>Create instant visuals that bring ideas to life</p>
      </div>

      <div className="composer studio">
        {err && <div className="error" role="alert" style={{ marginBottom: 10 }}>{err}</div>}
        <div className="ref-row">
          {previews.map((src, i) => (
            <div className="ref-tile has" key={src}>
              <img src={src} alt={`Reference ${i + 1}`} />
              <button aria-label="Remove reference image" onClick={() => setRefs(refs.filter((_, j) => j !== i))}><IconClose /></button>
            </div>
          ))}
          {refs.length < MAX_REFS && (
            <button className="ref-tile" disabled={dalle} onClick={() => fileRef.current.click()} title={dalle ? "Reference images need the GPT Image model" : "Upload a reference image"}>
              <IconImage /><span>Upload</span>
            </button>
          )}
          <input ref={fileRef} type="file" hidden multiple accept=".png,.jpg,.jpeg,.webp" onChange={(e) => { addRefs(e.target.files); e.target.value = ""; }} />
        </div>
        <textarea ref={taRef} readOnly={busy} value={prompt} onChange={(e) => setPrompt(e.target.value)} maxLength={1000} placeholder="Describe the image you want to create…" aria-label="Image prompt" />
        <div className="row">
          <div className="tools">
            <label className="chip"><IconImage style={{ width: 15, height: 15 }} />
              <select value={model} onChange={(e) => { setModel(e.target.value); setShape("landscape"); if (e.target.value === "dall-e-3") setRefs([]); }} aria-label="Image model">{MODELS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
            </label>
            <label className="chip">▭ <select value={shape} onChange={(e) => setShape(e.target.value)} aria-label="Aspect ratio">{SHAPES[model].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
          </div>
          <div className="tools">
            <span className="muted" style={{ fontSize: 13 }}>{COSTS.image} Credits</span>
            <button className="send" aria-label="Generate image" disabled={busy || !prompt.trim()} onClick={run}>{busy ? <span className="dot" /> : <IconSend />}</button>
          </div>
        </div>
      </div>

      {busy && <Processing mode="image" />}

      <div className={"toolcards" + (busy ? " is-busy" : "")}>
        {TOOLS.map((x, i) => (
          <button key={x.t} className="tool" style={{ "--h": x.h, animationDelay: `${i * 45}ms` }} onClick={() => use(x.p)}>
            <span>{x.t}</span><i aria-hidden>{x.e}</i>
          </button>
        ))}
      </div>

      <div className={busy ? "is-busy" : ""}>
      <div className="tabs" role="tablist">
        {TABS.map((t) => <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>)}
      </div>
      <div className="tpl" key={tab}>
        {cards.map((c, i) => (
          <button key={c.t} className="tcard" style={{ animationDelay: `${i * 55}ms` }} onClick={() => use(c.p)}>
            <div className="thumb gen" style={{ "--h": c.h }}><span className="tag">{tab === "Featured" ? "Featured" : tab}</span><b>{c.t}</b></div>
            <div className="tbody"><h4>{c.t}</h4><p>{c.p.length > 90 ? c.p.slice(0, 88) + "…" : c.p}</p></div>
          </button>
        ))}
      </div>
      </div>
    </>
  );
}
