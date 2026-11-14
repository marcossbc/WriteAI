import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { setSession, publicUser } from "@/lib/auth";
import { handler, readJson } from "@/lib/api";
import { rateLimit } from "@/lib/ratelimit";
import { audit } from "@/lib/audit";
import * as v from "@/lib/validate";
import User from "@/models/User";

const MAX_FAILS = 5;
const LOCK_MS = 15 * 60_000;
const DUMMY = bcrypt.hashSync("not-a-real-password", 12); // compared when the user doesn't exist, so timing doesn't reveal valid emails

export const POST = handler(async (req) => {
  rateLimit(req, "login-ip", 15, 15 * 60_000);
  const body = await readJson(req);
  const email = v.email(body.email);
  if (typeof body.password !== "string" || body.password.length > 200) throw new v.UserError("Email or password is incorrect.", 401);
  rateLimit(req, "login-email", 8, 15 * 60_000, email);

  await connectDB();
  const user = await User.findOne({ email }).select("+password");

  if (user?.lockUntil && user.lockUntil > new Date()) {
    await audit(req, "auth.login_locked", user._id);
    throw new v.UserError("Too many failed attempts. Try again in 15 minutes.", 429, "LOCKED");
  }

  const ok = await bcrypt.compare(body.password, user?.password || DUMMY);
  if (!user || !ok) {
    if (user) {
      const fails = (user.failedLogins || 0) + 1;
      await User.updateOne({ _id: user._id }, fails >= MAX_FAILS ? { failedLogins: 0, lockUntil: new Date(Date.now() + LOCK_MS) } : { failedLogins: fails });
      await audit(req, fails >= MAX_FAILS ? "auth.account_locked" : "auth.login_failed", user._id);
    } else {
      await audit(req, "auth.login_failed", null, { reason: "unknown_email" });
    }
    throw new v.UserError("Email or password is incorrect.", 401); // same message for both cases
  }

  await User.updateOne({ _id: user._id }, { failedLogins: 0, $unset: { lockUntil: 1 } });
  await setSession(user._id);
  await audit(req, "auth.login", user._id);
  return Response.json({ user: publicUser(user) });
});
