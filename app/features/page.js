import { InfoPage } from "@/components/Marketing";
import { TEMPLATES } from "@/lib/templates-data";
import { LANGS } from "@/lib/validate";
import { COSTS } from "@/lib/plans";

export const metadata = { title: "Features — WriteAI" };

export default function Page() {
  return (
    <InfoPage title="Features">
      <p><b>Document understanding.</b> Upload PDF, Word, PowerPoint, text or Markdown files (up to 15 MB each). WriteAI reads every page and slide before the AI writes a word.</p>
      <p><b>{TEMPLATES.length} ready-made templates.</b> Business, Academic, Creative and Career templates give the AI a clear structure: reports, proposals, study notes, resumes, scripts and more.</p>
      <p><b>Agents.</b> Create PowerPoint decks with the Slides Agent, Excel workbooks with AI Spreadsheets, text with the General Writer, and pictures with AI Image (including reference images).</p>
      <p><b>{LANGS.length} output languages.</b> Choose the language of the result, including English, Somali, Arabic, French, Spanish and Swahili.</p>
      <p><b>Chat history.</b> Every request is saved as a conversation you can reopen, search and continue.</p>
      <p><b>Memory Center.</b> Tell the AI what it should always know about you, and it uses it in every project.</p>
      <p><b>Export hub.</b> Download results as PDF, Word, PowerPoint, Excel, Markdown or PNG, depending on what you made.</p>
      <p><b>Credits.</b> You pay only for what you create: {COSTS.process} credits for a document, {COSTS.slides} for slides, {COSTS.sheets} for a spreadsheet, {COSTS.image} for an image. New accounts get 80 free credits.</p>
    </InfoPage>
  );
}
