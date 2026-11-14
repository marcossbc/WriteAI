import { connectDB } from "@/lib/db";
import { ensureTemplates } from "@/lib/templates-seed";
import { handler, requireUser } from "@/lib/api";
import Template from "@/models/Template";

export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  await requireUser();
  await connectDB();
  await ensureTemplates();
  // systemPrompt is excluded: prompts stay server-side
  const templates = await Template.find({ isActive: true }).select("-systemPrompt").sort({ order: 1 }).lean();
  return Response.json({ templates });
});
