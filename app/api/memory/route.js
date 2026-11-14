import { connectDB } from "@/lib/db";
import { handler, requireUser, readJson } from "@/lib/api";
import { rateLimit } from "@/lib/ratelimit";
import { MAX_MEMORIES } from "@/lib/memory";
import * as v from "@/lib/validate";
import Memory from "@/models/Memory";

export const GET = handler(async () => {
  const user = await requireUser();
  await connectDB();
  const memories = await Memory.find({ user: user._id }).sort({ createdAt: -1 }).limit(MAX_MEMORIES).lean();
  return Response.json({ memories });
});

export const POST = handler(async (req) => {
  const user = await requireUser();
  rateLimit(req, "memory", 30, 60_000, String(user._id));
  const body = await readJson(req, 1000);
  const text = v.str(body.text, { name: "Memory", min: 2, max: 300 });
  await connectDB();
  if ((await Memory.countDocuments({ user: user._id })) >= MAX_MEMORIES) throw new v.UserError(`You can keep up to ${MAX_MEMORIES} memories. Delete one first.`);
  const memory = await Memory.create({ user: user._id, text });
  return Response.json({ memory });
});
