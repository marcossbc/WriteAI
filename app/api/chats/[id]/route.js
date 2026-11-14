import { connectDB } from "@/lib/db";
import { handler, requireUser } from "@/lib/api";
import { audit } from "@/lib/audit";
import * as v from "@/lib/validate";
import Chat from "@/models/Chat";

// Deletes the conversation only; the generated document stays in My Documents.
export const DELETE = handler(async (req, ctx) => {
  const { id } = await ctx.params;
  const user = await requireUser();
  await connectDB();
  const res = v.isId(id) && (await Chat.deleteOne({ _id: id, user: user._id }));
  if (!res?.deletedCount) throw new v.UserError("Not found", 404);
  await audit(req, "chat.delete", user._id, { chatId: id });
  return Response.json({ ok: true });
});
