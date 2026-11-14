// Sliding-window limiter, in memory. Fine for one server; for several instances swap the Map for Redis (Upstash).
import { UserError } from "./validate";

const hits = global._rl || (global._rl = new Map());
let lastSweep = Date.now();

export function clientIp(req) {
  // Only trust x-forwarded-for when you run behind your own proxy / host (Vercel, Nginx, Cloudflare).
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

export function rateLimit(req, name, max, windowMs, who) {
  const key = `${name}:${who || clientIp(req)}`;
  const now = Date.now();
  if (now - lastSweep > 60000) { // drop old entries so memory can't grow forever
    for (const [k, v] of hits) if (!v.length || now - v[v.length - 1] > 3600000) hits.delete(k);
    lastSweep = now;
  }
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    hits.set(key, arr);
    const e = new UserError("Too many requests. Please wait a moment and try again.", 429, "RATE_LIMITED");
    e.retryAfter = Math.ceil((windowMs - (now - arr[0])) / 1000);
    throw e;
  }
  arr.push(now);
  hits.set(key, arr);
}
