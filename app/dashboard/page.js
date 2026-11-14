import NewProject from "@/components/NewProject";
import { connectDB } from "@/lib/db";
import { ensureTemplates } from "@/lib/templates-seed";
import Template from "@/models/Template";

export const metadata = { title: "New project — WriteAI" };

export default async function Page() {
  // Templates are loaded on the server so they are on screen the moment the dashboard opens.
  await connectDB();
  await ensureTemplates();
  const rows = await Template.find({ isActive: true }).select("-systemPrompt").sort({ order: 1 }).lean();
  const templates = rows.map((t) => ({ slug: t.slug, name: t.name, category: t.category, description: t.description, icon: t.icon, layout: t.layout, sections: t.sections, featured: t.featured }));
  return <NewProject initialTemplates={templates} />;
}
