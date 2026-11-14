"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconMenu, IconClose } from "./Icons";

const LINKS = [["/#features", "Capabilities"], ["/#process", "Process"], ["/#languages", "Languages"], ["/#security", "Security"], ["/pricing", "Pricing"], ["/about", "About"], ["/contact", "Contact"]];

// Hamburger + dropdown for the public site on phones / small tablets.
export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const key = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [open]);
  return (
    <>
      <button className="icon-btn menu-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mnav" aria-label={open ? "Close menu" : "Open menu"}>{open ? <IconClose /> : <IconMenu />}</button>
      {open && (
        <nav className="mnav" id="mnav" aria-label="Main">
          {LINKS.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
          <Link href="/login" onClick={() => setOpen(false)}>Sign in</Link>
        </nav>
      )}
    </>
  );
}
