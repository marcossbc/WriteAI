import mammoth from "mammoth";
import JSZip from "jszip";
import { UserError } from "./validate";

const MAX_TEXT = 400000;
const MAX_PDF_PAGES = 200;
const MAX_SLIDES = 300;

// Check the real file signature, not just the extension (stops disguised uploads).
const isPdf = (b) => b.slice(0, 5).toString("latin1") === "%PDF-";
const isZip = (b) => b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04;

/** Extract plain text from PDF, DOCX, PPTX, TXT, MD. Files are processed in memory only — never written to disk. */
export async function extractText(file) {
  const name = file.name.toLowerCase();
  const buf = Buffer.from(await file.arrayBuffer());
  let text = "";
  try {
    if (name.endsWith(".pdf")) {
      if (!isPdf(buf)) throw new UserError(`${file.name} is not a valid PDF.`);
      const pdf = (await import("pdf-parse/lib/pdf-parse.js")).default;
      text = (await pdf(buf, { max: MAX_PDF_PAGES })).text;
    } else if (name.endsWith(".docx")) {
      if (!isZip(buf)) throw new UserError(`${file.name} is not a valid Word file.`);
      text = (await mammoth.extractRawText({ buffer: buf })).value;
    } else if (name.endsWith(".pptx")) {
      if (!isZip(buf)) throw new UserError(`${file.name} is not a valid PowerPoint file.`);
      const zip = await JSZip.loadAsync(buf);
      const slides = Object.keys(zip.files)
        .filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f))
        .sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]))
        .slice(0, MAX_SLIDES);
      const out = [];
      for (const [i, f] of slides.entries()) {
        const xml = (await zip.files[f].async("string")).slice(0, 500000);
        const texts = [...xml.matchAll(/<a:t>([^<]*)<\/a:t>/g)].map((m) => m[1]);
        out.push(`--- Slide ${i + 1} ---\n${texts.join("\n")}`);
        if (out.join("").length > MAX_TEXT) break;
      }
      text = out.join("\n\n");
    } else {
      if (buf.includes(0)) throw new UserError(`${file.name} is not a text file.`);
      text = buf.toString("utf8");
    }
  } catch (e) {
    if (e instanceof UserError) throw e;
    throw new UserError(`Could not read ${file.name.slice(0, 80)}. It may be damaged or password-protected.`);
  }
  return text.slice(0, MAX_TEXT);
}
