import Memory from "@/models/Memory";

export const MAX_MEMORIES = 30;

/** Memory text injected into AI prompts (empty string when the user has none). */
export async function memoryPrompt(userId) {
  const items = await Memory.find({ user: userId }).sort({ createdAt: 1 }).limit(MAX_MEMORIES).select("text").lean();
  return items.length ? items.map((m) => `- ${m.text}`).join("\n") : "";
}
