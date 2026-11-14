import { connectDB } from "@/lib/db";
import { charge, refund, noCredits } from "@/lib/credits";
import { COSTS, MODE_LABEL } from "@/lib/plans";
import { extractText } from "@/lib/extract";
import { runTemplate, runRequest, runWriter, makeSlides, makeSheet, makeImage, ASK } from "@/lib/openai";
import { memoryPrompt } from "@/lib/memory";
import { ensureTemplates } from "@/lib/templates-seed";
import { handler, requireUser } from "@/lib/api";
import { rateLimit } from "@/lib/ratelimit";
import { audit, log } from "@/lib/audit";
import * as v from "@/lib/validate";
import Template from "@/models/Template";
import Document from "@/models/Document";
import Chat from "@/models/Chat";
import Asset from "@/models/Asset";
import Transaction from "@/models/Transaction";

export const runtime = "nodejs";
export const maxDuration = 180;

const deckToMd = (d) => `# ${d.title}\n\n` + d.slides.map((s, i) => `## ${i + 1}. ${s.title}\n${s.bullets.map((b) => `- ${b}`).join("\n")}`).join("\n\n");
const sheetToMd = (b) => b.sheets.map((sh) => {
  const rows = sh.rows.slice(0, 15);
  const line = (r) => `| ${r.map((c) => String(c).replace(/\|/g, "/")).join(" | ")} |`;
  return `### ${sh.name}\n\n${line(sh.columns)}\n${line(sh.columns.map(() => "---"))}\n${rows.map(line).join("\n")}${sh.rows.length > 15 ? `\n\n_Showing 15 of ${sh.rows.length} rows. Download the Excel file for everything._` : ""}`;
}).join("\n\n");

/**
 * One endpoint for every composer mode: docs (templates) | writer | slides | sheets | image.
 * It saves the Document (the output) AND a Chat (what the user typed + the answer) in MongoDB.
 */
export const POST = handler(async (req) => {
  const user = await requireUser();
  rateLimit(req, "project", 8, 60_000, String(user._id));

  const form = await req.formData();
  const mode = v.oneOf(form.get("mode") || "docs", v.MODES, "Mode");
  const task = v.str(form.get("task") || "", { name: "Task", max: mode === "image" ? 1000 : 4000, required: false });
  const language = v.language(form.get("language"));
  const files = form.getAll("files").filter((f) => f && typeof f !== "string" && f.size); // documents, or reference images for AI Image
  if (mode === "image") v.checkRefs(files); else v.checkFiles(files);
  const imageModel = mode === "image" ? v.oneOf(form.get("model") || process.env.OPENAI_IMAGE_MODEL || "gpt-image-1", v.IMAGE_MODELS, "Model") : null;
  if (mode === "image" ? !task : !files.length && !task) throw new v.UserError(mode === "image" ? "Describe the image you want." : "Upload a file or describe what you need.");
  // Bare filler words ("create", "help", "hi") are not a request. A real one-word topic like "Budget" is fine.
  const VAGUE = /^(create|make|generate|build|write|draw|help|hi|hello|hey|test|start|new|do|go|please|ok|yes|no)\W*$/i;
  if (["slides", "sheets", "image"].includes(mode) && !files.length && (task.length < 3 || VAGUE.test(task)))
    throw new v.UserError({ slides: "Tell me a little more: what should the presentation be about?", sheets: "Tell me a little more: what should the spreadsheet track?", image: "Describe the image you want to create." }[mode]);
  const count = Math.min(15, Math.max(3, parseInt(form.get("count") || "8", 10) || 8));
  const shape = v.oneOf(form.get("shape") || "square", v.SHAPES, "Shape");

  await connectDB();
  let template = null;
  if (mode === "docs") {
    await ensureTemplates();
    template = await Template.findOne({ slug: v.slug(form.get("template")), isActive: true });
    if (!template) throw new v.UserError("Choose a template first.");
  }

  const cost = COSTS[mode];
  if (!(await charge(user._id, cost))) throw noCredits(); // atomic deduction before any paid AI call

  try {
    const memory = await memoryPrompt(user._id);
    let text = "";
    const refs = [];
    if (mode === "image") {
      for (const f of files) {
        const buffer = Buffer.from(await f.arrayBuffer());
        const mime = v.imageMime(buffer);
        if (!mime) throw new v.UserError("A reference image is not a valid PNG, JPG or WebP file.");
        refs.push({ buffer, mime });
      }
    } else {
      for (const f of files) text += `\n\n=== ${f.name.slice(0, 120)} ===\n` + (await extractText(f));
    }
    const ctx = { task, text, language, userId: String(user._id), memory }; // text is ONLY the attached files; the typed message is the request

    let kind = "document", result = "", data, asset, title = "";
    if (mode === "docs") { result = text ? await runTemplate({ template, ...ctx }) : await runRequest({ template, ...ctx }); title = template.name; }
    else if (mode === "writer") { result = await runWriter(ctx); kind = "writer"; title = "Writing"; }
    else if (mode === "slides") { data = await makeSlides({ ...ctx, count }); result = deckToMd(data); kind = "slides"; title = data.title; }
    else if (mode === "sheets") { data = await makeSheet(ctx); result = sheetToMd(data); kind = "sheet"; title = data.title; }
    else {
      const png = await makeImage({ prompt: task, shape, userId: ctx.userId, model: imageModel, refs });
      asset = await Asset.create({ user: user._id, mime: "image/png", size: png.length, data: png });
      result = `Image generated from: "${task}"`; kind = "image"; title = task.slice(0, 60);
    }
    if (!result) throw new Error("empty result");

    // The request was too vague ("create"): the AI asks what the user means. Nothing is generated, so nothing is charged.
    if (result.trimStart().startsWith(ASK)) {
      await refund(user._id, cost);
      const question = result.replace(ASK, "").trim();
      const chat = await Chat.create({ user: user._id, kind: "chat", title: ((t) => (t.length > 60 ? t.slice(0, 57) + "…" : t))(task), messages: [{ role: "user", content: task }, { role: "assistant", content: question }] });
      await audit(req, "project.clarify", user._id, { mode, chatId: String(chat._id) });
      return Response.json({ chatId: String(chat._id), docId: null, clarify: true });
    }

    const base = files[0]?.name?.replace(/\.[^.]+$/, "").slice(0, 60);
    const doc = await Document.create({
      user: user._id, kind, title: mode === "docs" ? `${base || task.slice(0, 50) || "Untitled"} — ${title}` : title,
      templateSlug: template?.slug, templateName: template?.name || { writer: "General Writer", slides: "Slides Agent", sheets: "AI Spreadsheets", image: "AI Image" }[mode],
      task, language, result, data, asset: asset?._id, creditsUsed: cost, sourceText: text.slice(0, 200000),
      sourceFiles: files.map((f) => ({ name: f.name.slice(0, 120), mime: String(f.type).slice(0, 100), size: f.size })),
    });

    // The conversation that appears in Chat History / Recent
    const typed = task || `Process ${files.map((f) => f.name).join(", ")}`;
    const chat = await Chat.create({
      user: user._id, kind: mode, document: doc._id, title: ((t) => (t.length > 60 ? t.slice(0, 57) + "…" : t))(task || doc.title),
      messages: [
        { role: "user", content: files.length ? `${typed}\n\n📎 ${files.map((f) => f.name).join(", ")}` : typed },
        { role: "assistant", content: result, docId: doc._id },
      ],
    });
    await Transaction.create({ user: user._id, label: `${MODE_LABEL[mode]}${task ? ": " + task.slice(0, 40) : ""}`, credits: -cost, amountUsd: 0, provider: "usage" });
    await audit(req, "project.create", user._id, { mode, documentId: String(doc._id), chatId: String(chat._id) });
    return Response.json({ chatId: String(chat._id), docId: String(doc._id) });
  } catch (e) {
    await refund(user._id, cost);
    if (e instanceof v.UserError) throw new v.UserError(`${e.message} Your credits were returned.`, e.status);
    log("error", "project_failed", { userId: String(user._id), mode, message: e.message, status: e.status });
    if (e.userMessage) throw new v.UserError(`${e.userMessage} Your credits were returned.`);
    const refused = e.status === 400 && mode === "image";
    throw new v.UserError(refused ? "The image request was refused. Try a different description. Your credits were returned." : "Something went wrong. Your credits were returned.", 500);
  }
});
