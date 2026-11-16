import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SAFE = ["GET", "HEAD", "OPTIONS"];
const MAX_BODY = 40 * 1024 * 1024;

export async function proxy(req) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api")) {
    if (!SAFE.includes(req.method)) {
      // CSRF defence in depth: browser requests must come from our own origin.
      const origin = req.headers.get("origin");
      const site = req.headers.get("sec-fetch-site");
      let bad = false;
      if (origin) { try { bad = new URL(origin).host !== req.headers.get("host"); } catch { bad = true; } }
      else if (site && !["same-origin", "none"].includes(site)) bad = true;
      if (bad) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      if (Number(req.headers.get("content-length") || 0) > MAX_BODY)
        return NextResponse.json({ error: "Request too large." }, { status: 413 });
    }
    return NextResponse.next();
  }

  const secret = process.env.JWT_SECRET;
  let valid = false;
  const token = req.cookies.get("token")?.value;
  if (token && (secret || process.env.NODE_ENV !== "production")) {
    try {
      await jwtVerify(token, new TextEncoder().encode(secret || "dev-only-secret-never-use-in-production"), { algorithms: ["HS256"] });
      valid = true;
    } catch {}
  }
  if (pathname.startsWith("/dashboard") && !valid) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if ((pathname === "/login" || pathname === "/signup") && valid) return NextResponse.redirect(new URL("/dashboard", req.url));
  return NextResponse.next();
}

export const config = { matcher: ["/api/:path*", "/dashboard/:path*", "/login", "/signup"] };
