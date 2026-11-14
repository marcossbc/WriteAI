import { connectDB } from "@/lib/db";
import { handler, requireUser } from "@/lib/api";
import { rateLimit } from "@/lib/ratelimit";
import { audit } from "@/lib/audit";
import { dailyCheckin } from "@/lib/plans";
import { UserError } from "@/lib/validate";
import User from "@/models/User";
import Transaction from "@/models/Transaction";

// One free check-in per UTC day. The "lastCheckinDay != today" filter makes the claim atomic (no double-claim by racing requests).
export const POST = handler(async (req) => {
  const user = await requireUser();
  rateLimit(req, "checkin", 10, 60_000, String(user._id));
  const amount = dailyCheckin();
  if (!amount) throw new UserError("Daily check-in is not available.", 404);
  await connectDB();
  const today = new Date().toISOString().slice(0, 10);
  const updated = await User.findOneAndUpdate({ _id: user._id, lastCheckinDay: { $ne: today } }, { $inc: { credits: amount }, $set: { lastCheckinDay: today } }, { new: true });
  if (!updated) throw new UserError("You already checked in today. Come back tomorrow.", 409);
  await Transaction.create({ user: user._id, label: "Daily check-in", credits: amount, amountUsd: 0, provider: "bonus" });
  await audit(req, "credits.checkin", user._id, { amount });
  return Response.json({ credits: updated.credits, added: amount });
});
