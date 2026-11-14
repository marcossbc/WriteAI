import Stripe from "stripe";

let client;
export const stripeEnabled = () => !!process.env.STRIPE_SECRET_KEY;
export const stripe = () => (client ||= new Stripe(process.env.STRIPE_SECRET_KEY));

/** Public base URL used for Stripe redirects. In production it MUST come from env (never from request headers). */
export function appUrl(req) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  if (process.env.NODE_ENV === "production") throw new Error("APP_URL must be set in production");
  return new URL(req.url).origin;
}
