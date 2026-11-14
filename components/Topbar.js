import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import NavToggle from "./NavToggle";
import { CreditsButton } from "./CreditsModal";

export default function Topbar({ user }) {
  return (
    <div className="top">
      <NavToggle />
      <span className="top-gap" />
      <ThemeToggle />
      {user.plan === "free" && (
        <Link href="/pricing" className="upgrade"><span className="up-txt">Get more credits from $2.99</span> <b>Upgrade</b></Link>
      )}
      <CreditsButton credits={user.credits} />
    </div>
  );
}
