import Link from "next/link";
import { getUser } from "@/lib/auth";
import ThemeToggle from "@/components/ThemeToggle";
import PricingCards from "@/components/PricingCards";
import { COSTS } from "@/lib/plans";

export const metadata = { title: "Pricing — WriteAI" };
export const dynamic = "force-dynamic";

export default async function Pricing() {
  const user = await getUser();
  return (
    <div className="theme-orange">
      <div className="nav"><div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <Link href="/" className="logo"><i>✎</i> WRITEAI</Link>
        <div className="nav-cta"><ThemeToggle /><Link href={user ? "/dashboard" : "/login"} className="btn sm">{user ? "Back to dashboard" : "Sign in"}</Link></div>
      </div></div>
      <div className="price-wrap">
        <h1 className="serif">Upgrade to Pro</h1>
        <p className="muted" style={{ textAlign: "center", marginTop: 8 }}>
          Pay once and use your credits whenever you like. A document costs {COSTS.process} credits, a chat message {COSTS.chat}.
        </p>
        <PricingCards loggedIn={!!user} />
      </div>
    </div>
  );
}
