"use client";
import { useEffect, useState } from "react";

const STEPS = {
  docsFile: ["Reading your file…", "Analyzing the content…", "Writing your document…", "Almost there…"],
  docs: ["Understanding your request…", "Writing your document…", "Almost there…"],
  writer: ["Thinking…", "Writing…", "Polishing the text…"],
  slides: ["Planning the story…", "Designing your slides…", "Building the deck…", "Almost there…"],
  sheets: ["Designing the columns…", "Filling in the data…", "Building your workbook…"],
  image: ["Reading your prompt…", "Painting your image…", "Adding the final details…", "This can take up to a minute…"],
};

/** Shown under the composer while the AI works: a skeleton of the thing being made + rotating status text. */
export default function Processing({ mode, hasFiles }) {
  const key = mode === "docs" ? (hasFiles ? "docsFile" : "docs") : mode;
  const steps = STEPS[key] || STEPS.writer;
  const [i, setI] = useState(0);
  useEffect(() => {
    setI(0);
    const t = setInterval(() => setI((x) => Math.min(x + 1, steps.length - 1)), 3200);
    return () => clearInterval(t);
  }, [key, steps.length]);

  return (
    <div className="proc" role="status" aria-live="polite" aria-busy="true">
      <p className="proc-status"><i className="dot" /> <span key={i} className="proc-msg">{steps[i]}</span></p>
      {(mode === "docs" || mode === "writer") && (
        <div className="proc-doc" aria-hidden>
          <span className="sk" style={{ width: "42%", height: 22 }} />
          {[96, 90, 94, 62, 92, 85, 70].map((w, n) => <span key={n} className="sk" style={{ width: `${w}%`, height: 12, animationDelay: `${n * 80}ms` }} />)}
        </div>
      )}
      {mode === "slides" && <div className="proc-slides" aria-hidden>{[0, 1, 2].map((n) => <div key={n} className="sk-slide"><span className="sk" style={{ width: "60%", height: 12 }} /><span className="sk" style={{ width: "85%", height: 8 }} /><span className="sk" style={{ width: "70%", height: 8 }} /></div>)}</div>}
      {mode === "sheets" && <div className="proc-sheet" aria-hidden>{Array.from({ length: 20 }, (_, n) => <span key={n} className="sk" style={{ height: 14, animationDelay: `${(n % 5) * 70}ms` }} />)}</div>}
      {mode === "image" && <div className="proc-image sk" aria-hidden />}
    </div>
  );
}
