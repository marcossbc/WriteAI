import { connectDB } from "@/lib/db";
import { handler, requireUser, readJson } from "@/lib/api";
import { audit } from "@/lib/audit";
import * as v from "@/lib/validate";
import Document from "@/models/Document";
import Asset from "@/models/Asset";

// Every query includes { user: user._id } so people can only ever touch their own documents (no IDOR).
export const GET = handler(async (_req, ctx) => {
  const params = await ctx.params;
  const user = await requireUser();
  await connectDB();
  const document = v.isId(params.id) && (await Document.findOne({ _id: params.id, user: user._id }).lean());
  if (!document) throw new v.UserError("Not found", 404);
  return Response.json({ document });
});

export const PATCH = handler(async (req, ctx) => {
  const params = await ctx.params;
  const user = await requireUser();
  const body = await readJson(req, 250000);
  const set = {};
  if (body.title !== undefined) set.title = v.str(body.title, { name: "Title", min: 1, max: 200 });
  if (body.result !== undefined) set.result = v.str(body.result, { name: "Content", max: 200000 });
  if (!Object.keys(set).length) throw new v.UserError("Nothing to update.");
  await connectDB();
  const ok = v.isId(params.id) && (await Document.findOneAndUpdate({ _id: params.id, user: user._id }, { $set: set }));
  if (!ok) throw new v.UserError("Not found", 404);
  return Response.json({ ok: true });
});

export const DELETE = handler(async (req, ctx) => {
  const params = await ctx.params;
  const user = await requireUser();
  await connectDB();
  const doc = v.isId(params.id) && (await Document.findOne({ _id: params.id, user: user._id }).select("asset"));
  if (!doc) throw new v.UserError("Not found", 404);
  if (doc.asset) await Asset.deleteOne({ _id: doc.asset, user: user._id });
  await Document.deleteOne({ _id: doc._id, user: user._id });
  await audit(req, "document.delete", user._id, { documentId: params.id });
  return Response.json({ ok: true });
});
