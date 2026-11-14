import { connectDB } from "./db";
import AuditLog from "@/models/AuditLog";
import { clientIp } from "./ratelimit";

/** Structured JSON line for your log platform. Never pass passwords, tokens or document text here. */
export function log(level, event, data = {}) {
  console[level === "error" ? "error" : "log"](JSON.stringify({ ts: new Date().toISOString(), level, event, ...data }));
}

/** Security-relevant event -> database + log. Never blocks or breaks the request. */
export async function audit(req, action, userId, meta = {}) {
  const ip = req ? clientIp(req) : undefined;
  log("info", action, { userId: userId ? String(userId) : undefined, ip, ...meta });
  try {
    await connectDB();
    await AuditLog.create({ user: userId, action, ip, userAgent: req?.headers.get("user-agent")?.slice(0, 200), meta });
  } catch {}
}
