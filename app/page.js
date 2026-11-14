import Link from "next/link";
import { Nav, Footer } from "@/components/Marketing";
import Reveal from "@/components/Reveal";
import CountUp from "@/components/CountUp";
import PricingCards from "@/components/PricingCards";
import { TEMPLATES } from "@/lib/templates-data";
import { COSTS } from "@/lib/plans";
import { LANGS } from "@/lib/validate";

const FEATURES = [
  ["📄", "PDF, Word and PowerPoint", "Upload files up to 15 MB. Every page and slide is read before the AI writes a word."],
  ["🌍", "12 output languages", "Translate or write in English, Somali, Arabic, French, Spanish, Swahili and more."],
  ["🧩", `${TEMPLATES.length} ready-made templates`, "Reports, study notes, resumes, scripts and more. The AI follows the structure you pick."],
  ["💬", "Ask follow-up questions", "Chat with a result to shorten it, change the tone or explain a section."],
  ["⬇️", "Export anywhere", "Download as PDF, Word (.docx) or Markdown in one click."],
  ["🔒", "Private by default", "Your documents are visible only to your account and can be deleted any time."],
];
const NATIVE = { Somali: "Soomaali", Arabic: "العربية", English: "English", French: "Français", Spanish: "Español", Swahili: "Kiswahili", Turkish: "Türkçe", Chinese: "中文", Hindi: "हिन्दी", Portuguese: "Português", German: "Deutsch", Russian: "Русский" };
const SECURITY = [
  ["Private by design", "Every document and chat is tied to your account. Nobody else can open them."],
  ["Brute-force protection", "Rate limits on every endpoint and automatic lockout after repeated failed sign-ins."],
  ["Audit trail", "Sign-ins, exports, deletions and purchases are logged for review."],
  ["Least privilege", "Passwords are hashed, files are processed in memory, and secrets never reach the browser."],
];
const MARQUEE = ["PDF", "Word", "PowerPoint", "Markdown", ...TEMPLATES.map((t) => t.name)];

export default function Landing() {
  return (
    <div className="theme-purple">
      <Nav />

      <section className="hero">
        <div className="ring" aria-hidden />
        <div className="container">
          <Link href="/signup" className="badge-new rise"><b>New</b> {TEMPLATES.length} ready-made templates <span aria-hidden>›</span></Link>
          <h1 className="rise" style={{ animationDelay: ".08s" }}>Documents in,<br /><em>any language</em> out.</h1>
          <p className="lead rise" style={{ animationDelay: ".16s" }}>Upload a PDF, Word or PowerPoint file, choose a template, and get a finished document in the language you need.</p>
          <div className="hero-actions rise" style={{ animationDelay: ".24s" }}>
            <Link href="/signup" className="btn primary lg">Start free with 80 credits</Link>
            <Link href="/pricing" className="btn lg">See pricing</Link>
          </div>

          <div className="frame" aria-label="Example: a French contract translated into English">
            <div className="frame-bar">
              <span className="logo"><i>✎</i> WRITE AI</span>
              <b>New Project</b><span>My Documents</span><span>Chat History</span>
              <span className="sp" /><span className="av" />
            </div>
            <div className="frame-body">
              <div className="demo2">
                <div className="scan" aria-hidden />
                <div className="chips"><span>contrat.pdf</span><span>Faithful Translation</span><span className="hot">→ English</span></div>
                <div className="src">Le paiement est dû dans les 30 jours suivant la date de la facture.</div>
                <div className="out">
                  <p>Payment is due within 30 days of the invoice date.</p>
                  <p>Both parties agree to keep all information confidential.</p>
                  <p>This agreement ends on 31 December 2026.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="stats-strip">
          <div className="stat"><b><CountUp to={TEMPLATES.length} /></b><span>ready templates</span></div>
          <div className="stat"><b><CountUp to={LANGS.length} /></b><span>output languages</span></div>
          <div className="stat"><b><CountUp to={3} /></b><span>export formats</span></div>
        </div>
      </section>

      <div className="marquee" aria-hidden><div className="track">{[...MARQUEE, ...MARQUEE].map((m, i) => <span key={i}>{m}</span>)}</div></div>

      <section className="section" id="features">
        <div className="container">
          <Reveal className="center"><div className="label">Capabilities</div><h2>Everything a document needs.</h2><p className="sub">From reading a long file to delivering a clean, translated result.</p></Reveal>
          <div className="grid g3">
            {FEATURES.map(([i, t, d], k) => (
              <Reveal key={t} delay={k * 70}><div className="card feat" style={{ height: "100%" }}><div className="ico">{i}</div><h3>{t}</h3><p>{d}</p></div></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section soft" id="process">
        <div className="container">
          <Reveal className="center"><div className="label">Process</div><h2>Upload. Choose. Export.</h2></Reveal>
          <Reveal className="steps" style={{ marginTop: 52 }}>
            <div className="step"><div className="n">01</div><h3>Upload <span>your file</span></h3><p>Drop in a PDF, Word or PowerPoint file, or just describe what you need.</p></div>
            <div className="step"><div className="n">02</div><h3>Choose <span>a template</span></h3><p>Business, Academic, Creative or Career. Pick the output language, including Somali.</p></div>
            <div className="step"><div className="n">03</div><h3>Export <span>and refine</span></h3><p>Ask follow-up questions, then download as PDF, Word or Markdown.</p></div>
          </Reveal>
        </div>
      </section>

      <section className="section" id="languages">
        <div className="container lang-wrap">
          <Reveal><div className="label">Languages</div><h2>{LANGS.length} languages, one workspace.</h2><p className="sub" style={{ marginBottom: 0 }}>Translate or write in English, Somali, Arabic, French and more. Output rules are tuned for natural-sounding text, not word-for-word translation.</p></Reveal>
          <Reveal delay={100}>
            <div className="lang-list">
              {LANGS.map((l) => (
                <div key={l} className={"lang" + (l === "Somali" ? " first" : "")}>
                  <div>{l}<small>{NATIVE[l]}</small></div>
                  <span className="ok"><i className="dot" /> Ready</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section soft">
        <div className="container">
          <Reveal className="center"><div className="live"><i className="dot" /> CREDITS</div><h2>Pay for what you process.</h2><p className="sub">Start free. Top up only when you need more.</p></Reveal>
          <div className="figures">
            <Reveal><div className="figure"><b><CountUp to={80} /></b><span>free credits when you sign up</span></div></Reveal>
            <Reveal delay={90}><div className="figure"><b><CountUp to={COSTS.process} /></b><span>credits to process a document</span></div></Reveal>
            <Reveal delay={180}><div className="figure"><b><CountUp to={COSTS.chat} /></b><span>credits per chat message</span></div></Reveal>
          </div>
        </div>
      </section>

      <section className="section" id="security">
        <div className="container">
          <Reveal className="center"><div className="label">Security</div><h2>Your documents stay yours.</h2><p className="sub">Built with limits and logs, so nothing happens that you can't inspect.</p></Reveal>
          <div className="grid g4">
            {SECURITY.map(([t, d], k) => (
              <Reveal key={t} delay={k * 70}><div className="card feat" style={{ height: "100%" }}><h3>{t}</h3><p>{d}</p></div></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section soft" id="pricing">
        <div className="container">
          <Reveal className="center"><div className="label">Pricing</div><h2>Simple plans for every workload.</h2><p className="sub">Start free. Upgrade when you need more credits.</p></Reveal>
          <PricingCards loggedIn={false} showPacks={false} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <div className="cta-band">
              <h2>Ready to hand off your documents?</h2>
              <p>Create an account, get 80 free credits, and process your first file in minutes.</p>
              <Link href="/signup" className="btn primary lg">Create free account</Link>
            </div>
          </Reveal>
        </div>
      </section>
      <Footer />
    </div>
  );
}
