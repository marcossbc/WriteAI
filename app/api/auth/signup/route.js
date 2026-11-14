import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { setSession, publicUser } from "@/lib/auth";
import { handler, readJson } from "@/lib/api";
import { rateLimit } from "@/lib/ratelimit";
import { audit } from "@/lib/audit";
import * as v from "@/lib/validate";
import User from "@/models/User";
import Transaction from "@/models/Transaction";

export const POST = handler(async (req) => {
  rateLimit(req, "signup", 5, 60 * 60_000);
  const body = await readJson(req);
  const name = v.str(body.name, { name: "Name", min: 2, max: 80 });
  const email = v.email(body.email);
  const pass = v.password(body.password);

  await connectDB();
  if (await User.exists({ email })) throw new v.UserError("This email already has an account. Sign in instead.", 409);

  const user = await User.create({ name, email, password: await bcrypt.hash(pass, 12) }); // starter credits come from the schema default
  await Transaction.create({ user: user._id, label: "Welcome bonus", credits: user.credits, amountUsd: 0, provider: "bonus" });
  await setSession(user._id);
  await audit(req, "auth.signup", user._id);
  return Response.json({ user: publicUser(user) });
});
