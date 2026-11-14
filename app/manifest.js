export default function manifest() {
  return {
    name: "WriteAI", short_name: "WriteAI", description: "Documents in, any language out.",
    start_url: "/dashboard", display: "standalone", background_color: "#0b0806", theme_color: "#ff6a1a",
    icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" }, { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" }],
  };
}
