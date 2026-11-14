import Link from "next/link";
import { getUser } from "@/lib/auth";
import Transaction from "@/models/Transaction";
import PricingCards from "@/components/PricingCards";
import { COSTS } from "@/lib/plans";

export const metadata = { title: "Credits — WriteAI" };

export default async function Page(props) {
  const searchParams = await props.searchParams;
  const user = await getUser();
  const tx = await Transaction.find({ user: user._id }).sort({ createdAt: -1 }).limit(10).lean();
  return (
    <>
      <h1 className="page-title serif">Credits</h1>
      {searchParams.need && <div className="error" role="alert" style={{ marginTop: 10 }}>You are out of credits for this action. Buy more below to continue.</div>}
      {searchParams.added && <div className="balance ok">✅ Credits added to your account.</div>}
      <div className="balance">
        <div><div className="muted">Your balance</div><b>💎 {user.credits}</b></div>
        <div className="muted" style={{ fontSize: 14 }}>A document costs {COSTS.process} credits · a chat message {COSTS.chat}<br /><Link href="/pricing" style={{ color: "var(--brand)" }}>Compare Pro plans →</Link></div>
      </div>
      <PricingCards loggedIn />
      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 40 }}>Recent activity</h2>
      <div className="list">
        {tx.map((t) => (
          <div className="row-item" key={String(t._id)}><span>{t.label}</span><b style={{ color: "var(--brand)" }}>+{t.credits}</b></div>
        ))}
      </div>
    </>
  );
}
