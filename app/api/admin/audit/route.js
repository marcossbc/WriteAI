import { connectDB } from "@/lib/db";
import { handler, requireUser } from "@/lib/api";
import { UserError } from "@/lib/validate";
import AuditLog from "@/models/AuditLog";

// Admin-only (role check on the server). Make someone admin in mongosh:
// db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
export const GET = handler(async (req) => {
  const user = await requireUser();
  if (user.role !== "admin") throw new UserError("Forbidden", 403);
  await connectDB();
  const action = new URL(req.url).searchParams.get("action");
  const q = action && /^[a-z._]{1,40}$/.test(action) ? { action } : {};
  const logs = await AuditLog.find(q).sort({ createdAt: -1 }).limit(200).lean();
  return Response.json({ logs });
});
