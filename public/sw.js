// Minimal service worker so WriteAI can be installed as a desktop/mobile app.
// It does not cache anything, so users never see stale or someone else's data.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
