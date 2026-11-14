import { connectDB } from "@/lib/db";
import { handler, requireUser } from "@/lib/api";
import * as v from "@/lib/validate";
import Memory from "@/models/Memory";

export const DELETE = handler(async (_req, ctx) => {
  const { id } = await ctx.params;
  const user = await requireUser();
  await connectDB();
  const res = v.isId(id) && (await Memory.deleteOne({ _id: id, user: user._id }));
  if (!res?.deletedCount) throw new v.UserError("Not found", 404);
  return Response.json({ ok: true });
});
