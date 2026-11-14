import { connectDB } from "@/lib/db";
import { handler, requireUser } from "@/lib/api";
import * as v from "@/lib/validate";
import Asset from "@/models/Asset";

export const runtime = "nodejs";

// Images are private: only the owner can load them.
export const GET = handler(async (_req, ctx) => {
  const { id } = await ctx.params;
  const user = await requireUser();
  await connectDB();
  const a = v.isId(id) && (await Asset.findOne({ _id: id, user: user._id }).select("+data mime"));
  if (!a) throw new v.UserError("Not found", 404);
  return new Response(a.data, { headers: { "Content-Type": a.mime, "X-Content-Type-Options": "nosniff", "Cache-Control": "private, max-age=3600" } });
});
