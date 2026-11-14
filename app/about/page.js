import { InfoPage } from "@/components/Marketing";
export const metadata = { title: "About — WriteAI" };
export default function Page() {
  return (
    <InfoPage title="About WriteAI">
      <p>WriteAI helps people turn long, hard-to-read documents into clear results in the language they need.</p>
      <p>We built it with strong support for Somali, because good tools for Somali speakers are still rare.</p>
    </InfoPage>
  );
}
