import mongoose from "mongoose";

const TemplateSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, enum: ["Business", "Academic", "Creative", "Career"], required: true },
    description: String,
    icon: { type: String, default: "📄" },
    layout: { type: String, default: "report" }, // preview style: report | slides | quadrants | table | letter | resume | notes | columns | cards | script
    sections: [String],                          // section names shown in the preview
    order: { type: Number, default: 0 },
    systemPrompt: { type: String, required: true }, // the "template prompt" sent to OpenAI
    outputHint: { type: String, default: "Markdown" },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Template || mongoose.model("Template", TemplateSchema);
