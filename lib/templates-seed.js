import Template from "@/models/Template";
import { TEMPLATES } from "./templates-data";

// Adds missing templates and refreshes the display fields of existing ones (name, sections, preview layout...).
// systemPrompt is only written on insert, so prompts you edit in the database are never overwritten.
export async function ensureTemplates() {
  const upToDate = await Template.countDocuments({ order: { $gte: 0 }, "sections.0": { $exists: true } });
  if (upToDate >= TEMPLATES.length) return;
  await Template.bulkWrite(
    TEMPLATES.map(({ systemPrompt, ...display }) => ({
      updateOne: { filter: { slug: display.slug }, update: { $set: display, $setOnInsert: { systemPrompt, isActive: true } }, upsert: true },
    }))
  );
}
