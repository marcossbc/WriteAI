import { clearSession, getUser } from "@/lib/auth";
import { handler } from "@/lib/api";
import { audit } from "@/lib/audit";

export const POST = handler(async (req) => {
  const user = await getUser();
  await clearSession();
  if (user) await audit(req, "auth.logout", user._id);
  return Response.json({ ok: true });
});
