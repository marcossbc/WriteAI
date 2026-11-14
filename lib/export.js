import PDFDocument from "pdfkit";
import { Document as Docx, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

const clean = (s) => s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/`/g, "");

export async function toPdf(title, md) {
  const doc = new PDFDocument({ margin: 56, size: "A4" });
  const chunks = [];
  doc.on("data", (c) => chunks.push(c));
  const done = new Promise((r) => doc.on("end", r));

  doc.font("Helvetica-Bold").fontSize(20).text(title).moveDown();
  for (const raw of md.split("\n")) {
    const line = raw.trimEnd();
    if (!line.trim()) { doc.moveDown(0.4); continue; }
    const h = line.match(/^(#{1,4})\s+(.*)/);
    if (h) doc.moveDown(0.3).font("Helvetica-Bold").fontSize([0, 17, 14, 12, 11][h[1].length]).text(clean(h[2])).moveDown(0.2);
    else if (/^\s*[-*]\s+/.test(line)) doc.font("Helvetica").fontSize(11).text("•  " + clean(line.replace(/^\s*[-*]\s+/, "")), { indent: 12 });
    else doc.font("Helvetica").fontSize(11).text(clean(line));
  }
  doc.end();
  await done;
  return Buffer.concat(chunks);
}

function runs(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((p) =>
    p.startsWith("**") ? new TextRun({ text: p.slice(2, -2), bold: true }) : new TextRun(p.replace(/`/g, ""))
  );
}

export async function toDocx(title, md) {
  const H = [null, HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3, HeadingLevel.HEADING_4];
  const children = [new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun(title)] })];
  for (const line of md.split("\n")) {
    if (!line.trim()) continue;
    const h = line.match(/^(#{1,4})\s+(.*)/);
    if (h) children.push(new Paragraph({ heading: H[h[1].length], children: runs(h[2]) }));
    else if (/^\s*[-*]\s+/.test(line)) children.push(new Paragraph({ bullet: { level: 0 }, children: runs(line.replace(/^\s*[-*]\s+/, "")) }));
    else children.push(new Paragraph({ spacing: { after: 120 }, children: runs(line) }));
  }
  return Packer.toBuffer(new Docx({ sections: [{ children }] }));
}

// ---------- PowerPoint (Slides Agent) ----------
import PptxGenJS from "pptxgenjs";
import ExcelJS from "exceljs";

export async function toPptx(deck) {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_16x9";
  pptx.title = deck.title;
  const bar = (s) => s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.22, h: 5.625, fill: { color: "FF6A1A" }, line: { color: "FF6A1A" } });

  const cover = pptx.addSlide(); cover.background = { color: "0B0806" }; bar(cover);
  cover.addText(deck.title, { x: 0.8, y: 1.8, w: 8.4, h: 1.5, fontSize: 36, bold: true, color: "FFFFFF", fontFace: "Calibri" });
  cover.addText("Created with WriteAI", { x: 0.8, y: 3.4, w: 8, h: 0.4, fontSize: 14, color: "FF8A3D" });

  for (const sl of deck.slides) {
    const s = pptx.addSlide(); s.background = { color: "FFFFFF" }; bar(s);
    s.addText(sl.title, { x: 0.7, y: 0.4, w: 8.8, h: 0.9, fontSize: 28, bold: true, color: "1D1510", fontFace: "Calibri" });
    s.addText(sl.bullets.map((b) => ({ text: b, options: { bullet: true, breakLine: true } })), { x: 0.7, y: 1.5, w: 8.8, h: 3.7, fontSize: 20, color: "333333", valign: "top", paraSpaceAfter: 8, fontFace: "Calibri" });
    if (sl.notes) s.addNotes(sl.notes);
  }
  return Buffer.from(await pptx.write({ outputType: "nodebuffer" }));
}

// ---------- Excel (AI Spreadsheets) ----------
export async function toXlsx(book) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "WriteAI";
  for (const sh of book.sheets) {
    const ws = wb.addWorksheet(sh.name.replace(/[\\/?*\[\]:]/g, "").slice(0, 31) || "Sheet");
    const head = ws.addRow(sh.columns);
    head.font = { bold: true, color: { argb: "FFFFFFFF" } };
    head.eachCell((c) => { c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9480F" } }; });
    sh.rows.forEach((r) => ws.addRow(r));
    sh.columns.forEach((c, i) => {
      const longest = Math.max(String(c).length, ...sh.rows.map((r) => String(r[i] ?? "").length));
      ws.getColumn(i + 1).width = Math.min(50, longest + 3);
    });
    ws.views = [{ state: "frozen", ySplit: 1 }];
  }
  return Buffer.from(await wb.xlsx.writeBuffer());
}
