"use client";
import { openNav } from "./navState";
import { IconMenu } from "./Icons";

// Hamburger button shown on phones and small tablets; opens the sidebar drawer.
export default function NavToggle() {
  return <button className="icon-btn nav-toggle" onClick={openNav} aria-label="Open menu" aria-controls="sidebar"><IconMenu /></button>;
}
