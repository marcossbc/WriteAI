import { connectDB } from "@/lib/db";
import { toPdf, toDocx, toPptx, toXlsx } from "@/lib/export";
import { handler, requireUser } from "@/lib/api";
import { rateLimit } from "@/lib/ratelimit";
import { audit } from "@/lib/audit";
import * as v from "@/lib/validate";
import Document from "@/models/Document";
import Asset from "@/models/Asset";

export const runtime = "nodejs";

const FORMATS = { document: ["pdf", "docx", "md"], writer: ["pdf", "docx", "md"], slides: ["pptx", "pdf", "md"], sheet: ["xlsx", "md"], image: ["png"] };
const TYPES = {
  pdf: "application/pdf", md: "text/markdown; charset=utf-8", png: "image/png",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

export const GET = handler(async (req, ctx) => {
  const { id } = await ctx.params;
  const user = await requireUser();
  rateLimit(req, "export", 20, 60_000, String(user._id));
  const format = new URL(req.url).searchParams.get("format") || "pdf";
  await connectDB();
  const doc = v.isId(id) && (await Document.findOne({ _id: id, user: user._id }).select("+data"));
  if (!doc) throw new v.UserError("Not found", 404);
  if (!(FORMATS[doc.kind] || []).includes(format)) throw new v.UserError("This format is not available for this item.");

  const base = doc.title.replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "_").slice(0, 80) || "document";
  const send = (buf) => new Response(buf, { headers: { "Content-Type": TYPES[format], "Content-Disposition": `attachment; filename="${base}.${format}"`, "X-Content-Type-Options": "nosniff", "Cache-Control": "private, no-store" } });
  await audit(req, "document.export", user._id, { documentId: String(doc._id), format });

  if (format === "md") return send(doc.result);
  if (format === "docx") return send(await toDocx(doc.title, doc.result));
  if (format === "pdf") return send(await toPdf(doc.title, doc.result));
  if (format === "pptx") return send(await toPptx(doc.data));
  if (format === "xlsx") return send(await toXlsx(doc.data));
  const asset = await Asset.findOne({ _id: doc.asset, user: user._id }).select("+data");
  if (!asset) throw new v.UserError("Not found", 404);
  return send(asset.data);
});
