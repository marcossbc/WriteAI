// A miniature, real-looking page for each template. Built from the template's own section names and layout.
const Lines = ({ n = 2 }) => <>{Array.from({ length: n }, (_, i) => <i key={i} style={{ width: `${92 - ((i * 23) % 40)}%` }} />)}</>;

export default function TemplatePreview({ t }) {
  const secs = (t.sections || []).slice(0, 5);
  const layout = t.layout || "report";
  let body;
  if (layout === "slides") {
    body = <div className="pv-slides">{secs.slice(0, 3).map((s) => <div key={s} className="pv-slide"><em>{s}</em><Lines n={2} /></div>)}</div>;
  } else if (layout === "quadrants") {
    body = <div className="pv-quad">{secs.slice(0, 4).map((s, i) => <div key={s} className={"q q" + i}><em>{s}</em><Lines n={2} /></div>)}</div>;
  } else if (layout === "table") {
    body = <div className="pv-table">{secs.slice(0, 4).map((s) => <div key={s} className="r"><em>{s}</em><i /><i /></div>)}</div>;
  } else if (layout === "resume") {
    body = <div className="pv-resume"><div className="side"><span className="av" /><i /><i /><i /></div><div className="main">{secs.slice(0, 3).map((s) => <div key={s}><em>{s}</em><Lines n={2} /></div>)}</div></div>;
  } else if (layout === "columns") {
    body = <div className="pv-cols">{secs.slice(0, 3).map((s) => <div key={s}><em>{s}</em><Lines n={4} /></div>)}</div>;
  } else if (layout === "cards") {
    body = <div className="pv-cards">{secs.slice(0, 3).map((s) => <div key={s}><em>{s}</em><Lines n={3} /></div>)}</div>;
  } else if (layout === "script") {
    body = <div className="pv-script">{secs.slice(0, 4).map((s, i) => <div key={s}><span>0:{String(i * 15).padStart(2, "0")}</span><div><em>{s}</em><i /></div></div>)}</div>;
  } else if (layout === "notes") {
    body = <div className="pv-notes">{secs.slice(0, 4).map((s) => <div key={s}><em>{s}</em><p><u />{" "}<i /></p><p><u />{" "}<i style={{ width: "60%" }} /></p></div>)}</div>;
  } else if (layout === "letter") {
    body = <div className="pv-letter"><em>{secs[0]}</em><Lines n={1} /><br /><Lines n={5} /><br /><em>{secs[secs.length - 1]}</em></div>;
  } else {
    body = <div className="pv-report">{secs.slice(0, 4).map((s) => <div key={s}><em>{s}</em><Lines n={2} /></div>)}</div>;
  }
  return <div className="pv" aria-hidden><b>{t.name}</b>{body}</div>;
}
