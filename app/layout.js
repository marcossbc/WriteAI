import "./globals.css";
import PwaRegister from "@/components/PwaRegister";

export const metadata = {
  title: "WriteAI — Documents in, any language out",
  description: "Upload PDF, Word or PowerPoint files, pick a template, and get results in any language including Somali.",
};

export const viewport = {
  width: "device-width", initialScale: 1, viewportFit: "cover", // "cover" lets us use safe-area insets (notches, home bar)
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#fbf7f3" }, { media: "(prefers-color-scheme: dark)", color: "#0b0806" }],
};

// Runs before first paint so the page never flashes the wrong theme.
const themeScript = `(function(){var d=document.documentElement;try{var t=localStorage.getItem("theme");if(!t)t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";d.dataset.theme=t}catch(e){d.dataset.theme="dark"}d.classList.add("js")})()`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>{children}<PwaRegister /></body>
    </html>
  );
}
