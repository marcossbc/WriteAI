import ImageStudio from "@/components/ImageStudio";
export const metadata = { title: "AI Image — WriteAI" };
export default function Page() {
  return <ImageStudio defaultModel={process.env.OPENAI_IMAGE_MODEL || "gpt-image-1"} />;
}
