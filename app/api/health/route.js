import { handler } from "@/lib/api";
import { rateLimit } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

// Intentionally reveals nothing about environment, URLs or versions.
export const GET = handler(async (req) => {
  rateLimit(req, "health", 60, 60_000);
  return Response.json({ status: "ok", time: new Date().toISOString() });
});
