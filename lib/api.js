import { getUser } from "./auth";
import { UserError } from "./validate";
import { rateLimit } from "./ratelimit";
import { log } from "./audit";

/** Wraps every API route: global per-IP rate limit, safe error responses (no stack traces or internals leak to clients). */
export const handler = (fn) => async (req, ctx) => {
  try {
    rateLimit(req, "api", 300, 60_000);
    return await fn(req, ctx);
  } catch (e) {
    if (e instanceof UserError) {
      return Response.json(
        { error: e.message, ...(e.code ? { code: e.code } : {}) },
        { status: e.status, headers: e.retryAfter ? { "Retry-After": String(e.retryAfter) } : {} }
      );
    }
    log("error", "unhandled_error", { path: new URL(req.url).pathname, message: e?.message });
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
};

export async function requireUser() {
  const u = await getUser();
  if (!u) throw new UserError("Please sign in.", 401);
  return u;
}

export async function readJson(req, max = 20000) {
  const text = await req.text();
  if (text.length > max) throw new UserError("Request too large.", 413);
  try { const v = JSON.parse(text); if (v && typeof v === "object") return v; } catch {}
  throw new UserError("Invalid request.");
}
