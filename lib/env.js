const isProd = process.env.NODE_ENV === "production";

/** Secrets must never fall back to a default in production. */
export function jwtSecret() {
  const s = process.env.JWT_SECRET;
  if (isProd && (!s || s.length < 32)) throw new Error("JWT_SECRET must be set to 32+ random characters in production.");
  return new TextEncoder().encode(s || "dev-only-secret-never-use-in-production");
}

export const demoCheckoutAllowed = () => !isProd && process.env.DEMO_CHECKOUT === "true";
