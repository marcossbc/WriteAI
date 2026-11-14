import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import MobileMenu from "./MobileMenu";

export function Logo() {
  return (
    <Link href="/" className="logo">
      <i>✎</i> WRITEAI<sup>™</sup>
    </Link>
  );
}

export function Nav() {
  return (
    <header className="nav">
      <div className="container">
        <Logo />
        <nav className="nav-links">
          <Link href="/#features">Capabilities</Link>
          <Link href="/#process">Process</Link>
          <Link href="/#languages">Languages</Link>
          <Link href="/#security">Security</Link>
          <Link href="/pricing">Pricing</Link>
        </nav>
        <div className="nav-cta">
          <ThemeToggle />
          <Link href="/login" className="muted signin">Sign in</Link>
          <Link href="/signup" className="btn primary sm">Start free</Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="cols">
          <div>
            <div className="logo" style={{ color: "var(--ink)" }}><i>✎</i> WRITEAI<sup>™</sup></div>
            <p style={{ marginTop: 12, maxWidth: 280 }}>Upload a document, pick a template, and get the result in the language you need.</p>
          </div>
          <div><h4>Product</h4><Link href="/features">Capabilities</Link><Link href="/pricing">Pricing</Link><Link href="/signup">Sign up</Link></div>
          <div><h4>Company</h4><Link href="/about">About</Link><Link href="/contact">Contact</Link></div>
          <div><h4>Legal</h4><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div>
        </div>
        <div className="copy"><span>© {new Date().getFullYear()} WriteAI. All rights reserved.</span><span>Built with Next.js, MongoDB and OpenAI</span></div>
      </div>
    </footer>
  );
}

export function InfoPage({ title, children }) {
  return (
    <div className="theme-purple">
      <Nav />
      <main className="doc-page">
        <h1>{title}</h1>
        {children}
      </main>
      <Footer />
    </div>
  );
}
