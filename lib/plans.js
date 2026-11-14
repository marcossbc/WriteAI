// Shared by the pricing UI and the purchase API.
export const COSTS = { process: 20, chat: 2, docs: 20, writer: 5, slides: 25, sheets: 15, image: 30 };

// All purchases are one-time payments (no auto-renewal). Annual = 12 months of credits (2,000 a month) granted up front.
export const PLANS = [
  { id: "monthly", name: "Monthly", price: 19.99, per: "", credits: 1500, note: "One-time payment. About $1.33 per 100 credits. No auto-renewal.", plan: "pro" },
  { id: "annual", name: "Annual", price: 94.88, per: "", sub: "≈ $7.90 / month", credits: 24000, badge: "60% OFF", note: "One-time payment for 12 months of credits (2,000 a month). Was $239.88. About $0.40 per 100 credits.", plan: "pro", highlight: true },
  { id: "trial", name: "Starter Trial", price: 0.99, per: "", credits: 300, badge: "New users only", note: "A one-time starter pack for new customers. Can be bought once.", plan: "pro" },
];

export const PACKS = [
  { id: "pack_200", name: "Starter", credits: 200, price: 2.99 },
  { id: "pack_600", name: "Creator", credits: 600, price: 7.99 },
  { id: "pack_1500", name: "Studio", credits: 1500, price: 17.99 },
];

export const PRO_FEATURES = [
  "Unlimited exports: PDF, Word, PowerPoint, Excel",
  "No watermarks",
  "Slides, spreadsheets, writer and image agents",
  "Memory Center and saved chat history",
];

/** Free credits for a daily check-in. Set DAILY_CHECKIN_CREDITS=0 to turn it off (each credit costs you real OpenAI money). */
export const dailyCheckin = () => {
  const n = parseInt(process.env.DAILY_CHECKIN_CREDITS ?? "30", 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
};
export const MODE_LABEL = { docs: "Documents", writer: "General Writer", slides: "Slides Agent", sheets: "AI Spreadsheets", image: "AI Image" };
