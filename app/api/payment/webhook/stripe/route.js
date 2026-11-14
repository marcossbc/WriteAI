import { connectDB } from "@/lib/db";
import { PLANS, PACKS } from "@/lib/plans";
import { stripe, stripeEnabled } from "@/lib/stripe";
import { audit, log } from "@/lib/audit";
import { isId } from "@/lib/validate";
import User from "@/models/User";
import Transaction from "@/models/Transaction";

export const runtime = "nodejs";

// Stripe calls this route server-to-server. It needs the RAW body to verify the signature, so we never parse JSON first.
export async function POST(req) {
  if (!stripeEnabled() || !process.env.STRIPE_WEBHOOK_SECRET) return Response.json({ error: "Not configured" }, { status: 501 });

  const signature = req.headers.get("stripe-signature");
  const raw = await req.text();
  let event;
  try {
    event = stripe().webhooks.constructEvent(raw, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    log("info", "stripe.bad_signature");
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type)) {
      const s = event.data.object;
      if (s.payment_status === "paid") await fulfil(req, s);
    }
    return Response.json({ received: true });
  } catch (e) {
    log("error", "stripe.fulfil_failed", { session: event.data?.object?.id, message: e.message });
    return Response.json({ error: "Fulfilment failed" }, { status: 500 }); // Stripe retries automatically
  }
}

async function fulfil(req, s) {
  const item = [...PLANS, ...PACKS].find((p) => p.id === s.metadata?.itemId);
  const userId = s.metadata?.userId;
  // Credits come from OUR price list, and the amount actually paid must match it.
  if (!item || !isId(userId) || s.currency !== "usd" || s.amount_total !== Math.round(item.price * 100)) {
    log("error", "stripe.mismatch", { session: s.id });
    return;
  }
  await connectDB();
  try {
    await Transaction.create({ user: userId, label: `${item.name} — ${item.credits} credits`, credits: item.credits, amountUsd: item.price, provider: "stripe", providerRef: s.id, itemId: item.id });
  } catch (e) {
    if (e.code === 11000) return; // already processed (webhook retry) -> don't add credits twice
    throw e;
  }
  try {
    await User.updateOne({ _id: userId }, { $inc: { credits: item.credits }, ...(item.plan ? { plan: item.plan } : {}) });
  } catch (e) {
    await Transaction.deleteOne({ providerRef: s.id }); // let the retry try again
    throw e;
  }
  await audit(req, "credits.purchase_stripe", userId, { item: item.id, session: s.id });
}
