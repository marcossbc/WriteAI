import { connectDB } from "@/lib/db";
import { handler, requireUser } from "@/lib/api";
import { dailyCheckin } from "@/lib/plans";
import Transaction from "@/models/Transaction";

export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  const user = await requireUser();
  await connectDB();
  const tx = await Transaction.find({ user: user._id }).sort({ createdAt: -1 }).limit(50).select("label credits createdAt").lean();
  const today = new Date().toISOString().slice(0, 10);
  const amount = dailyCheckin();
  return Response.json({
    credits: user.credits, dailyAmount: amount, canCheckin: amount > 0 && user.lastCheckinDay !== today,
    history: tx.map((t) => ({ id: String(t._id), at: t.createdAt, change: t.credits, label: t.label })),
  });
});
