import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    kind: { type: String, enum: ["document", "writer", "slides", "sheet", "image"], default: "document" },
    data: { type: mongoose.Schema.Types.Mixed, select: false }, // slides / sheet JSON used for PPTX / XLSX export
    asset: { type: mongoose.Schema.Types.ObjectId, ref: "Asset" }, // generated image
    templateSlug: String,
    templateName: String,
    task: String, // what the user asked (e.g. "translate to Somali")
    language: { type: String, default: "English" },
    sourceFiles: [{ name: String, mime: String, size: Number }], // note: a field called "type" would be read by Mongoose as the schema type
    sourceText: { type: String, select: false },
    result: { type: String, default: "" }, // Markdown
    creditsUsed: { type: Number, default: 0 },
    status: { type: String, enum: ["done", "failed"], default: "done" },
  },
  { timestamps: true }
);

export default mongoose.models.Document || mongoose.model("Document", DocumentSchema);
