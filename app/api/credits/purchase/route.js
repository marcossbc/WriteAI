import { connectDB } from "@/lib/db";
import { PLANS, PACKS } from "@/lib/plans";
import { demoCheckoutAllowed } from "@/lib/env";
import { stripe, stripeEnabled, appUrl } from "@/lib/stripe";
import { handler, requireUser, readJson } from "@/lib/api";
import { rateLimit } from "@/lib/ratelimit";
import { audit } from "@/lib/audit";
import * as v from "@/lib/validate";
import User from "@/models/User";
import Transaction from "@/models/Transaction";

/**
 * Real payments: Stripe Checkout (credits are granted ONLY by the signed webhook, never by this route).
 * Without STRIPE_SECRET_KEY, the demo checkout works outside production only.
 */
export const POST = handler(async (req) => {
  const user = await requireUser();
  rateLimit(req, "purchase", 10, 60_000, String(user._id));
  const body = await readJson(req, 500);
  const item = [...PLANS, ...PACKS].find((p) => p.id === v.str(body.id, { name: "Product", min: 1, max: 40 }));
  if (!item) throw new v.UserError("Unknown product.");

  await connectDB();
  if (item.id === "trial" && (await Transaction.exists({ user: user._id, itemId: "trial" })))
    throw new v.UserError("The trial is for new users only and has already been used.", 409);

  if (stripeEnabled()) {
    const base = appUrl(req);
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      client_reference_id: String(user._id),
      customer_email: user.email,
      line_items: [{ quantity: 1, price_data: { currency: "usd", unit_amount: Math.round(item.price * 100), product_data: { name: `WriteAI ${item.name} — ${item.credits} credits` } } }],
      metadata: { userId: String(user._id), itemId: item.id },
      success_url: `${base}/dashboard/credits?added=1`,
      cancel_url: `${base}/pricing`,
    });
    await audit(req, "checkout.created", user._id, { item: item.id, session: session.id });
    return Response.json({ url: session.url });
  }

  if (!demoCheckoutAllowed()) throw new v.UserError("Payments are not connected yet.", 501);
  const updated = await User.findByIdAndUpdate(user._id, { $inc: { credits: item.credits }, ...(item.plan ? { plan: item.plan } : {}) }, { new: true });
  await Transaction.create({ user: user._id, label: `${item.name} — ${item.credits} credits`, credits: item.credits, amountUsd: item.price, provider: "demo", itemId: item.id });
  await audit(req, "credits.purchase_demo", user._id, { item: item.id });
  return Response.json({ credits: updated.credits });
});
