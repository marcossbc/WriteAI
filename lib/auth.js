import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { connectDB } from "./db";
import { jwtSecret } from "./env";
import User from "@/models/User";

export async function setSession(userId) {
  const token = await new SignJWT({ uid: String(userId) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(jwtSecret());
  (await cookies()).set("token", token, {
    httpOnly: true,                                   // not readable by JavaScript (XSS can't steal it)
    sameSite: "lax",                                  // blocks cross-site POSTs (CSRF)
    secure: process.env.NODE_ENV === "production",    // HTTPS only in production
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  (await cookies()).delete("token");
}

export async function getUser() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, jwtSecret(), { algorithms: ["HS256"] });
    await connectDB();
    return await User.findById(payload.uid);
  } catch {
    return null;
  }
}

export const publicUser = (u) => ({ id: String(u._id), name: u.name, email: u.email, credits: u.credits, plan: u.plan, role: u.role });
